import React, { useRef, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { NetworkPostCard } from './NetworkPostCard';
import { NewPostsBanner } from './NewPostsBanner';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getCustomStorageUrl } from '@/utils/storage';

interface EnhancedNetworkPostsFeedProps {
  feedType: 'all' | 'connections' | 'trending';
  searchTerm?: string;
}

// Error fallback component for the feed
const FeedErrorFallback = ({ error, resetErrorBoundary }: { error: any, resetErrorBoundary: () => void }) => (
  <div className="space-y-4">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Something went wrong loading the feed</span>
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
    <div className="bg-muted/30 rounded-lg p-8 text-center">
      <p className="text-muted-foreground">
        The network feed is temporarily unavailable. Please refresh the page or try again later.
      </p>
    </div>
  </div>
);

const EnhancedNetworkPostsFeedCore: React.FC<EnhancedNetworkPostsFeedProps> = ({
  feedType,
  searchTerm
}) => {
  const [openComments, setOpenComments] = React.useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteNetworkFeed({ 
    type: feedType === 'connections' ? 'connections' : feedType,
    searchTerm: searchTerm 
  });

  const posts = data?.pages.flatMap(page => page.data) || [];

  // Intersection observer for infinite scroll
  useEffect(() => {
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
          newPostsCount={0}
          isConnected={false}
          onRefresh={() => refetch()}
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
          newPostsCount={0}
          isConnected={false}
          onRefresh={() => refetch()}
        />
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="text-2xl">📱</div>
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                {feedType === 'connections'
                  ? "Connect with professionals to see posts from your network"
                  : feedType === 'trending'
                  ? "No trending posts available right now"
                  : "Be the first to share something with your network!"
                }
              </p>
              <Button variant="outline" onClick={() => refetch()}>
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
        newPostsCount={0}
        isConnected={true}
        onRefresh={() => refetch()}
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

      {/* Enhanced Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading more posts...</span>
            </div>
            {/* Loading preview */}
            <div className="w-full max-w-2xl">
              <Card className="bg-card/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : hasNextPage ? (
          <div className="text-center space-y-2">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              className="px-8"
            >
              Load More Posts
            </Button>
            <p className="text-xs text-muted-foreground">
              Or scroll down for automatic loading
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="h-px bg-border flex-1 w-20" />
              <span className="text-sm">You've reached the end of your feed</span>
              <div className="h-px bg-border flex-1 w-20" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Main component wrapped with error boundary
export const EnhancedNetworkPostsFeed: React.FC<EnhancedNetworkPostsFeedProps> = (props) => {
  return (
    <ErrorBoundary
      FallbackComponent={FeedErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Network feed error:', error);
        console.error('Error info:', errorInfo);
      }}
      onReset={() => {
        // Optional: perform any cleanup or state reset
        window.location.reload();
      }}
    >
      <EnhancedNetworkPostsFeedCore {...props} />
    </ErrorBoundary>
  );
};