import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useReelsData, useReelViewTracking } from '@/hooks/useReelsData';
import { VideoReelPlayer } from './VideoReelPlayer';
import { ReelEngagementActions } from './ReelEngagementActions';
import { ReelsCommentsModal } from '@/components/mobile/ReelsCommentsModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface InfiniteReelsFeedProps {
  onUploadClick?: () => void;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({
  onUploadClick
}) => {
  const { user } = useAuth();
  const { trackView } = useReelViewTracking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedReelForComments, setSelectedReelForComments] = useState<any>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<Record<string, HTMLDivElement>>({});

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useReelsData();

  // Flatten all pages
  const reels = data?.pages?.flat() || [];

  // Infinite scroll hook
  const { isFetching: isScrollFetching } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    fetchNextPage: () => fetchNextPage(),
    threshold: 1000
  });

  // Track views when reel becomes active
  useEffect(() => {
    if (reels[currentIndex]) {
      const currentReel = reels[currentIndex];
      trackView(currentReel.id, 2); // Track after 2 seconds of view
    }
  }, [currentIndex, reels, trackView]);

  // Handle scroll-based navigation
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Determine which reel is currently in view
    const newIndex = Math.round(scrollTop / containerHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }

    // Load more when approaching the end
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      scrollTop + containerHeight >= container.scrollHeight - 1000
    ) {
      fetchNextPage();
    }
  }, [currentIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleReelLike = (reelId: string) => {
    // Handled by ReelEngagementActions
  };

  const handleComment = (reel: any) => {
    setSelectedReelForComments(reel);
    setShowCommentsModal(true);
  };

  const handleViewProgress = (reelId: string, progress: number) => {
    // Track view progress for analytics
    if (progress > 5) { // More than 5 seconds watched
      trackView(reelId, progress);
    }
  };

  if (!user) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join TalentXcel</h2>
          <p className="text-white/80 mb-6">Sign in to discover career-focused reels</p>
          <Button className="bg-primary text-primary-foreground">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm">Loading career reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="mb-4">Unable to load reels</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">No reels yet</h2>
          <p className="mb-4 text-white/80">Be the first to share career content!</p>
          {onUploadClick && (
            <Button onClick={onUploadClick} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Reel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-screen bg-black overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">Career Reels</span>
              <Badge variant="secondary" className="text-xs">
                {currentIndex + 1}/{reels.length}
              </Badge>
            </div>
            {onUploadClick && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={onUploadClick}
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Reels container */}
        <div
          ref={containerRef}
          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              ref={(el) => el && (reelRefs.current[reel.id] = el)}
              className="relative w-full h-screen snap-start flex-shrink-0"
            >
              {/* Video Player */}
              <VideoReelPlayer
                src={reel.video_url}
                isActive={index === currentIndex}
                onDoubleClick={() => handleReelLike(reel.id)}
                onViewProgress={(progress) => handleViewProgress(reel.id, progress)}
                className="absolute inset-0"
              />

              {/* Content overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* User info */}
                <div className="absolute bottom-20 left-4 right-20 pointer-events-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={reel.user_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {reel.user_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">
                        {reel.user_name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {new Date(reel.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="mb-2">
                    <h3 className="text-white font-bold text-sm mb-1">
                      {reel.title}
                    </h3>
                    {reel.description && (
                      <p className="text-white/90 text-sm line-clamp-2">
                        {reel.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {reel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reel.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs bg-white/20 text-white border-0"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Engagement actions */}
                <div className="absolute bottom-32 right-4 pointer-events-auto">
                  <ReelEngagementActions
                    reel={reel}
                    onComment={() => handleComment(reel)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {(isFetchingNextPage || isScrollFetching) && (
            <div className="h-screen flex items-center justify-center bg-black">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm">Loading more reels...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      {selectedReelForComments && (
        <ReelsCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedReelForComments(null);
          }}
          postId={selectedReelForComments.id}
          postAuthor={selectedReelForComments.user_name}
        />
      )}
    </>
  );
};