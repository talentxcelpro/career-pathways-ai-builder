import { Capacitor } from '@capacitor/core';
import { unregisterServiceWorker } from './serviceWorkerRegistration';

// Production optimization utilities
export const optimizeForProduction = () => {
  // Remove console logs in production - DISABLED FOR DEBUGGING
  /*
  if (!import.meta.env.DEV) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};
    console.info = () => {};
  }
  */

  // Disable React DevTools in production
  if (!import.meta.env.DEV && typeof window !== 'undefined') {
    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (devTools) {
      devTools.onCommitFiberRoot = null;
      devTools.onCommitFiberUnmount = null;
    }
  }
};

// Image optimization helper
export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
} = {}) => {
  if (!url) return url;
  
  const { width, height, quality = 80, format = 'auto' } = options;
  
  // If it's a Supabase storage URL, add optimization parameters
  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Critical resource preloader removed as it used hardcoded paths incompatible with hashed Vite assets
export const preloadCriticalResources = () => {
  // Relying on Vite's native preloading and CSS-based font loading
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if (Capacitor.isNativePlatform()) {
    await unregisterServiceWorker();
    return;
  }

  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};

// Error boundary for production
export const handleProductionError = (error: Error, errorInfo: any) => {
  if (!import.meta.env.DEV) {
    // Send to error tracking service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }
};

// Memory cleanup for large datasets
export const cleanupMemory = () => {
  if (window.gc && import.meta.env.DEV) {
    window.gc();
  }
};

// Initialize all production optimizations
export const initializeProductionOptimizations = () => {
  optimizeForProduction();
  preloadCriticalResources();
  registerServiceWorker();
};
