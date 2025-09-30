import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

/**
 * Optimized navigation hook with performance tracking
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();

  const optimizedNavigate = useCallback((path: string, options?: any) => {
    // Track navigation
    performanceMonitor.trackRouteChange(path);
    
    // Use navigate with options
    navigate(path, options);
  }, [navigate]);

  return { navigate: optimizedNavigate };
};
