// Performance optimization utilities
export class PerformanceBooster {
  private static instance: PerformanceBooster;
  private preloadedModules = new Map<string, Promise<any>>();
  private resourceHints = new Set<string>();

  static getInstance(): PerformanceBooster {
    if (!PerformanceBooster.instance) {
      PerformanceBooster.instance = new PerformanceBooster();
    }
    return PerformanceBooster.instance;
  }

  // Preload critical modules
  preloadModule(importFn: () => Promise<any>, key: string): Promise<any> {
    if (!this.preloadedModules.has(key)) {
      this.preloadedModules.set(key, importFn());
    }
    return this.preloadedModules.get(key)!;
  }

  // Add resource hints for better loading
  addResourceHint(url: string, type: 'preload' | 'prefetch' | 'dns-prefetch' = 'prefetch') {
    if (this.resourceHints.has(url)) return;
    
    this.resourceHints.add(url);
    const link = document.createElement('link');
    link.rel = type;
    
    if (type === 'dns-prefetch') {
      link.href = url;
    } else {
      link.href = url;
      if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }
    }
    
    document.head.appendChild(link);
  }

  // Optimize images with lazy loading
  optimizeImage(img: HTMLImageElement) {
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
    
    if ('decoding' in img) {
      img.decoding = 'async';
    }

    // Add intersection observer for older browsers
    if (!('loading' in HTMLImageElement.prototype)) {
      this.addIntersectionObserver(img);
    }
  }

  private addIntersectionObserver(img: HTMLImageElement) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            const src = target.dataset.src;
            if (src) {
              target.src = src;
              target.removeAttribute('data-src');
            }
            observer.unobserve(target);
          }
        });
      }, { rootMargin: '50px' });
      
      observer.observe(img);
    }
  }

  // Bundle splitting for faster loading
  preloadCriticalRoutes() {
    const criticalRoutes = [
      () => import('@/pages/Platform'),
      () => import('@/components/auth/UnifiedAuthForm'),
      () => import('@/pages/UnifiedDashboard'),
      () => import('@/components/navigation/Navbar')
    ];

    criticalRoutes.forEach((route, index) => {
      this.preloadModule(route, `critical-route-${index}`);
    });
  }

  // Optimize fonts loading
  optimizeFonts() {
    const fontUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    fontUrls.forEach(url => {
      this.addResourceHint(url, 'dns-prefetch');
    });
  }

  // Remove unused CSS at runtime
  removeUnusedCSS() {
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        const stylesheets = Array.from(document.styleSheets);
        stylesheets.forEach(stylesheet => {
          try {
            if (stylesheet.href && !stylesheet.href.includes(window.location.origin)) {
              return; // Skip external stylesheets
            }

            const rules = Array.from(stylesheet.cssRules || stylesheet.rules);
            const usedSelectors = new Set<string>();
            
            rules.forEach(rule => {
              if (rule instanceof CSSStyleRule) {
                try {
                  if (document.querySelector(rule.selectorText)) {
                    usedSelectors.add(rule.selectorText);
                  }
                } catch (e) {
                  // Invalid selector, keep it
                  usedSelectors.add(rule.selectorText);
                }
              }
            });
          } catch (e) {
            // Cannot access stylesheet
          }
        });
      }, 2000);
    }
  }

  // Initialize all optimizations
  initialize() {
    // Preload critical routes
    this.preloadCriticalRoutes();
    
    // Optimize fonts
    this.optimizeFonts();
    
    // Add DNS prefetch for common domains
    const domains = [
      'https://supabase.co',
      'https://googleapis.com',
      'https://gstatic.com'
    ];
    
    domains.forEach(domain => {
      this.addResourceHint(domain, 'dns-prefetch');
    });

    // Remove unused CSS after page load
    if (document.readyState === 'complete') {
      this.removeUnusedCSS();
    } else {
      window.addEventListener('load', () => this.removeUnusedCSS(), { once: true });
    }
  }
}

// Initialize performance booster
export const performanceBooster = PerformanceBooster.getInstance();
