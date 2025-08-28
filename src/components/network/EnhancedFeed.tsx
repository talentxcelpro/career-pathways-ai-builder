import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeEngagement } from '@/hooks/useRealtimeEngagement';
import { formatTimeAgo } from '@/utils/dateUtils';
import { NewPostComposer } from './NewPostComposer';
import { toast } from 'sonner';

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  profiles: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
    pro_status?: string;
  };
}

interface EnhancedFeedProps {
  feedType?: 'all' | 'following' | 'trending';
}

export const EnhancedFeed: React.FC<EnhancedFeedProps> = ({ feedType = 'all' }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);
  
  // Real-time engagement tracking
  const engagement = useRealtimeEngagement('network');

  // Fetch posts with pagination
  const { data: posts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-feed', feedType],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            id, full_name, profile_picture_url, title, current_company, pro_status
          ),
          post_likes!left (id, user_id),
          post_comments!left (id),
          post_shares!left (id)
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (feedType === 'following') {
        // Get user's connections
        const { data: connections } = await supabase
          .from('connections')
          .select('requester_id, recipient_id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');

        const connectionIds = new Set<string>();
        connections?.forEach(conn => {
          if (conn.requester_id === user.id) connectionIds.add(conn.recipient_id);
          if (conn.recipient_id === user.id) connectionIds.add(conn.requester_id);
        });

        if (connectionIds.size > 0) {
          query = query.in('author_id', Array.from(connectionIds));
        } else {
          return []; // No connections
        }
      } else if (feedType === 'trending') {
        // Get trending posts (posts with high engagement in last 24h)
        query = query
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('likes_count', { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      // Transform data
      return data.map(post => ({
        ...post,
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        shares_count: post.post_shares?.length || 0,
        is_liked: post.post_likes?.some(like => like.user_id === user.id) || false
      })) as FeedPost[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Listen for real-time updates
  useEffect(() => {
    if (engagement.isConnected && engagement.events.length > 0) {
      const latestEvent = engagement.events[engagement.events.length - 1];
      
      // Show toast for new engagement
      if (latestEvent.event_type === 'like') {
        toast.success('Someone liked your post!');
      }
      
      // Update posts count for new posts indicator
      if (latestEvent.event_type === 'post_created') {
        setNewPostsAvailable(prev => prev + 1);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['enhanced-feed'] });
    }
  }, [engagement.events.length, engagement.isConnected, queryClient, user?.id]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      // Optimistically update UI
      queryClient.setQueryData(['enhanced-feed', feedType], (oldData: FeedPost[] | undefined) =>
        oldData?.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                is_liked: !p.is_liked,
                likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/network/posts/${postId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const refreshFeed = () => {
    setNewPostsAvailable(0);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <NewPostComposer onPostCreated={() => refetch()} />
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Posts Indicator */}
      {newPostsAvailable > 0 && (
        <Card className="bg-primary/5 border-primary/20 cursor-pointer" onClick={refreshFeed}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                {newPostsAvailable} new post{newPostsAvailable > 1 ? 's' : ''} available
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Updates Indicator */}
      {engagement.isConnected && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            Live updates active
          </Badge>
        </div>
      )}

      {/* Post Composer */}
      <NewPostComposer onPostCreated={() => refetch()} />

      {/* Feed Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="bg-card/95 backdrop-blur-sm border-border/60 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.profiles.profile_picture_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.profiles.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {post.profiles.full_name || 'Professional User'}
                    </h4>
                    {post.profiles.pro_status === 'active' && (
                      <Badge variant="secondary" className="text-xs">PRO</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {post.profiles.title || post.profiles.current_company || 'Professional'}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Content */}
            {post.headline && (
              <h3 className="font-medium text-foreground mb-2">{post.headline}</h3>
            )}
            <div className="text-sm text-foreground mb-4 leading-relaxed">
              {post.content}
            </div>

            {/* Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={post.media_urls[0]} 
                  alt="Post media"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            {(post.likes_count > 0 || post.comments_count > 0) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-3 border-b border-border/60">
                <div className="flex items-center space-x-4">
                  {post.likes_count > 0 && (
                    <span>{post.likes_count} like{post.likes_count > 1 ? 's' : ''}</span>
                  )}
                  {post.comments_count > 0 && (
                    <span>{post.comments_count} comment{post.comments_count > 1 ? 's' : ''}</span>
                  )}
                </div>
                {post.shares_count > 0 && (
                  <span>{post.shares_count} share{post.shares_count > 1 ? 's' : ''}</span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`${post.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShare(post.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      {posts.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => refetch()}>
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
};