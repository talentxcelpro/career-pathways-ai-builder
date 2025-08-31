import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RouteTransitionOptions {
  preloadDelay?: number;
  enablePrefetch?: boolean;
  enablePreload?: boolean;
}

export const useRouteTransition = (options: RouteTransitionOptions = {}) => {
  const {
    preloadDelay = 100,
    enablePrefetch = true,
    enablePreload = true,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefetchedRoutes] = useState(new Set<string>());

  // Enhanced navigation with transition states
  const navigateWithTransition = async (
    to: string, 
    options?: { replace?: boolean; state?: any }
  ) => {
    setIsTransitioning(true);
    
    // Small delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      navigate(to, options);
    } finally {
      // Reset transition state after navigation
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  // Prefetch route resources
  const prefetchRoute = async (route: string) => {
    if (!enablePrefetch || prefetchedRoutes.has(route)) return;
    
    try {
      // Dynamic import of route component if it exists
      const routeMap: Record<string, () => Promise<any>> = {
        '/jobs': () => import('@/pages/Jobs'),
        '/network': () => import('@/pages/Network'),
        '/profile': () => import('@/pages/Profile'),
        '/companies': () => import('@/pages/Companies'),
      };

      if (routeMap[route]) {
        await routeMap[route]();
        prefetchedRoutes.add(route);
      }
    } catch (error) {
      console.warn('Failed to prefetch route:', route, error);
    }
  };

  // Preload route on hover
  const handleLinkHover = (route: string) => {
    if (enablePreload) {
      setTimeout(() => prefetchRoute(route), preloadDelay);
    }
  };

  // Auto-prefetch common routes
  useEffect(() => {
    if (enablePrefetch) {
      // Prefetch most common routes after initial load
      const commonRoutes = ['/jobs', '/network', '/profile'];
      
      const prefetchTimer = setTimeout(() => {
        commonRoutes.forEach(route => {
          if (route !== location.pathname) {
            prefetchRoute(route);
          }
        });
      }, 2000);

      return () => clearTimeout(prefetchTimer);
    }
  }, [location.pathname, enablePrefetch]);

  return {
    isTransitioning,
    navigateWithTransition,
    prefetchRoute,
    handleLinkHover,
    currentPath: location.pathname,
  };
};

// Custom Link component with enhanced prefetching
export const useEnhancedLink = () => {
  const { navigateWithTransition, handleLinkHover } = useRouteTransition();

  const linkProps = (to: string, options?: { replace?: boolean; state?: any }) => ({
    onMouseEnter: () => handleLinkHover(to),
    onTouchStart: () => handleLinkHover(to),
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      navigateWithTransition(to, options);
    },
  });

  return { linkProps, navigateWithTransition };
};