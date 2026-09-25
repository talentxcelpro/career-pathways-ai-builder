
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReelsData } from '@/hooks/useReelsData';
import { ReelCard } from './ReelCard';
import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw, ChevronUp, ChevronDown, UserCheck } from 'lucide-react';
import { useIntersectionObserverCallback } from '@/hooks/useIntersectionObserver';
import { useFollow } from '@/hooks/useFollow';

interface InfiniteReelsFeedProps {
  onUploadClick: () => void;
  feedType?: 'following' | 'explore';
  category?: string;
  className?: string;
}

export const InfiniteReelsFeed: React.FC<InfiniteReelsFeedProps> = ({
  onUploadClick,
  feedType = 'explore',
  category = 'all',
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useReelsData(feedType, category);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTargets = useRef<Map<number, HTMLDivElement>>(new Map());
  const { followUser } = useFollow();

  // Flatten all pages into a single array of reels
  const reels = data?.pages.flat() || [];

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const targetEl = observerTargets.current.get(index);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      setActiveIndex(index);
    } else {
      const itemHeight = containerRef.current.clientHeight;
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  }, []);

  // Keyboard navigation for desktop: ArrowUp / ArrowDown / PageUp / PageDown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (activeIndex < reels.length - 1) {
          scrollToIndex(activeIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          scrollToIndex(activeIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels.length, scrollToIndex]);

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
        threshold: 0.6,
        rootMargin: '-20% 0px'
      }
    );

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
    if (feedType === 'following') {
      return (
        <div className="w-full h-screen bg-black flex items-center justify-center p-4 text-white overflow-y-auto">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mx-auto text-2xl shadow-lg">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-bold">Follow Global Tech Creators</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                You're not following any creators yet. Follow top engineering leaders to personalize your feed.
              </p>
            </div>
            <div className="space-y-2.5 text-left pt-1">
              {[
                { id: 'creator-sarah-chen', name: 'Sarah Chen', role: 'Lead ML Architect • San Francisco', score: 940, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face' },
                { id: 'creator-vikram-malhotra', name: 'Vikram Malhotra', role: 'Staff Distributed Systems • Dubai & BLR', score: 955, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
                { id: 'creator-elena-rostova', name: 'Elena Rostova', role: 'Head of Recruiting • London & Berlin', score: 920, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face' },
                { id: 'creator-david-kim', name: 'David Kim', role: 'VP Engineering • Singapore & US', score: 960, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face' },
              ].map(creator => (
                <div key={creator.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={creator.avatar} alt={creator.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span>{creator.name}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">⚡ {creator.score}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{creator.role}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      followUser({ userId: creator.id, isFollowing: false });
                      refetch();
                    }}
                    className="h-7 px-3 text-xs font-semibold rounded-full bg-white text-black hover:bg-white/90 shrink-0 ml-2"
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

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
    <div className="relative w-full h-screen bg-black">
      {/* Scrollable Feed Container */}
      <div 
        ref={containerRef}
        className={cn(
          "w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none",
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

      {/* Floating Desktop Up / Down Controls (Visible on screens md and up) */}
      <div className="hidden md:flex flex-col items-center gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-white border border-slate-700/60 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="Previous Reel (Arrow Up)"
          aria-label="Previous reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className="text-white/60 text-[11px] font-mono select-none px-2 py-0.5 rounded bg-black/40">
          {activeIndex + 1}/{reels.length}
        </span>
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= reels.length - 1}
          className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none text-white border border-slate-700/60 flex items-center justify-center shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="Next Reel (Arrow Down)"
          aria-label="Next reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
