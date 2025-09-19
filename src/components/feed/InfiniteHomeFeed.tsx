import React, { memo, useMemo, useCallback } from 'react';
import { VirtualizedList } from '@/components/performance/VirtualizedList';
import { PostCard } from '@/components/network/PostCard';
import { NetworkPost } from '@/hooks/useInfiniteNetworkFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InfiniteHomeFeedProps {
  posts: NetworkPost[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  className?: string;
  showHeader?: boolean;
}

const ITEM_HEIGHT = 450; // Slightly larger for home feed
const CONTAINER_HEIGHT = 800; // Larger container for home

export const InfiniteHomeFeed = memo<InfiniteHomeFeedProps>(({
  posts,
  isLoading,
  isError,
  error,
  loadMoreRef,
  isFetchingNextPage,
  onRefresh,
  className,
  showHeader = true
}) => {
  const renderPost = useCallback((post: NetworkPost, index: number) => (
    <div key={post.id} className="p-3">
      <PostCard 
        post={{
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          media_urls: post.media_urls,
          tags: post.tags,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          author_id: post.author_id,
          profiles: post.profiles
        }}
      />
    </div>
  ), []);

  const memoizedPosts = useMemo(() => posts, [posts]);

  if (isLoading && memoizedPosts.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-white">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load feed: {error?.message || 'Unknown error'}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (memoizedPosts.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <div className="mb-4">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No posts yet</p>
            <p className="text-sm text-muted-foreground mb-4">Be the first to share something with your network</p>
          </div>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Feed
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {memoizedPosts.length} posts
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Latest updates from your network and trending content
            </p>
          </CardHeader>
        </Card>
      )}
      
      <VirtualizedList
        items={memoizedPosts}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={renderPost}
        className="w-full"
        overscan={3}
      />
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-6 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Loading more posts...</span>
          </div>
        )}
      </div>
    </div>
  );
});

InfiniteHomeFeed.displayName = 'InfiniteHomeFeed';