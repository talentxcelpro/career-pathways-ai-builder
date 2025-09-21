/**
 * Bundle optimization utilities
 */

// Preload critical modules
export const preloadCriticalModules = () => {
  if (typeof document === 'undefined') return;

  const criticalModules = [
    '/src/pages/Jobs.tsx',
    '/src/components/ui/button.tsx',
    '/src/components/ui/input.tsx'
  ];

  criticalModules.forEach(module => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = module;
    document.head.appendChild(link);
  });
};

// Dynamic import with error handling
export const safeDynamicImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    if (fallback) return fallback;
    throw error;
  }
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (typeof performance === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'navigation') {
        const nav = entry as PerformanceNavigationTiming;
        console.log('Bundle metrics:', {
          transferSize: nav.transferSize,
          encodedBodySize: nav.encodedBodySize,
          decodedBodySize: nav.decodedBodySize
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['navigation'] });
};

// Initialize bundle optimizations
export const initBundleOptimizations = () => {
  preloadCriticalModules();
  
  if (process.env.NODE_ENV === 'development') {
    logBundleSize();
  }
};