// Resource preloader for critical performance optimization
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();
  
  // Preload critical CSS and fonts
  static preloadCriticalResources() {
    // Preconnect to external domains
    this.preconnectToDomain('https://dthlgsnakhoftinssokm.supabase.co');
    this.preconnectToDomain('https://vitals.vercel-insights.com');
    this.preconnectToDomain('https://vercel.live');
  }

  // Preconnect to external domains
  static preconnectToDomain(domain: string) {
    if (typeof document === 'undefined' || this.preloadedResources.has(domain)) return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    this.preloadedResources.add(domain);
  }

  // DNS prefetch for external domains
  static dnsPrefetch(domain: string) {
    if (typeof document === 'undefined' || this.preloadedResources.has(`dns-${domain}`)) return;
    
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    
    document.head.appendChild(link);
    this.preloadedResources.add(`dns-${domain}`);
  }

  // Preload critical API routes
  static preloadCriticalAPI() {
    if (typeof window === 'undefined') return;
    
    const criticalRoutes = [
      '/api/user/profile',
      '/api/jobs/trending',
      '/api/network/feed'
    ];

    criticalRoutes.forEach(route => {
      fetch(route, { method: 'HEAD' }).catch(() => {
        // Silently fail - this is just for preloading
      });
    });
  }

  // Intelligent route prefetching
  static prefetchRoute(route: string) {
    if (typeof document === 'undefined' || this.preloadedResources.has(`route-${route}`)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    
    document.head.appendChild(link);
    this.preloadedResources.add(`route-${route}`);
  }

  // Preload images with IntersectionObserver
  static observeImagePreload() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

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
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Initialize all preloading
  static init() {
    if (typeof window === 'undefined') return;
    
    // Run immediately
    this.preloadCriticalResources();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.observeImagePreload();
        this.preloadCriticalAPI();
      });
    } else {
      this.observeImagePreload();
      this.preloadCriticalAPI();
    }
  }
}

// Auto-initialize on import
ResourcePreloader.init();