/**
 * Bundle optimization utilities for 2-3G networks
 */
import React from 'react';

// Connection-aware loading
export const getConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
  if (typeof navigator === 'undefined') return 'medium';
  
  const connection = (navigator as any).connection;
  if (!connection) return 'medium';
  
  const type = connection.effectiveType;
  if (['slow-2g', '2g'].includes(type)) return 'slow';
  if (['3g'].includes(type)) return 'medium';
  return 'fast';
};

// Defer non-critical imports
export const deferredImport = <T>(
  importFn: () => Promise<{ default: T }>,
  delay: number = 0
): Promise<{ default: T }> => {
  return new Promise((resolve) => {
    const loadTime = getConnectionSpeed() === 'slow' ? delay * 2 : delay;
    setTimeout(() => {
      importFn().then(resolve);
    }, loadTime);
  });
};

// Preload critical chunks
export const preloadChunk = (chunkName: string) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/${chunkName}`;
  document.head.appendChild(link);
};

// Initialize bundle optimization
export const initializeBundleOptimization = () => {
  if (typeof window === 'undefined') return;
  
  const speed = getConnectionSpeed();
  
  if (speed === 'fast') {
    // Preload critical chunks for fast connections
    requestIdleCallback(() => {
      preloadChunk('vendor.js');
      preloadChunk('ui.js');
    });
  }
  
  // Clean up unused modules
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
      // Service worker can help with caching strategies
      console.log('SW ready for optimized caching');
    });
  }
};

// Lazy component wrapper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => {
    const speed = getConnectionSpeed();
    const delay = speed === 'slow' ? 100 : 0;
    
    return deferredImport(importFn, delay);
  });
  
  return (props: any) => (
    React.createElement(React.Suspense, { fallback: fallback || React.createElement('div', null, 'Loading...') },
      React.createElement(LazyComponent, props)
    )
  );
};

// Bundle analyzer for performance monitoring
export const BundleAnalyzer = {
  measureBundleSize: () => {
    if (typeof window === 'undefined') return { size: 0, chunks: [] };
    
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    const chunks: any[] = [];
    
    scripts.forEach((script: any) => {
      if (script.src.includes('assets/')) {
        const name = script.src.split('/').pop() || 'unknown';
        chunks.push({ name, estimated: true });
        totalSize += 50; // Rough estimate
      }
    });
    
    return {
      size: totalSize,
      chunks,
      timestamp: Date.now()
    };
  },
  
  getLoadingMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
    };
  }
};
