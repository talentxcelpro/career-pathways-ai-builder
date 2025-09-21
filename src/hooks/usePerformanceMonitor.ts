import { useEffect, useCallback, useRef } from 'react';
import { useWebVitals } from './useWebVitals';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  memoryUsage?: number;
  renderTime: number;
}

export const usePerformanceMonitor = (componentName?: string) => {
  const vitals = useWebVitals();
  const renderStartTime = useRef<number>(Date.now());
  const observerRef = useRef<PerformanceObserver | null>(null);

  const measureComponentPerformance = useCallback(() => {
    if (componentName) {
      const renderTime = Date.now() - renderStartTime.current;
      
      // Mark performance milestone
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(`${componentName}-render-end`);
        
        try {
          performance.measure(
            `${componentName}-render-duration`,
            `${componentName}-render-start`,
            `${componentName}-render-end`
          );
        } catch (e) {
          // Fallback for missing start mark
          console.debug(`Performance measurement failed for ${componentName}:`, e);
        }
      }
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    }
  }, [componentName]);

  const getMemoryUsage = useCallback((): number | undefined => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }, []);

  const logPerformanceMetrics = useCallback(() => {
    const metrics: Partial<PerformanceMetrics> = {
      ...vitals,
      memoryUsage: getMemoryUsage(),
      renderTime: Date.now() - renderStartTime.current
    };

    // Only log in development or for performance debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Metrics');
      console.table(metrics);
      console.groupEnd();
    }

    // Send to analytics in production (if needed)
    if (process.env.NODE_ENV === 'production' && componentName) {
      // This could be connected to your analytics service
      // analytics.track('component_performance', { component: componentName, ...metrics });
    }
  }, [vitals, getMemoryUsage, componentName]);

  // Monitor long tasks
  useEffect(() => {
    if (typeof PerformanceObserver !== 'undefined') {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) { // Long task threshold
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      try {
        observerRef.current.observe({ entryTypes: ['longtask', 'measure'] });
      } catch (e) {
        console.debug('Performance observer not supported:', e);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Mark component render start
  useEffect(() => {
    if (componentName && typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${componentName}-render-start`);
    }
    renderStartTime.current = Date.now();
  }, [componentName]);

  return {
    measureComponentPerformance,
    logPerformanceMetrics,
    getMemoryUsage,
    vitals
  };
};