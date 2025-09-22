import { useEffect, useCallback, useRef } from 'react';

interface TurboMetrics {
  renderTime: number;
  renderCount: number;
}

/**
 * Ultra-lightweight performance hook
 */
export const useTurbo = (componentName?: string) => {
  const metricsRef = useRef<TurboMetrics>({ renderTime: 0, renderCount: 0 });
  const startTimeRef = useRef<number>(0);

  // Track render performance
  useEffect(() => {
    startTimeRef.current = performance.now();
    const cleanup = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      metricsRef.current.renderTime = renderTime;
      metricsRef.current.renderCount++;

      // Warn on slow renders (dev only)
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render: ${componentName || 'Component'} took ${renderTime.toFixed(2)}ms`);
      }
    };

    const rafId = requestAnimationFrame(cleanup);
    return () => cancelAnimationFrame(rafId);
  });

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  return { getMetrics };
};

/**
 * Lightweight intersection observer hook
 */
export const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLElement>(null);
  const isInViewRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView: isInViewRef.current };
};

/**
 * Optimized image loading hook
 */
export const useOptimizedImage = (src: string, priority = false) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (priority) {
      (img as any).fetchPriority = 'high';
      (img as any).loading = 'eager';
    } else {
      (img as any).loading = 'lazy';
      (img as any).fetchPriority = 'low';
    }

    img.decoding = 'async';
    img.src = src;
  }, [src, priority]);

  return { imgRef };
};