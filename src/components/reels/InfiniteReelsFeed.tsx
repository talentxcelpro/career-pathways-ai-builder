
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReelsData } from '@/hooks/useReelsData';
import { ReelCard } from './ReelCard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw } from 'lucide-react';
import { useIntersectionObserverCallback } from '@/hooks/useIntersectionObserver';

interface InfiniteReelsFeedProps {
  onUploadClick: () => void;
  feedType?: 'following' | 'explore';
  className?: string;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({
  onUploadClick,
  feedType = 'explore',
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useReelsData();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTargets = useRef<Map<number, HTMLDivElement>>(new Map());

  // Flatten all pages into a single array of reels
  const reels = data?.pages.flat() || [];

  // Load more reels when approaching the end
  const [loadMoreRef] = useIntersectionObserverCallback(
    { threshold: 0.1 },
    useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  );

  // Set up intersection observer for each reel to track which one is active
  useEffect(() => {
    if (!containerRef.current || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setActiveIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6, // Reel is considered active when 60% visible
        rootMargin: '-20% 0px'
      }
    );

    // Observe all reel elements
    observerTargets.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [reels.length]);

  const setObserverRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      observerTargets.current.set(index, el);
    } else {
      observerTargets.current.delete(index);
    }
  }, []);

  // Handle scroll to ensure reels snap properly
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, reels.length]);

  const handleRefresh = useCallback(() => {
    setActiveIndex(0);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p>Loading amazing reels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white text-center p-6">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-semibold">Oops! Something went wrong</h3>
          <p className="text-gray-300 mb-6">We couldn't load the reels right now</p>
          <Button 
            onClick={handleRefresh} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!reels.length) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-white text-center p-6">
          <div className="text-8xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold mb-2">No Reels Yet!</h3>
          <p className="text-gray-300 mb-6 max-w-sm">
            Be the first to share your career journey or professional insights
          </p>
          <Button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
          >
            <Upload className="mr-2 h-5 w-5" />
            Create Your First Reel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide",
        className
      )}
      onScroll={handleScroll}
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          ref={setObserverRef(index)}
          data-index={index}
          className="w-full h-screen snap-start snap-always flex-shrink-0"
        >
          <ReelCard
            reel={reel}
            isActive={index === activeIndex}
            onComment={() => {}}
          />
        </div>
      ))}

      {/* Loading indicator for infinite scroll */}
      {hasNextPage && (
        <div 
          ref={loadMoreRef}
          className="h-screen w-full bg-black flex items-center justify-center snap-start"
        >
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-sm">Loading more reels...</p>
          </div>
        </div>
      )}
    </div>
  );
};
