import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';

/**
 * Hook for mobile-specific optimizations
 */
export const useMobileOptimizations = () => {
  const isMobile = useIsMobile();
  const [touchSupported, setTouchSupported] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Detect touch support
    setTouchSupported('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Monitor orientation changes
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      setViewportHeight(window.innerHeight);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return {
    isMobile,
    touchSupported,
    orientation,
    viewportHeight,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    hasNotch: viewportHeight > 800 && window.screen?.availHeight < window.screen?.height
  };
};

/**
 * Hook for mobile-friendly form handling
 */
export const useMobileForm = () => {
  const { isMobile, isIOS } = useMobileOptimizations();

  const getInputProps = (type: 'email' | 'password' | 'search' | 'tel' | 'number' | 'text' = 'text') => ({
    // Prevent zoom on iOS by using 16px font size
    style: isMobile ? { fontSize: '16px' } : undefined,
    // Use appropriate input types for mobile keyboards
    type: isMobile ? type : 'text',
    // Disable autocorrect/autocapitalize for certain fields
    autoCorrect: ['email', 'password'].includes(type) ? 'off' : undefined,
    autoCapitalize: ['email', 'password'].includes(type) ? 'none' : undefined,
    // Improve iOS experience
    ...(isIOS && {
      autoComplete: type === 'password' ? 'current-password' : type,
    })
  });

  return {
    getInputProps,
    isMobile,
    shouldPreventZoom: isMobile && isIOS
  };
};

/**
 * Hook for mobile-optimized scrolling
 */
export const useMobileScroll = () => {
  const { isMobile } = useMobileOptimizations();
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollY = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };

    if (isMobile) {
      window.addEventListener('scroll', updateScrollY, { passive: true });
    }

    return () => {
      if (isMobile) {
        window.removeEventListener('scroll', updateScrollY);
      }
    };
  }, [isMobile]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return {
    scrollY,
    scrollDirection,
    scrollToTop,
    scrollToElement,
    isScrolledPastHeader: scrollY > 100
  };
};

/**
 * Hook for mobile performance optimizations
 */
export const useMobilePerformance = () => {
  const { isMobile } = useMobileOptimizations();
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Detect low power mode (battery level if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setLowPowerMode(battery.level < 0.2);
        battery.addEventListener('levelchange', () => {
          setLowPowerMode(battery.level < 0.2);
        });
      });
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const optimizationSettings = {
    // Reduce animations in low power mode or reduced motion
    enableAnimations: !reducedMotion && !lowPowerMode,
    // Reduce image quality on mobile
    imageQuality: isMobile ? 'medium' : 'high',
    // Lazy load more aggressively on mobile
    lazyLoadThreshold: isMobile ? '50px' : '100px',
    // Reduce concurrent requests on mobile
    maxConcurrentRequests: isMobile ? 3 : 6
  };

  return {
    lowPowerMode,
    reducedMotion,
    optimizationSettings,
    shouldOptimizeForPerformance: isMobile || lowPowerMode
  };
};

/**
 * Hook for mobile navigation enhancements
 */
export const useMobileNavigation = () => {
  const { isMobile, orientation } = useMobileOptimizations();
  const { scrollDirection, isScrolledPastHeader } = useMobileScroll();
  const [showBottomNav, setShowBottomNav] = useState(true);

  useEffect(() => {
    if (isMobile) {
      // Hide bottom nav when scrolling down, show when scrolling up
      setShowBottomNav(scrollDirection === 'up' || !isScrolledPastHeader);
    }
  }, [isMobile, scrollDirection, isScrolledPastHeader]);

  const navigationConfig = {
    showBottomNav: isMobile ? showBottomNav : false,
    showSidebar: !isMobile,
    compactMode: orientation === 'landscape' && isMobile,
    stickyHeader: isMobile && isScrolledPastHeader
  };

  return navigationConfig;
};