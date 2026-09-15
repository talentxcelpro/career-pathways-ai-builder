import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

interface NetworkStats {
  totalPosts: number;
  totalGroups: number;
  totalEvents: number;
  reportedContent: number;
  activeUsers: number;
  engagementRate: number;
  realTimeUpdates: number;
}

interface EngagementMetrics {
  postId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementScore: number;
}

interface TrendingTopic {
  tag: string;
  count: number;
  growth: number;
  isRising: boolean;
}

interface ModerationAction {
  id: string;
  postId: string;
  action: 'approve' | 'reject' | 'flag' | 'warn';
  reason: string;
  adminId: string;
  createdAt: string;
}

export const useRealtimeNetworkManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationFilter, setModerationFilter] = useState<string>('all');
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics[]>([]);
  const [realTimeActivity, setRealTimeActivity] = useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Real-time channels
  const [postsChannel, setPostsChannel] = useState<RealtimeChannel | null>(null);
  const [engagementChannel, setEngagementChannel] = useState<RealtimeChannel | null>(null);

  // Setup real-time subscriptions
  useEffect(() => {
    console.log('Setting up real-time network management subscriptions...');

    // Posts real-time updates
    const postsSubscription = supabase
      .channel('network-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Real-time post change:', payload);
          
          // Add to real-time activity feed
          setRealTimeActivity(prev => [{
            id: Date.now(),
            type: payload.eventType === 'INSERT' ? 'new_post' : payload.eventType === 'DELETE' ? 'post_deleted' : 'post_updated',
            data: payload.new || payload.old,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 49)]); // Keep last 50 activities

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
          queryClient.invalidateQueries({ queryKey: ['network-stats'] });
          queryClient.invalidateQueries({ queryKey: ['trending-topics'] });
          
          // Show toast notification for new posts
          if (payload.eventType === 'INSERT') {
            toast.info('New post published', {
              description: 'A new post has been added to the network'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments'
        },
        (payload) => {
          console.log('Real-time comment change:', payload);
          
          setRealTimeActivity(prev => [{
            id: Date.now(),
            type: payload.eventType === 'INSERT' ? 'new_comment' : 'comment_updated',
            data: payload.new || payload.old,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 49)]);

          queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          console.log('Real-time like change:', payload);
          
          setRealTimeActivity(prev => [{
            id: Date.now(),
            type: 'post_reaction',
            data: payload.new || payload.old,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 49)]);

          queryClient.invalidateQueries({ queryKey: ['engagement-metrics'] });
        }
      )
      .subscribe();

    setPostsChannel(postsSubscription);

    // User presence for active users tracking
    const presenceChannel = supabase.channel('network-presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        console.log('Active users sync:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined network:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left network:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            user_type: 'admin'
          });
        }
      });

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(presenceChannel);
    };
  }, [queryClient]);

  // Enhanced posts query with real-time updates
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', searchTerm, moderationFilter],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(full_name, profile_picture_url, email),
          post_comments(
            id,
            content,
            created_at,
            profiles!post_comments_user_id_fkey(full_name)
          ),
          post_likes(
            id,
            user_id,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`content.ilike.%${searchTerm}%,headline.ilike.%${searchTerm}%`);
      }

      // Apply moderation filters
      if (moderationFilter === 'flagged') {
        query = query.eq('is_flagged', true);
      } else if (moderationFilter === 'pending') {
        query = query.eq('moderation_status', 'pending');
      } else if (moderationFilter === 'approved') {
        query = query.eq('moderation_status', 'approved');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Calculate engagement metrics for each post
      return data.map(post => ({
        ...post,
        engagementMetrics: {
          viewCount: post.views_count || 0,
          likeCount: post.post_likes?.length || 0,
          commentCount: post.post_comments?.length || 0,
          shareCount: post.reshare_count || 0,
          engagementScore: calculateEngagementScore(post)
        }
      }));
    },
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Enhanced network stats with real-time metrics
  const { data: networkStats } = useQuery({
    queryKey: ['network-stats'],
    queryFn: async () => {
      const [
        { count: totalPosts },
        { count: totalGroups },
        { count: totalEvents },
        { count: reportedContent },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_login_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Calculate engagement rate
      const engagementRate = posts ? calculateAverageEngagement(posts) : 0;

      return {
        totalPosts: totalPosts || 0,
        totalGroups: totalGroups || 0,
        totalEvents: totalEvents || 0,
        reportedContent: reportedContent || 0,
        activeUsers: activeUsers || 0,
        engagementRate,
        realTimeUpdates: realTimeActivity.length
      } as NetworkStats;
    }
  });

  // Real-time trending topics with growth tracking
  const { data: trendingTopics } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get current tags
      const { data: currentPosts } = await supabase
        .from('posts')
        .select('tags')
        .not('tags', 'is', null)
        .gte('created_at', yesterday.toISOString())
        .limit(500);

      // Get previous day tags for comparison
      const { data: previousPosts } = await supabase
        .from('posts')
        .select('tags')
        .not('tags', 'is', null)
        .gte('created_at', new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', yesterday.toISOString())
        .limit(500);

      // Count current tags
      const currentTagCounts: Record<string, number> = {};
      currentPosts?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          currentTagCounts[tag] = (currentTagCounts[tag] || 0) + 1;
        });
      });

      // Count previous tags
      const previousTagCounts: Record<string, number> = {};
      previousPosts?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          previousTagCounts[tag] = (previousTagCounts[tag] || 0) + 1;
        });
      });

      // Calculate growth and trending topics
      const trendingData: TrendingTopic[] = Object.entries(currentTagCounts)
        .map(([tag, currentCount]) => {
          const previousCount = previousTagCounts[tag] || 0;
          const growth = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 100;
          
          return {
            tag: `#${tag}`,
            count: currentCount,
            growth,
            isRising: growth > 20 // Consider rising if 20% growth
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return trendingData;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Bulk moderation actions
  const bulkModerationMutation = useMutation({
    mutationFn: async ({ 
      postIds, 
      action, 
      reason 
    }: { 
      postIds: string[]; 
      action: 'approve' | 'reject' | 'flag' | 'delete'; 
      reason: string;
    }) => {
      console.log(`Performing bulk ${action} on ${postIds.length} posts:`, reason);

      const updates: any = {
        moderation_status: action === 'delete' ? 'deleted' : action,
        moderation_reason: reason,
        moderated_at: new Date().toISOString(),
        moderated_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (action === 'flag') {
        updates.is_flagged = true;
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .in('id', postIds);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .update(updates)
          .in('id', postIds);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action, postIds }) => {
      toast.success(`Successfully ${action}ed ${postIds.length} posts`);
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSelectedPosts([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to perform bulk action');
    }
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete post');
    }
  });

  // Helper functions
  const calculateEngagementScore = (post: any): number => {
    const likes = post.post_likes?.length || 0;
    const comments = post.post_comments?.length || 0;
    const shares = post.reshare_count || 0;
    const views = post.views_count || 1;
    
    return Math.round(((likes * 1 + comments * 2 + shares * 3) / views) * 100);
  };

  const calculateAverageEngagement = (posts: any[]): number => {
    if (!posts || posts.length === 0) return 0;
    
    const totalEngagement = posts.reduce((sum, post) => 
      sum + calculateEngagementScore(post), 0
    );
    
    return Math.round(totalEngagement / posts.length);
  };

  const handleDeletePost = (postId: string) => {
    deletePost.mutate(postId);
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'flag' | 'delete', reason: string) => {
    if (selectedPosts.length === 0) {
      toast.error('Please select posts to moderate');
      return;
    }
    
    bulkModerationMutation.mutate({ 
      postIds: selectedPosts, 
      action, 
      reason 
    });
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const selectAllPosts = () => {
    if (!posts) return;
    setSelectedPosts(posts.map(post => post.id));
  };

  const clearSelection = () => {
    setSelectedPosts([]);
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    moderationFilter,
    setModerationFilter,
    selectedPosts,
    realTimeActivity,
    
    // Data
    posts,
    networkStats,
    trendingTopics,
    engagementMetrics,
    
    // Loading states
    isLoading: postsLoading,
    isBulkActionLoading: bulkModerationMutation.isPending,
    
    // Actions
    handleDeletePost,
    handleBulkAction,
    togglePostSelection,
    selectAllPosts,
    clearSelection
  };
};