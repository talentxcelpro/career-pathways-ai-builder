import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

export const usePerformanceMonitor = () => {
  const logMetrics = useCallback((metrics: PerformanceMetrics) => {
    if (import.meta.env.DEV) {
      console.group('🚀 Performance Metrics');
      console.log('Load Time:', `${metrics.loadTime}ms`);
      console.log('Render Time:', `${metrics.renderTime}ms`);
      if (metrics.memoryUsage) {
        console.log('Memory Usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
      if (metrics.connectionType) {
        console.log('Connection:', metrics.connectionType);
      }
      console.groupEnd();
    }
  }, []);

  const measurePerformance = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    const connection = (navigator as any).connection;

    const metrics: PerformanceMetrics = {
      loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      renderTime: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
      memoryUsage: memory?.usedJSHeapSize,
      connectionType: connection?.effectiveType
    };

    logMetrics(metrics);
    
    // Track performance in production for analytics
    if (!import.meta.env.DEV && window.gtag) {
      window.gtag('event', 'page_performance', {
        load_time: metrics.loadTime,
        render_time: metrics.renderTime,
        memory_usage: metrics.memoryUsage,
        connection_type: metrics.connectionType
      });
    }

    return metrics;
  }, [logMetrics]);

  useEffect(() => {
    // Measure initial load performance
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [measurePerformance]);

  const trackUserAction = useCallback((action: string, duration?: number) => {
    if (!import.meta.env.DEV && window.gtag) {
      window.gtag('event', 'user_action', {
        action_name: action,
        duration: duration,
        timestamp: Date.now()
      });
    }
  }, []);

  return {
    measurePerformance,
    trackUserAction
  };
};