import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PerformanceTracker } from '@/utils/performanceTracker';

interface NavigationMetrics {
  loadTime: number;
  routeChangeTime: number;
  prefetchHits: number;
  cacheHits: number;
}

export const usePerformantNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<NavigationMetrics>({
    loadTime: 0,
    routeChangeTime: 0,
    prefetchHits: 0,
    cacheHits: 0,
  });
  const [isNavigating, setIsNavigating] = useState(false);

  // Track navigation performance
  const trackNavigation = useCallback((startTime: number) => {
    const endTime = performance.now();
    const navigationTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      routeChangeTime: navigationTime,
    }));

    // Log performance in development
    if ((import.meta as any)?.env?.MODE === 'development') {
      console.log(`🚀 Navigation to ${location.pathname}: ${navigationTime.toFixed(2)}ms`);
    }
  }, [location.pathname]);

  // Enhanced navigate function with performance tracking
  const performantNavigate = useCallback((
    to: string,
    options?: { replace?: boolean; state?: any }
  ) => {
    PerformanceTracker.start(`navigation_${to}`);
    setIsNavigating(true);

    // Use React Router's navigate
    navigate(to, options);

    // Track after navigation
    setTimeout(() => {
      const duration = PerformanceTracker.end(`navigation_${to}`);
      PerformanceTracker.trackNavigation(to, duration);
      setIsNavigating(false);
    }, 0);
  }, [navigate]);

  // Preload critical resources for route
  const preloadRouteResources = useCallback(async (route: string) => {
    const resourceMap: Record<string, string[]> = {
      '/jobs': ['/api/jobs', '/images/job-placeholder.webp'],
      '/network': ['/api/connections', '/images/network-bg.webp'],
      '/profile': ['/api/profile', '/images/profile-bg.webp'],
      '/companies': ['/api/companies', '/images/company-placeholder.webp'],
    };

    const resources = resourceMap[route] || [];
    
    await Promise.allSettled(
      resources.map(resource => {
        if (resource.startsWith('/api/')) {
          // Prefetch API data
          return fetch(resource).then(res => res.json()).catch(() => null);
        } else {
          // Preload images
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = resource;
          });
        }
      })
    );
  }, []);

  // Smart prefetching based on user behavior
  useEffect(() => {
    const handleLinkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && link.origin === window.location.origin) {
        const route = new URL(link.href).pathname;
        preloadRouteResources(route);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && link.origin === window.location.origin) {
        const route = new URL(link.href).pathname;
        preloadRouteResources(route);
      }
    };

    document.addEventListener('mouseover', handleLinkHover, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [preloadRouteResources]);

  // Monitor Core Web Vitals using Performance Observer
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if ((import.meta as any)?.env?.MODE === 'development') {
              const value = entry.duration || (entry as any).value || 0;
              console.log(`Performance: ${entry.name}`, value);
            }
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        
        return () => observer.disconnect();
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }, []);

  return {
    isNavigating,
    metrics,
    performantNavigate,
    preloadRouteResources,
  };
};

// Hook for link components with enhanced performance
export const usePerformantLink = (href: string) => {
  const { performantNavigate, preloadRouteResources } = usePerformantNavigation();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    performantNavigate(href);
  }, [href, performantNavigate]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    preloadRouteResources(href);
  }, [href, preloadRouteResources]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    preloadRouteResources(href);
  }, [href, preloadRouteResources]);

  return {
    isHovered,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
  };
};