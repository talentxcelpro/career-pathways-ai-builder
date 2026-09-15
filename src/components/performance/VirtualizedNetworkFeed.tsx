import React, { memo, useMemo, useCallback } from 'react';
import { VirtualizedList } from '@/components/performance/VirtualizedList';
import { PostCard } from '@/components/network/PostCard';
import { NetworkPost } from '@/hooks/useInfiniteNetworkFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface VirtualizedNetworkFeedProps {
  posts: NetworkPost[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  className?: string;
}

const ITEM_HEIGHT = 400; // Approximate height of a post card
const CONTAINER_HEIGHT = 600; // Visible area height

export const VirtualizedNetworkFeed = memo<VirtualizedNetworkFeedProps>(({
  posts,
  isLoading,
  isError,
  error,
  loadMoreRef,
  isFetchingNextPage,
  onRefresh,
  className
}) => {
  const renderPost = useCallback((post: NetworkPost, index: number) => (
    <div key={post.id} className="p-2">
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
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
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
            <span>Failed to load posts: {error?.message || 'Unknown error'}</span>
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
          <p className="text-muted-foreground mb-4">No posts to show</p>
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
      <VirtualizedList
        items={memoizedPosts}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={renderPost}
        className="w-full"
        overscan={2}
      />
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4 text-center">
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

VirtualizedNetworkFeed.displayName = 'VirtualizedNetworkFeed';