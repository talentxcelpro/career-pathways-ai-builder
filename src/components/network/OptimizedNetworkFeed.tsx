import React, { memo } from 'react';
import { useOptimizedInfiniteScroll, fetchNetworkPosts } from '@/hooks/useOptimizedInfiniteScroll';
import { useAuth } from '@/contexts/AuthContext';
import { NetworkPostCard } from './NetworkPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { VirtualizedList } from '@/components/performance/VirtualizedList';

interface OptimizedNetworkFeedProps {
  feedType: 'all' | 'smart';
}

export const OptimizedNetworkFeed = memo<OptimizedNetworkFeedProps>(({ feedType }) => {
  const { user } = useAuth();
  
  const {
    items: posts,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    lastItemRef,
  } = useOptimizedInfiniteScroll({
    queryKey: ['network-posts-optimized', feedType, user?.id],
    fetchFunction: fetchNetworkPosts,
    enabled: true,
    pageSize: 15,
    threshold: 800,
    staleTime: 30000, // 30 seconds
    cacheTime: 600000, // 10 minutes
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">Failed to load posts</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts available yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          {feedType === 'smart' ? 'Your smart feed will appear here' : 'Connect with professionals to see their posts'}
        </p>
      </div>
    );
  }

  const renderPost = (post: any, index: number) => (
    <div ref={index === posts.length - 1 ? lastItemRef : null}>
      <NetworkPostCard 
        post={post}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Use virtualized list for better performance with large datasets */}
      {posts.length > 50 ? (
        <VirtualizedList
          items={posts}
          itemHeight={400} // Average post height
          containerHeight={600} // Visible area height
          renderItem={renderPost}
          className="bg-background"
          overscan={3}
        />
      ) : (
        // Regular rendering for smaller lists
        <>
          {posts.map((post, index) => (
            <div key={post.id} ref={index === posts.length - 1 ? lastItemRef : null}>
              <NetworkPostCard 
                post={post}
              />
            </div>
          ))}
        </>
      )}
      
      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* End indicator */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">You've reached the end</p>
        </div>
      )}
    </div>
  );
});

OptimizedNetworkFeed.displayName = 'OptimizedNetworkFeed';