/**
 * TurboCore - Ultra-lightweight Apple-style performance optimization
 * Minimal overhead, maximum impact
 */

// Removed polyfills import to prevent React conflicts

class TurboCore {
  private static instance: TurboCore;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TurboCore {
    if (!TurboCore.instance) {
      TurboCore.instance = new TurboCore();
    }
    return TurboCore.instance;
  }

  /**
   * Check if TurboCore is initialized
   */
  get initialized() {
    return this.isInitialized;
  }

  /**
   * Ultra-fast initialization - Apple style
   */
  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    // Critical resource preloading (non-blocking)
    this.preloadCritical();
    
    // Instant navigation setup
    this.enableInstantNav();
    
    // Image optimization with better browser compatibility
    const scheduleOptimization = () => {
      this.optimizeImages();
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && window.requestIdleCallback) {
      window.requestIdleCallback(scheduleOptimization);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(scheduleOptimization, 1);
    }

    this.isInitialized = true;
  }

  /**
   * Preload critical resources with highest priority
   */
  private preloadCritical() {
    // Hero image preload
    const heroLink = document.createElement('link');
    heroLink.rel = 'preload';
    heroLink.href = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
    heroLink.as = 'image';
    (heroLink as any).fetchPriority = 'high';
    document.head.appendChild(heroLink);



    // DNS prefetch critical domains
    ['//dthlgsnakhoftinssokm.supabase.co', '//fonts.gstatic.com'].forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Ultra-fast navigation with aggressive prefetching
   */
  private enableInstantNav() {
    const prefetched = new Set<string>();

    document.addEventListener('mouseover', (e) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link?.hostname === location.hostname && !prefetched.has(link.href)) {
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = link.href;
        document.head.appendChild(prefetch);
        prefetched.add(link.href);
      }
    }, { passive: true });
  }

  /**
   * Optimize images for instant loading
   */
  private optimizeImages() {
    const images = document.querySelectorAll('img:not([data-optimized])');
    images.forEach((img, index) => {
      const htmlImg = img as HTMLImageElement;
      
      // First image gets highest priority
      if (index === 0) {
        (htmlImg as any).fetchPriority = 'high';
        (htmlImg as any).loading = 'eager';
      } else {
        (htmlImg as any).loading = 'lazy';
        (htmlImg as any).fetchPriority = 'low';
      }
      
      htmlImg.decoding = 'async';
      htmlImg.setAttribute('data-optimized', 'true');
    });
  }

  /**
   * Clean shutdown
   */
  cleanup() {
    this.isInitialized = false;
  }
}

// Export singleton instance
export const turboCore = TurboCore.getInstance();

// Delayed auto-initialization to prevent React conflicts
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // Defer initialization until after React has mounted
  setTimeout(() => {
    if (!turboCore.initialized) {
      turboCore.init();
    }
  }, 100);
}

// Cleanup on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => turboCore.cleanup());
}