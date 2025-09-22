/**
 * TurboCore - Ultra-lightweight Apple-style performance optimization
 * Minimal overhead, maximum impact
 */

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
   * Ultra-fast initialization - Apple style
   */
  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    // Critical resource preloading (non-blocking)
    this.preloadCritical();
    
    // Instant navigation setup
    this.enableInstantNav();
    
    // Image optimization
    requestIdleCallback(() => {
      this.optimizeImages();
    });

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

    // Critical font preload
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

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

// Auto-initialize on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => turboCore.init());
  } else {
    turboCore.init();
  }
}

// Cleanup on unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => turboCore.cleanup());
}