import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NetworkPostCard } from './NetworkPostCard';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { AlertCircle, Loader2, RefreshCw, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfiniteScrollFeedProps {
  feedType?: 'all' | 'connections' | 'trending';
  className?: string;
}

export const InfiniteScrollFeed: React.FC<InfiniteScrollFeedProps> = ({
  feedType = 'all',
  className
}) => {
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop || document.documentElement.scrollTop;
        setShowScrollTop(scrollTop > 1000);
      }
    };

    const container = containerRef.current || window;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCommentClick = (postId: string) => {
    setOpenComments(openComments === postId ? null : postId);
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <Skeleton className="h-48 w-full mt-4 rounded-lg" />
            <div className="flex items-center gap-6 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error state
  if (isError) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load posts: {error?.message || 'Unknown error'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Initial loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl">📱</div>
              <h3 className="text-xl font-semibold">No posts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {feedType === 'connections'
                  ? "Connect with professionals to see posts from your network"
                  : feedType === 'trending'
                  ? "No trending posts available right now"
                  : "Be the first to share something with your network!"
                }
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <NetworkPostCard
            key={`${post.id}-${index}`}
            post={post}
            openComments={openComments}
            onCommentClick={handleCommentClick}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger & Load More */}
      <div ref={loadMoreRef} className="py-8">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading more posts...</span>
            </div>
            {/* Loading placeholder */}
            <div className="w-full max-w-2xl">
              <Card className="bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 animate-pulse">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : hasNextPage ? (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              className="px-8"
            >
              Load More Posts
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Or scroll down for automatic loading
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="h-px bg-border flex-1 w-20" />
              <span className="text-sm">You've reached the end of your feed</span>
              <div className="h-px bg-border flex-1 w-20" />
            </div>
            <Button
              variant="ghost"
              onClick={() => refetch()}
              className="mt-4 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh for new posts
            </Button>
          </div>
        ) : null}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg z-50"
          size="icon"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};