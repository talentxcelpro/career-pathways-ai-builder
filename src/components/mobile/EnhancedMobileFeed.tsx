import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Eye, RefreshCw } from 'lucide-react';
import { EnhancedSwipeableCard } from './EnhancedSwipeableCard';
import { LinkedInStyleSuggestions } from './LinkedInStyleSuggestions';
import { useNetworkEngagement } from '@/hooks/useNetworkEngagement';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useInfiniteNetworkFeed, NetworkPost } from '@/hooks/useInfiniteNetworkFeed';
import { VirtualizedNetworkFeed } from '@/components/performance/VirtualizedNetworkFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  engagement_score: number;
  type: 'text' | 'image' | 'video' | 'article' | 'job' | 'event';
}

interface EnhancedMobileFeedProps {
  className?: string;
}

export const EnhancedMobileFeed: React.FC<EnhancedMobileFeedProps> = ({ className = '' }) => {
  const [filter, setFilter] = useState<'all' | 'connections' | 'trending'>('all');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteNetworkFeed({ type: filter });
  
  const { sharePost } = useNetworkEngagement();
  const { sync, isOnline } = useRealtimeSync();
  const { triggerHaptic } = useHapticFeedback();

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap(page => page.data) || [];

  const handleLike = useCallback(async (postId: string) => {
    triggerHaptic('light');
    await sync('posts', { action: 'like', postId });
    // Optimistically update local state
    await refetch();
  }, [sync, triggerHaptic, refetch]);

  const handleSave = useCallback(async (postId: string) => {
    triggerHaptic('medium');
    await sync('posts', { action: 'save', postId });
    toast.success('Post saved to bookmarks');
    await refetch();
  }, [sync, triggerHaptic, refetch]);

  const handleShare = useCallback(async (post: NetworkPost) => {
    try {
      await sharePost(post.id, post.author_id);
      await refetch();
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [sharePost, refetch]);

  const handleSwipeLeft = useCallback((postId: string) => {
    triggerHaptic('medium');
    handleSave(postId);
  }, [handleSave, triggerHaptic]);

  const handleSwipeRight = useCallback((postId: string) => {
    triggerHaptic('light');
    handleLike(postId);
  }, [handleLike, triggerHaptic]);

  // Use intersection observer to trigger load more
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const PostCard: React.FC<{ post: NetworkPost }> = ({ post }) => (
    <EnhancedSwipeableCard
      onSwipeLeft={() => handleSwipeLeft(post.id)}
      onSwipeRight={() => handleSwipeRight(post.id)}
      onDoubleTap={() => handleLike(post.id)}
      className="mb-3"
    >
      <Card className="mx-4 bg-card border-border/50 shadow-sm">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={post.profiles?.profile_picture_url} alt={post.profiles?.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {post.profiles?.full_name || 'Unknown User'}
                </p>
                {post.profiles?.is_verified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {post.profiles?.title || 'Professional'}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative mb-3">
            <img 
              src={post.media_urls[0]} 
              alt="Post content" 
              className="w-full aspect-video object-cover bg-muted"
              loading="lazy"
            />
            {post.post_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-primary border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes_count || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments_count || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.shares_count || 0}</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-primary font-medium">
                {Math.round(((post.likes_count || 0) + (post.comments_count || 0)) / 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 ${(post as any).isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`w-4 h-4 ${(post as any).isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(post)}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(post.id)}
            className={`flex items-center space-x-2 ${(post as any).isSaved ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${(post as any).isSaved ? 'fill-current' : ''}`} />
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </Card>
    </EnhancedSwipeableCard>
  );

  return (
    <div className={`${className} bg-background`}>
      {/* Suggested Connections */}
      <LinkedInStyleSuggestions />

      {/* Posts Feed */}
      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="mx-4 p-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">Failed to load posts</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="pb-6">
          {posts.map((post, index) => (
            <div key={post.id} className="mb-3">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      <div ref={loadMoreRef} className="px-4 pb-4">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading more posts...</span>
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            You've reached the end!
          </p>
        )}
      </div>
    </div>
  );
};