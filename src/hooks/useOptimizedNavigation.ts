import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { advancedPerformanceMonitor } from '@/utils/advancedPerformanceMonitor';

/**
 * Optimized navigation hook with performance tracking
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();

  const optimizedNavigate = useCallback((path: string, options?: any) => {
    const startTime = performance.now();
    
    // Track navigation
    advancedPerformanceMonitor.trackRouteChange(path, startTime);
    
    // Use navigate with options
    navigate(path, options);
  }, [navigate]);

  return { navigate: optimizedNavigate };
};
