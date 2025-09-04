import { useState, useEffect, useCallback } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  scale: number;
  orientation: 'portrait' | 'landscape';
  isFullscreen: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export const useViewport = () => {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    scale: window.devicePixelRatio || 1,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    isFullscreen: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0
  });

  const updateViewport = useCallback(() => {
    // Get safe area values from CSS environment variables
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0;
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0;
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0;
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0;

    setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      isFullscreen: document.fullscreenElement !== null,
      safeAreaTop,
      safeAreaBottom,
      safeAreaLeft,
      safeAreaRight
    });
  }, []);

  useEffect(() => {
    updateViewport();
    
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    window.addEventListener('fullscreenchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      window.removeEventListener('fullscreenchange', updateViewport);
    };
  }, [updateViewport]);

  return viewport;
};

export const useResponsiveBreakpoints = () => {
  const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 480) setBreakpoint('xs');
      else if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint)
  };
};

export const useOptimizedImages = () => {
  const { breakpoint } = useResponsiveBreakpoints();
  
  const getOptimizedImageUrl = useCallback((baseUrl: string, options?: {
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }) => {
    const { quality = 80, format = 'webp' } = options || {};
    
    // Size based on breakpoint
    const sizes = {
      xs: 320,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    };
    
    const size = sizes[breakpoint];
    
    // This would be replaced with your actual image optimization service
    return `${baseUrl}?w=${size}&q=${quality}&f=${format}`;
  }, [breakpoint]);

  return { getOptimizedImageUrl };
};

export const useMobilePerformance = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    timing: {
      domContentLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0
    }
  });

  useEffect(() => {
    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: frameCount
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Memory monitoring (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        setMetrics(prev => ({
          ...prev,
          memory: (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      };
      
      const memoryInterval = setInterval(updateMemory, 5000);
      return () => clearInterval(memoryInterval);
    }

    // Performance timing
    if ('getEntriesByType' in performance) {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length > 0) {
        const entry = entries[0];
        setMetrics(prev => ({
          ...prev,
          timing: {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
            firstPaint: 0, // Would need PerformancePaintTiming
            firstContentfulPaint: 0
          }
        }));
      }
    }
  }, []);

  return metrics;
};