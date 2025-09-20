import React, { memo, useEffect, useCallback } from 'react';
import { InfiniteReelsFeed } from '@/components/reels/InfiniteReelsFeed';
import { usePerformanceMonitoring, useLongTaskMonitoring, usePaintMetrics } from '@/hooks/usePerformanceMonitoring';
import { LazyComponentWrapper } from './LazyComponentWrapper';
import { PerformanceOptimizer } from './PerformanceOptimizer';

interface PerformantReelsFeedProps {
  enablePerformanceMonitoring?: boolean;
  className?: string;
  onUploadClick?: () => void;
}

export const PerformantReelsFeed: React.FC<PerformantReelsFeedProps> = memo(({
  enablePerformanceMonitoring = true,
  className,
  onUploadClick = () => {}
}) => {
  // Performance monitoring
  const { getMetrics, resetMetrics } = usePerformanceMonitoring({
    componentName: 'PerformantReelsFeed',
    enableLogging: enablePerformanceMonitoring && process.env.NODE_ENV === 'development',
    threshold: 200 // Higher threshold for video components
  });

  // Monitor long tasks that could affect video playback
  const handleLongTask = useCallback((duration: number) => {
    if (enablePerformanceMonitoring) {
      console.warn(`[Reels Performance] Long task detected: ${duration}ms - may affect video playback`);
    }
  }, [enablePerformanceMonitoring]);

  useLongTaskMonitoring(handleLongTask);

  // Monitor Core Web Vitals for video content
  const paintMetrics = usePaintMetrics();

  useEffect(() => {
    if (enablePerformanceMonitoring && paintMetrics.lcp) {
      console.log('[Reels Performance] Largest Contentful Paint:', paintMetrics.lcp);
    }
  }, [paintMetrics.lcp, enablePerformanceMonitoring]);

  // Performance optimization for video components
  useEffect(() => {
    // Optimize video loading
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      // Set video optimization attributes
      video.setAttribute('preload', 'metadata');
      video.setAttribute('playsinline', 'true');
      
      // Optimize for mobile
      if (window.innerWidth < 768) {
        video.style.willChange = 'transform';
      }
    });

    // Cleanup on unmount
    return () => {
      videos.forEach((video) => {
        video.style.willChange = 'auto';
      });
    };
  }, []);

  return (
    <PerformanceOptimizer
      enableSuspense={true}
      enableErrorBoundary={true}
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading amazing content...</p>
          </div>
        </div>
      }
    >
      <LazyComponentWrapper 
        enableIntersection={true}
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white">Loading reels...</div>
          </div>
        }
      >
        <div className={className}>
          <InfiniteReelsFeed onUploadClick={onUploadClick} />
        </div>
      </LazyComponentWrapper>
    </PerformanceOptimizer>
  );
});

PerformantReelsFeed.displayName = 'PerformantReelsFeed';