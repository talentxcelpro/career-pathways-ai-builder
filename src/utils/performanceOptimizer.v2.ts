/**
 * Optimized performance utilities - cleaner and more efficient
 */

interface PerformanceConfig {
  enableMonitoring: boolean;
  throttleObservers: boolean;
  maxCLSObservations: number;
}

class PerformanceOptimizer {
  private config: PerformanceConfig = {
    enableMonitoring: process.env.NODE_ENV === 'production',
    throttleObservers: true,
    maxCLSObservations: 10
  };

  private observers: PerformanceObserver[] = [];
  private clsObservationCount = 0;

  /**
   * Initialize lightweight performance optimizations
   */
  public init() {
    this.preloadCriticalResources();
    this.optimizeImages();
    
    if (this.config.enableMonitoring) {
      this.setupLightweightMonitoring();
    }
  }

  /**
   * Preload only critical resources
   */
  private preloadCriticalResources() {
    // Preload hero image only
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
  }

  /**
   * Optimize images without aggressive transformations
   */
  private optimizeImages() {
    // Only optimize images that don't have loading attributes
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img, index) => {
      const htmlImg = img as HTMLImageElement;
      // First 2 images load eagerly (above fold)
      (htmlImg as any).loading = index < 2 ? 'eager' : 'lazy';
      htmlImg.decoding = 'async';
    });
  }

  /**
   * Lightweight monitoring with proper cleanup
   */
  private setupLightweightMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Monitor only critical metrics with throttling
      const lcpObserver = new PerformanceObserver((list) => {
        if (this.config.throttleObservers) {
          list.getEntries().forEach((entry) => {
            if (entry.startTime > 4000) { // Only log slow LCP
              console.warn('Slow LCP detected:', entry.startTime);
            }
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Monitor CLS with strict limits
      const clsObserver = new PerformanceObserver((list) => {
        if (this.clsObservationCount >= this.config.maxCLSObservations) {
          clsObserver.disconnect();
          return;
        }

        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput && entry.value > 0.1) {
            this.clsObservationCount++;
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
   * Get simple performance metrics
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
export const performanceOptimizer = new PerformanceOptimizer();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceOptimizer.init();
    });
  } else {
    performanceOptimizer.init();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
}