// Performance monitoring utilities
export const performanceMonitor = {
  // Track route transitions
  trackRouteChange: (route: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const now = performance.now();
      console.log(`📊 Route changed to ${route} at ${now.toFixed(2)}ms`);
    }
  },

  // Measure component render time
  measureRender: (componentName: string, startTime: number) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const duration = performance.now() - startTime;
      if (duration > 100) {
        console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    }
  },

  // Track long tasks
  observeLongTasks: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long tasks not supported
      }
    }
  },

  // Preload critical resources
  preloadRoute: (importFn: () => Promise<any>) => {
    // Preload on hover/focus for instant navigation
    const link = document.createElement('link');
    link.rel = 'prefetch';
    importFn().catch(() => {});
  },
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.observeLongTasks();
}
