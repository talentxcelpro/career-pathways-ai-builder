
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useReelsData } from '@/hooks/useReelsData';
import { ReelCard } from './ReelCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface InfiniteReelsFeedProps {
  onUploadClick?: () => void;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({
  onUploadClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useReelsData();

  const reels = data?.pages.flat() || [];

  // Auto-fetch more content when approaching the end
  useEffect(() => {
    if (currentIndex >= reels.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle scroll navigation
  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (isScrolling) return;

    setIsScrolling(true);
    
    if (direction === 'down' && currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Allow scrolling again after animation
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 500);
  }, [currentIndex, reels.length, isScrolling]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    }
  }, [touchStartY, handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleScroll('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleScroll('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScroll]);

  // Wheel navigation for desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) > 10) {
      handleScroll(e.deltaY > 0 ? 'down' : 'up');
    }
  }, [handleScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleComment = useCallback(() => {
    toast.info('Comments feature coming soon!');
  }, []);

  const handleRefresh = useCallback(() => {
    setCurrentIndex(0);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Unable to load reels</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">No reels available</p>
          {onUploadClick && (
            <Button onClick={onUploadClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Reel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden bg-black relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reels Container */}
      <div
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`
        }}
      >
        {reels.map((reel, index) => (
          <div key={reel.id} className="w-full h-screen">
            <ReelCard
              reel={reel}
              isActive={index === currentIndex}
              onComment={handleComment}
            />
          </div>
        ))}
      </div>

      {/* Upload Button */}
      {onUploadClick && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={onUploadClick}
            size="icon"
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/70 rounded-full px-3 py-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-white text-sm">Loading more...</span>
          </div>
        </div>
      )}

      {/* Progress Indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-40">
        {reels.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
          const actualIndex = Math.max(0, currentIndex - 2) + index;
          return (
            <div
              key={actualIndex}
              className={`w-1 h-8 rounded-full transition-all duration-300 ${
                actualIndex === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/30'
              }`}
            />
          );
        })}
      </div>

      {/* Navigation Instructions (for desktop) */}
      <div className="absolute bottom-4 left-4 text-white/70 text-xs hidden md:block">
        <p>Use arrow keys or scroll to navigate</p>
      </div>
    </div>
  );
};
