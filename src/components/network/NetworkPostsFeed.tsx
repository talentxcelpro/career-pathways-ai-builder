import React, { useState, useEffect, useCallback } from 'react';
import { NetworkPostCard } from './NetworkPostCard';
import { RealtimeFeedUpdates } from './RealtimeFeedUpdates';
import { useNetworkPosts } from '@/hooks/useNetworkPosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const NetworkPostsFeed: React.FC = () => {
  const [openComments, setOpenComments] = useState<string | null>(null);
  
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    error,
    refetch
  } = useNetworkPosts();

  // Set up infinite scroll
  const { isFetching } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    fetchNextPage: loadMore,
    threshold: 500, // Start loading when 500px from bottom
  });

  const handleCommentClick = useCallback((postId: string) => {
    setOpenComments(current => current === postId ? null : postId);
  }, []);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error('Failed to load posts. Please try again.');
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load posts</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">No posts found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to share something with the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Feed Updates */}
      <RealtimeFeedUpdates onRefreshFeed={refetch} />
      
      {/* Posts with smooth animations */}
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: "easeOut"
            }}
            layout
          >
            <NetworkPostCard
              post={post}
              openComments={openComments}
              onCommentClick={handleCommentClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading more indicator */}
      {(isFetchingNextPage || isFetching) && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading more posts...</p>
          </div>
        </div>
      )}

      {/* No more posts indicator */}
      {!hasNextPage && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the feed
          </p>
        </div>
      )}

      {/* Manual load more button (fallback) */}
      {hasNextPage && !isFetchingNextPage && !isFetching && (
        <div className="flex justify-center py-4">
          <Button 
            onClick={loadMore}
            variant="outline"
            className="px-8"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};