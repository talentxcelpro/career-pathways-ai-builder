import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

interface UsePerformanceOptions {
  componentName: string;
  enableLogging?: boolean;
  threshold?: number;
}

export const usePerformance = ({
  componentName,
  enableLogging = false,
  threshold = 16
}: UsePerformanceOptions) => {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  const renderStartTime = useRef<number>(0);

  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const markRenderEnd = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;
    
    const metrics = metricsRef.current;
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    metrics.averageRenderTime = (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount;

    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    if (enableLogging && renderTime > threshold) {
      console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName, enableLogging, threshold]);

  // Auto-track renders
  useEffect(() => {
    markRenderStart();
    const rafId = requestAnimationFrame(markRenderEnd);
    return () => cancelAnimationFrame(rafId);
  });

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0
    };
  }, []);

  return {
    getMetrics,
    resetMetrics,
    markRenderStart,
    markRenderEnd
  };
};

// Hook for monitoring long tasks
export const useLongTaskMonitoring = (callback?: (duration: number) => void) => {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('[Performance] Long task:', entry.duration.toFixed(2) + 'ms');
          callback?.(entry.duration);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }

    return () => observer.disconnect();
  }, [callback]);
};