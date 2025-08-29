import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Zap } from 'lucide-react';
import { useRocketFeed } from '@/hooks/useRocketFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { FastImageLoader } from '@/components/performance/FastImageLoader';
import { cn } from '@/lib/utils';

interface RocketFeedProps {
  feedType?: 'all' | 'smart' | 'trending';
  className?: string;
}

// Memoized post card for maximum performance
const RocketPostCard = memo<{
  post: any;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (postId: string) => void;
}>(({ post, onLike, onBookmark, onShare }) => {
  const handleLike = useCallback(() => onLike(post.id), [post.id, onLike]);
  const handleBookmark = useCallback(() => onBookmark(post.id), [post.id, onBookmark]);
  const handleShare = useCallback(() => onShare(post.id), [post.id, onShare]);

  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(post.created_at).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }, [post.created_at]);

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage 
              src={post.profiles?.profile_picture_url} 
              alt={post.profiles?.full_name}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {post.profiles?.full_name || 'Anonymous'}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {timeAgo}
              </Badge>
            </div>
            
            {post.profiles?.title && (
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles.title}
                {post.profiles?.current_company && ` at ${post.profiles.current_company}`}
              </p>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {post.headline && (
          <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {post.headline}
          </h2>
        )}
        
        {post.content && (
          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.optimized_media && post.optimized_media.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <FastImageLoader
              src={post.optimized_media[0]}
              alt="Post media"
              className="w-full"
              aspectRatio="16/9"
              priority={false}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 px-3 gap-2 transition-all duration-200",
                post.is_liked 
                  ? "text-red-500 bg-red-50 hover:bg-red-100" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-4 w-4", post.is_liked && "fill-current")} />
              <span className="text-sm font-medium">{post.likes_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-3 gap-2 text-muted-foreground hover:text-green-500 hover:bg-green-50 transition-all duration-200"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">{post.shares_count}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={cn(
              "h-8 w-8 p-0 transition-all duration-200",
              post.is_bookmarked 
                ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" 
                : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50"
            )}
          >
            <Bookmark className={cn("h-4 w-4", post.is_bookmarked && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

RocketPostCard.displayName = 'RocketPostCard';

// Loading skeleton for ultra-smooth experience
const PostSkeleton = memo(() => (
  <Card className="bg-card/95 backdrop-blur-sm animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-3 bg-muted rounded w-48" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
      <div className="h-48 bg-muted rounded mb-4" />
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
        </div>
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </CardContent>
  </Card>
));

PostSkeleton.displayName = 'PostSkeleton';

export const RocketFeed: React.FC<RocketFeedProps> = ({ 
  feedType = 'all',
  className 
}) => {
  const {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    rocketLike,
    rocketBookmark,
    rocketShare,
    performance,
    clearCache
  } = useRocketFeed({
    feedType,
    pageSize: 15,
    prefetchImages: true,
    enableRealtime: true,
    cacheStrategy: 'aggressive'
  });

  // Infinite scroll with optimized threshold
  const { isFetching } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    threshold: 1000 // Start loading before user reaches bottom
  });

  const handleRetry = useCallback(() => {
    clearCache();
    window.location.reload();
  }, [clearCache]);

  if (error) {
    return (
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">⚠️ Feed temporarily unavailable</div>
          <p className="text-sm text-muted-foreground mb-4">
            We're experiencing high traffic. Please try again.
          </p>
          <Button onClick={handleRetry} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>

      {/* Posts */}
      {posts.map((post) => (
        <RocketPostCard
          key={post.id}
          post={post}
          onLike={rocketLike}
          onBookmark={rocketBookmark}
          onShare={rocketShare}
        />
      ))}

      {/* Loading states */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Infinite scroll loading */}
      {(isFetchingNextPage || isFetching) && hasNextPage && (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <PostSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {/* End of feed */}
      {!hasNextPage && posts.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🎉 You're all caught up! Check back later for new posts.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Ready for launch!</h3>
            <p className="text-muted-foreground">
              {feedType === 'smart' 
                ? "Your personalized feed will appear here as you connect with more professionals."
                : "Be the first to share something with your network!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};