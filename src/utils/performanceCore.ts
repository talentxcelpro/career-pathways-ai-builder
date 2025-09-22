/**
 * Unified Performance Optimization System
 * Consolidates all performance optimizers into a single, efficient system
 */

interface PerformanceConfig {
  enableMonitoring: boolean;
  enablePrefetch: boolean;
  enableImageOptimization: boolean;
  enableBundleOptimization: boolean;
}

class PerformanceCore {
  private config: PerformanceConfig = {
    enableMonitoring: true,
    enablePrefetch: true,
    enableImageOptimization: true,
    enableBundleOptimization: true,
  };

  private observers: PerformanceObserver[] = [];
  private prefetchedUrls = new Set<string>();

  /**
   * Initialize all performance optimizations
   */
  public init() {
    this.preloadCriticalResources();
    this.optimizeImages();
    this.enableInstantNavigation();
    
    if (this.config.enableMonitoring) {
      this.setupPerformanceMonitoring();
    }
  }

  /**
   * Preload critical resources
   */
  private preloadCriticalResources() {
    if (typeof document === 'undefined') return;

    // Preload hero image
    const heroLink = document.createElement('link');
    heroLink.rel = 'preload';
    heroLink.href = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
    heroLink.as = 'image';
    (heroLink as any).fetchPriority = 'high';
    document.head.appendChild(heroLink);

    // Preload critical font
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // DNS prefetch
    const prefetchDomains = [
      'https://dthlgsnakhoftinssokm.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    prefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Optimize images with lazy loading
   */
  private optimizeImages() {
    if (typeof document === 'undefined') return;

    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img, index) => {
      const htmlImg = img as HTMLImageElement;
      // First 2 images load eagerly
      (htmlImg as any).loading = index < 2 ? 'eager' : 'lazy';
      htmlImg.decoding = 'async';
      
      if (index === 0) {
        (htmlImg as any).fetchPriority = 'high';
      }
    });
  }

  /**
   * Enable instant navigation with prefetching
   */
  private enableInstantNavigation() {
    if (typeof document === 'undefined') return;

    document.addEventListener('mouseover', (e) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link?.hostname === location.hostname && !this.prefetchedUrls.has(link.href)) {
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = link.href;
        document.head.appendChild(prefetch);
        this.prefetchedUrls.add(link.href);
      }
    }, { passive: true });
  }

  /**
   * Setup lightweight performance monitoring
   */
  private setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Monitor LCP
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.startTime > 2500) {
            console.warn('Slow LCP detected:', entry.startTime);
          }
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Monitor CLS
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput && entry.value > 0.1) {
            console.warn('Layout shift detected:', entry.value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  /**
   * Clean up all observers
   */
  public cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers = [];
  }

  /**
   * Get performance metrics
   */
  public async getMetrics(): Promise<{ lcp: number; cls: number }> {
    return new Promise((resolve) => {
      const metrics = { lcp: 0, cls: 0 };
      let collected = 0;

      const checkComplete = () => {
        if (collected >= 2) {
          resolve(metrics);
        }
      };

      // Collect LCP
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          metrics.lcp = entry.startTime;
          collected++;
          checkComplete();
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Collect CLS
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            metrics.cls += entry.value;
          }
        });
        collected++;
        checkComplete();
      }).observe({ entryTypes: ['layout-shift'] });

      // Timeout after 3 seconds
      setTimeout(() => {
        collected = 2;
        checkComplete();
      }, 3000);
    });
  }
}

// Singleton instance
export const performanceCore = new PerformanceCore();

// Auto-initialize
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceCore.init();
    });
  } else {
    performanceCore.init();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceCore.cleanup();
  });
}