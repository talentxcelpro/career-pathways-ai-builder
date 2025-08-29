import { useEffect, useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  memoryUsage?: number;
}

interface UsePerformanceMonitoringOptions {
  componentName: string;
  enableLogging?: boolean;
  threshold?: number; // ms threshold for slow renders
}

export const usePerformanceMonitoring = ({
  componentName,
  enableLogging = false,
  threshold = 16 // 60fps = ~16.67ms per frame
}: UsePerformanceMonitoringOptions) => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);

  // Mark render start
  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // Mark render end and calculate metrics
  const markRenderEnd = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;
    
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    // Get memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    // Log performance warnings
    if (enableLogging) {
      if (renderTime > threshold) {
        console.warn(`[Performance] Slow render detected in ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
          renderCount: metrics.renderCount,
          averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`
        });
      }

      // Log every 100 renders
      if (metrics.renderCount % 100 === 0) {
        console.log(`[Performance] ${componentName} metrics:`, {
          renderCount: metrics.renderCount,
          averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
          memoryUsage: metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
        });
      }
    }

    // Dispatch performance event for monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('componentPerformance', {
        detail: {
          componentName,
          renderTime,
          metrics: { ...metrics }
        }
      }));
    }
  }, [componentName, enableLogging, threshold]);

  // Auto-track renders using layout effect
  useEffect(() => {
    markRenderStart();
    
    // Use requestAnimationFrame to measure after commit
    const rafId = requestAnimationFrame(markRenderEnd);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  });

  // Memory monitoring
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
        totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
      };
    }
    return null;
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0
    };
  }, []);

  return {
    getMetrics,
    resetMetrics,
    checkMemoryUsage,
    markRenderStart,
    markRenderEnd
  };
};

// Hook for monitoring long tasks
export const useLongTaskMonitoring = (callback?: (duration: number) => void) => {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('[Performance] Long task detected:', {
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: entry.startTime,
            name: entry.name
          });
          
          callback?.(entry.duration);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, [callback]);
};

// Hook for monitoring paint metrics
export const usePaintMetrics = () => {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }>({});

  useEffect(() => {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lcp.startTime }));
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Paint metrics monitoring not supported:', error);
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return metrics;
};