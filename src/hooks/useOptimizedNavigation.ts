import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { advancedPerformanceMonitor } from '@/utils/advancedPerformanceMonitor';
import { preloadRoute } from '@/utils/routePreloader';

/**
 * Optimized navigation hook with performance tracking
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();

  const optimizedNavigate = useCallback((path: string, options?: any) => {
    if (typeof path === 'string') {
      preloadRoute(path);
    }
    const startTime = performance.now();
    
    // Track navigation
    advancedPerformanceMonitor.trackRouteChange(path, startTime);
    
    // Use navigate with options
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback((fallbackPath: string = '/') => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }, [navigate]);

  return { navigate: optimizedNavigate, goBack };
};

