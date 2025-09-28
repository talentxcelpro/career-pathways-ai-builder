import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFirstConfig {
  enableTouchOptimizations: boolean;
  enableSwipeGestures: boolean;
  enablePullToRefresh: boolean;
  useBottomNavigation: boolean;
  optimizeImages: boolean;
  enableVirtualScrolling: boolean;
}

export const useMobileFirstOptimization = (config: Partial<MobileFirstConfig> = {}) => {
  const isMobile = useIsMobile();
  const [isOptimized, setIsOptimized] = useState(false);

  const defaultConfig: MobileFirstConfig = {
    enableTouchOptimizations: true,
    enableSwipeGestures: false,
    enablePullToRefresh: false,
    useBottomNavigation: false,
    optimizeImages: true,
    enableVirtualScrolling: false,
    ...config
  };

  useEffect(() => {
    if (isMobile) {
      // Apply mobile-first optimizations
      const body = document.body;
      
      if (defaultConfig.enableTouchOptimizations) {
        body.classList.add('touch-optimized');
      }
      
      if (defaultConfig.optimizeImages) {
        body.classList.add('image-optimized');
      }

      setIsOptimized(true);
    }

    return () => {
      // Cleanup optimizations
      const body = document.body;
      body.classList.remove('touch-optimized', 'image-optimized');
      setIsOptimized(false);
    };
  }, [isMobile, defaultConfig]);

  return {
    isMobile,
    isOptimized,
    config: defaultConfig,
    // Helper classes for components
    containerClass: isMobile ? 'px-3 sm:px-6' : 'px-6 lg:px-8',
    spacingClass: isMobile ? 'space-y-3 sm:space-y-4' : 'space-y-4',
    buttonClass: isMobile ? 'min-h-[44px] touch-target' : '',
    textClass: isMobile ? 'text-sm sm:text-base' : 'text-base',
  };
};

// Helper hook for responsive breakpoints
export const useResponsiveBreakpoints = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    // Responsive classes
    gridCols: {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-3'
    }[breakpoint],
    padding: {
      mobile: 'px-3',
      tablet: 'px-6',
      desktop: 'px-8'
    }[breakpoint],
    spacing: {
      mobile: 'space-y-3',
      tablet: 'space-y-4',
      desktop: 'space-y-6'
    }[breakpoint]
  };
};