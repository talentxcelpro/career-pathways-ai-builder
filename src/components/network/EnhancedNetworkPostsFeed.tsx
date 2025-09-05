import React from 'react';
import { NetworkPostCard } from './NetworkPostCard';
import { NewPostsBanner } from './NewPostsBanner';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface EnhancedNetworkPostsFeedProps {
  feedType: 'all' | 'smart' | 'trending';
}

export const EnhancedNetworkPostsFeed: React.FC<EnhancedNetworkPostsFeedProps> = ({
  feedType
}) => {
  const [openComments, setOpenComments] = React.useState<string | null>(null);
  
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteNetworkFeed({ type: feedType });

  const posts = data?.pages.flatMap(page => page.data) || [];

  const handleCommentClick = (postId: string) => {
    setOpenComments(openComments === postId ? null : postId);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-32 w-full mt-4 rounded-lg" />
            <div className="flex items-center gap-4 mt-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <NewPostsBanner 
          newPostsCount={newPostsAvailable}
          isConnected={realtimeConnected}
          onRefresh={refreshFeed}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load posts: {error?.message || 'Unknown error'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Initial loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <NewPostsBanner 
          newPostsCount={0}
          isConnected={false}
          onRefresh={() => {}}
        />
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="space-y-4">
        <NewPostsBanner 
          newPostsCount={newPostsAvailable}
          isConnected={realtimeConnected}
          onRefresh={refreshFeed}
        />
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="text-2xl">📱</div>
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                {feedType === 'smart' 
                  ? "Connect with professionals to see posts in your smart feed"
                  : feedType === 'trending'
                  ? "No trending posts available right now"
                  : "Be the first to share something with your network!"
                }
              </p>
              <Button variant="outline" onClick={refreshFeed}>
                Refresh feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Posts Banner */}
      <NewPostsBanner 
        newPostsCount={newPostsAvailable}
        isConnected={realtimeConnected}
        onRefresh={refreshFeed}
      />

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <NetworkPostCard
            key={post.id}
            post={post}
            openComments={openComments}
            onCommentClick={handleCommentClick}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more posts...</span>
          </div>
        ) : hasNextPage ? (
          <div className="text-sm text-muted-foreground">
            Scroll down for more posts
          </div>
        ) : posts.length > 0 ? (
          <div className="text-sm text-muted-foreground">
            You've reached the end of your feed
          </div>
        ) : null}
      </div>
    </div>
  );
};