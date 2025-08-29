import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { feedOptimizer } from '@/utils/feedOptimization';

interface RocketPost {
  id: string;
  content: string;
  headline?: string;
  media_urls?: string[];
  created_at: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
  };
  // Optimized fields
  is_liked?: boolean;
  is_bookmarked?: boolean;
  optimized_media?: string[];
}

interface UseRocketFeedOptions {
  feedType: 'all' | 'smart' | 'trending';
  pageSize?: number;
  prefetchImages?: boolean;
  enableRealtime?: boolean;
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
}

export function useRocketFeed({
  feedType = 'all',
  pageSize = 15,
  prefetchImages = true,
  enableRealtime = true,
  cacheStrategy = 'aggressive'
}: UseRocketFeedOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const performanceRef = useRef({ startTime: 0, renders: 0 });
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
  const connectionIdsRef = useRef<Set<string>>(new Set());

  // Performance tracking
  useEffect(() => {
    performanceRef.current.startTime = performance.now();
    performanceRef.current.renders++;
  });

  // Pre-fetch user connections for smart feed
  const { data: userConnections } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectionIds = new Set<string>();
      data?.forEach(conn => {
        const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        connectionIds.add(otherId);
      });

      connectionIdsRef.current = connectionIds;
      return Array.from(connectionIds);
    },
    enabled: !!user && feedType === 'smart',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Main feed query with infinite loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['rocket-feed', feedType, user?.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      const startQueryTime = performance.now();
      
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          headline,
          media_urls,
          created_at,
          author_id,
          likes_count,
          comments_count,
          shares_count,
          profiles!posts_author_id_fkey (
            id,
            full_name,
            profile_picture_url,
            title,
            current_company
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(pageParam * pageSize, (pageParam as number + 1) * pageSize - 1);

      // Apply feed-specific filters
      if (feedType === 'smart' && connectionIdsRef.current.size > 0) {
        const connectionArray = Array.from(connectionIdsRef.current);
        query = query.or(`author_id.in.(${connectionArray.join(',')}),created_at.gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`);
      } else if (feedType === 'trending') {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        query = query
          .gte('created_at', threeDaysAgo.toISOString())
          .gte('likes_count', 5);
      }

      const { data: posts, error } = await query;
      
      if (error) throw error;

      // Optimize images and cache data
      const optimizedPosts = await Promise.all(
        (posts || []).map(async (post: any) => {
          const optimizedPost = {
            ...post,
            optimized_media: post.media_urls?.map((url: string) => 
              feedOptimizer.getOptimizedImageUrl(url, 800, 85)
            ),
            profiles: {
              ...post.profiles,
              profile_picture_url: post.profiles?.profile_picture_url 
                ? feedOptimizer.getOptimizedImageUrl(post.profiles.profile_picture_url, 100, 90)
                : null
            }
          };

          // Prefetch images if enabled
          if (prefetchImages && post.media_urls?.length > 0) {
            feedOptimizer.preloadNextBatch(pageParam * pageSize);
          }

          return optimizedPost;
        })
      );

      // Cache for performance
      if (cacheStrategy === 'aggressive') {
        feedOptimizer.setCacheData(`rocket-feed-${feedType}-${pageParam}`, optimizedPosts);
      }

      // Performance measurement
      const queryTime = performance.now() - startQueryTime;
      feedOptimizer.measurePerformance(`fetch-page-${pageParam}`, startQueryTime);

      return {
        posts: optimizedPosts,
        nextCursor: posts?.length === pageSize ? (pageParam as number) + 1 : undefined,
        performance: { queryTime, postsCount: posts?.length || 0 }
      };
    },
    getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
    enabled: !!user,
    staleTime: cacheStrategy === 'aggressive' ? 2 * 60 * 1000 : 30 * 1000,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Flatten all posts from pages
  const allPosts = useMemo(() => {
    const posts = data?.pages.flatMap((page: any) => page.posts) || [];
    
    // Apply optimistic updates
    return posts.map(post => {
      const optimisticUpdate = optimisticUpdates.get(post.id);
      return optimisticUpdate ? { ...post, ...optimisticUpdate } : post;
    });
  }, [data?.pages, optimisticUpdates]);

  // Optimistic updates for instant UI feedback
  const applyOptimisticUpdate = useCallback((postId: string, updates: Partial<RocketPost>) => {
    setOptimisticUpdates(prev => new Map(prev.set(postId, updates)));
    
    // Clear optimistic update after real update
    setTimeout(() => {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(postId);
        return newMap;
      });
    }, 2000);
  }, []);

  // Rocket-fast interactions
  const rocketLike = useCallback(async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Instant UI update
    applyOptimisticUpdate(postId, {
      is_liked: !post.is_liked,
      likes_count: post.likes_count + (post.is_liked ? -1 : 1)
    });

    // Background sync
    try {
      if (post.is_liked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user?.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user?.id });
      }
      
      // Refresh post data
      queryClient.invalidateQueries({ queryKey: ['rocket-feed'] });
    } catch (error) {
      console.error('Like failed:', error);
      // Revert optimistic update on error
      applyOptimisticUpdate(postId, {
        is_liked: post.is_liked,
        likes_count: post.likes_count
      });
    }
  }, [allPosts, applyOptimisticUpdate, user?.id, queryClient]);

  const rocketBookmark = useCallback(async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    // Instant UI update
    applyOptimisticUpdate(postId, {
      is_bookmarked: !post.is_bookmarked
    });

    // Background sync
    try {
      if (post.is_bookmarked) {
        await supabase.from('post_bookmarks').delete().eq('post_id', postId).eq('user_id', user?.id);
      } else {
        await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user?.id });
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
      applyOptimisticUpdate(postId, {
        is_bookmarked: post.is_bookmarked
      });
    }
  }, [allPosts, applyOptimisticUpdate, user?.id]);

  const rocketShare = useCallback(async (postId: string) => {
    // Instant UI feedback
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      applyOptimisticUpdate(postId, {
        shares_count: post.shares_count + 1
      });
    }

    // Background tracking
    try {
      await supabase.from('post_shares').insert({ 
        post_id: postId, 
        user_id: user?.id,
        shared_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Share tracking failed:', error);
    }
  }, [allPosts, applyOptimisticUpdate, user?.id]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!enableRealtime || !user) return;

    const channel = supabase
      .channel('rocket-feed-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        // Invalidate queries for fresh data
        queryClient.invalidateQueries({ queryKey: ['rocket-feed'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes'
      }, (payload) => {
        // Update like counts in real-time
        queryClient.invalidateQueries({ queryKey: ['rocket-feed'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user, queryClient]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const totalPosts = allPosts.length;
    const loadTime = performance.now() - performanceRef.current.startTime;
    const postsPerSecond = totalPosts / (loadTime / 1000);
    
    return {
      totalPosts,
      loadTime: Math.round(loadTime),
      postsPerSecond: Math.round(postsPerSecond * 100) / 100,
      renders: performanceRef.current.renders,
      cacheHits: feedOptimizer.getCacheStats().size
    };
  }, [allPosts.length]);

  return {
    posts: allPosts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    // Rocket-fast actions
    rocketLike,
    rocketBookmark,
    rocketShare,
    // Performance data
    performance: performanceMetrics,
    // Cache management
    clearCache: feedOptimizer.clearCache,
  };
}