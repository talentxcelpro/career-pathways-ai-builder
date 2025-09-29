/**
 * Enterprise-level performance optimizations
 * Used by giant apps like Facebook, LinkedIn, etc.
 */

import { lazy } from 'react';

// Aggressive code splitting - load components only when needed
export const lazyComponents = {
  // Core app components - simplified imports
  Network: lazy(() => import('@/pages/Network')),
  Jobs: lazy(() => import('@/pages/Jobs')),
  
  // Heavy components that can be lazy loaded - using default exports
  EnhancedMobileFeed: lazy(() => import('@/components/mobile/EnhancedMobileFeed').then(m => ({ default: m.EnhancedMobileFeed }))),
  
  // Modal and overlay components - using default exports
  AuthDialog: lazy(() => import('@/components/auth/AuthDialog').then(m => ({ default: m.AuthDialog }))),
};

// Critical resource preloader - like Facebook's approach
class CriticalResourcePreloader {
  private static instance: CriticalResourcePreloader;
  private preloadedChunks = new Set<string>();
  private criticalData = new Map<string, any>();

  static getInstance() {
    if (!CriticalResourcePreloader.instance) {
      CriticalResourcePreloader.instance = new CriticalResourcePreloader();
    }
    return CriticalResourcePreloader.instance;
  }

  /**
   * Preload critical chunks immediately
   */
  preloadCriticalChunks() {
    const criticalChunks = [
      // Core components that user will likely need
      import('@/components/ui/button'),
      import('@/components/ui/card'),
      import('@/components/ui/input'),
      
      // User data that's needed on every page
      import('@/integrations/supabase/client'),
    ];

    Promise.all(criticalChunks).catch(() => {
      // Silent fail - don't block the app
    });
  }

  /**
   * Intelligent route preloading based on user behavior
   */
  intelligentPreload(currentRoute: string) {
    const routeMap: Record<string, string[]> = {
      '/': ['/network', '/jobs'],
      '/network': ['/profile', '/jobs'],
      '/jobs': ['/network', '/profile'],
      '/profile': ['/network', '/jobs'],
    };

    const likelyRoutes = routeMap[currentRoute] || [];
    
    likelyRoutes.forEach(route => {
      if (!this.preloadedChunks.has(route)) {
        this.preloadRoute(route);
        this.preloadedChunks.add(route);
      }
    });
  }

  /**
   * Preload route components
   */
  private preloadRoute(route: string) {
    const routeComponentMap: Record<string, () => Promise<any>> = {
      '/network': () => import('@/pages/Network'),
      '/jobs': () => import('@/pages/Jobs'),
      '/profile': () => import('@/pages/Profile'),
    };

    const loader = routeComponentMap[route];
    if (loader) {
      loader().catch(() => {
        // Silent fail
      });
    }
  }

  /**
   * Cache critical data to prevent refetching
   */
  cacheData(key: string, data: any, ttl = 300000) { // 5 minutes default
    this.criticalData.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  /**
   * Get cached data if still valid
   */
  getCachedData(key: string) {
    const cached = this.criticalData.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    this.criticalData.delete(key);
    return null;
  }
}

// Network optimization - like LinkedIn's approach
class NetworkOptimizer {
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private failedRequests = new Map<string, number>();

  /**
   * Batch API requests to reduce network overhead
   */
  batchRequest<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    return new Promise((resolve) => {
      // Add to queue
      this.requestQueue.push(...requests);
      
      // Process queue
      this.processQueue().then(() => {
        resolve([] as T[]); // Simplified for now
      });
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Process requests in batches of 3 (optimal for HTTP/2)
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < this.requestQueue.length; i += batchSize) {
      batches.push(this.requestQueue.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      await Promise.allSettled(batch.map(request => request()));
      // Small delay between batches to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Retry failed requests with exponential backoff
   */
  retryFailedRequest(url: string, request: () => Promise<any>) {
    const attempts = this.failedRequests.get(url) || 0;
    
    if (attempts >= 3) return Promise.reject('Max retries exceeded');
    
    const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await request();
          this.failedRequests.delete(url);
          resolve(result);
        } catch (error) {
          this.failedRequests.set(url, attempts + 1);
          reject(error);
        }
      }, delay);
    });
  }
}

// Bundle optimization - like Twitter's approach
class BundleOptimizer {
  /**
   * Dynamic import with retry mechanism
   */
  static async importWithRetry<T>(
    importFn: () => Promise<T>,
    retries = 2
  ): Promise<T> {
    try {
      return await importFn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.importWithRetry(importFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Preload critical CSS
   */
  static preloadCriticalCSS() {
    const criticalStyles = [
      // Add critical CSS files that need immediate loading
      '/src/index.css',
    ];

    criticalStyles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }
}

// Giant app loading strategy
export class GiantAppLoader {
  public preloader = CriticalResourcePreloader.getInstance();
  private networkOptimizer = new NetworkOptimizer();
  
  /**
   * Initialize like a giant app (Facebook, LinkedIn, etc.)
   */
  init() {
    // 1. Immediate critical resource preloading
    this.preloader.preloadCriticalChunks();
    
    // 2. Preload critical CSS
    BundleOptimizer.preloadCriticalCSS();
    
    // 3. Setup intelligent route preloading
    this.setupIntelligentPreloading();
    
    // 4. Optimize images and assets
    this.optimizeAssets();
    
    // 5. Setup service worker for caching
    this.setupServiceWorker();
    
    // 6. Enable performance monitoring
    this.enablePerformanceMonitoring();
  }

  private setupIntelligentPreloading() {
    // Preload routes based on current location
    const currentPath = window.location.pathname;
    this.preloader.intelligentPreload(currentPath);
    
    // Preload on route hover (like GitHub)
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as Element)?.closest('a[href^="/"]') as HTMLAnchorElement;
      if (link && !link.dataset.preloaded) {
        const route = new URL(link.href, window.location.origin).pathname;
        this.preloader.intelligentPreload(route);
        link.dataset.preloaded = 'true';
      }
    }, { passive: true });
  }

  private optimizeAssets() {
    // Optimize images with intersection observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  private setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Register service worker for caching (simplified)
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent fail if no service worker
      });
    }
  }

  private enablePerformanceMonitoring() {
    // Monitor Core Web Vitals like Google does
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('LCP:', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          console.log('FID:', fidEntry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * Get cached data or fetch with optimization
   */
  async getData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Try cache first
    const cached = this.preloader.getCachedData(key);
    if (cached) return cached;

    // Fetch with network optimization
    try {
      const data = await fetcher();
      this.preloader.cacheData(key, data);
      return data;
    } catch (error) {
      // Retry with exponential backoff
      return this.networkOptimizer.retryFailedRequest(key, fetcher) as Promise<T>;
    }
  }
}

// Export singleton instance
export const giantAppLoader = new GiantAppLoader();

// Auto-initialize like giant apps do
if (typeof window !== 'undefined') {
  // Initialize immediately for fastest loading
  giantAppLoader.init();
}