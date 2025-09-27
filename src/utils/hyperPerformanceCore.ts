/**
 * HyperPerformanceCore - Ultra-aggressive optimization system
 * Designed to surpass Apple.com loading speeds
 */

class HyperPerformanceCore {
  private static instance: HyperPerformanceCore;
  private isInitialized = false;
  private criticalResourcesLoaded = false;
  private performanceMetrics = {
    startTime: 0,
    domContentLoaded: 0,
    windowLoaded: 0,
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0
  };

  private constructor() {}

  static getInstance(): HyperPerformanceCore {
    if (!HyperPerformanceCore.instance) {
      HyperPerformanceCore.instance = new HyperPerformanceCore();
    }
    return HyperPerformanceCore.instance;
  }

  /**
   * Check if HyperPerformanceCore is initialized
   */
  get initialized() {
    return this.isInitialized;
  }

  /**
   * Initialize ultra-fast loading optimizations
   */
  init() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    this.performanceMetrics.startTime = performance.now();
    
    // Immediate critical optimizations
    this.applyImmediateOptimizations();
    
    // Preload absolutely critical resources
    this.preloadCriticalResources();
    
    // Setup advanced caching strategies
    this.setupAdvancedCaching();
    
    // Enable instant navigation
    this.enableHyperInstantNavigation();
    
    // Optimize DOM rendering
    this.optimizeDOMRendering();
    
    // Monitor and optimize continuously
    this.setupContinuousOptimization();
    
    this.isInitialized = true;
  }

  /**
   * Apply immediate performance boosts
   */
  private applyImmediateOptimizations() {
    // Disable unused browser features during loading
    if (typeof document !== 'undefined') {
      // Optimize CSS rendering
      const style = document.createElement('style');
      style.textContent = `
        /* Ultra-fast CSS containment and rendering optimizations */
        html { 
          font-display: swap; 
          text-rendering: optimizeSpeed;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        body { 
          contain: layout style paint;
          will-change: contents;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Critical above-the-fold optimization */
        .hero-section, .navbar, .main-content { 
          contain: layout style;
          will-change: transform;
          transform: translateZ(0);
        }
        
        /* Aggressive image optimization */
        img, picture, video { 
          content-visibility: auto;
          contain: layout style paint;
          will-change: transform;
          image-rendering: -webkit-optimize-contrast;
        }
        
        /* Optimize animations for 60fps+ */
        [class*="animate-"], [class*="transition-"] {
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* Optimize scrolling performance */
        * {
          scroll-behavior: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Critical resource hints */
        .preload-critical {
          font-display: swap;
          content-visibility: auto;
        }
      `;
      document.head.appendChild(style);
      
      // Disable smooth scrolling during initial load for speed
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  /**
   * Preload only the most critical resources
   */
  private preloadCriticalResources() {
    const criticalResources = [
      // Hero image - highest priority
      {
        href: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
        as: 'image',
        fetchPriority: 'high'
      },
      // Critical font
      {
        href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        fetchPriority: 'high'
      }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      Object.assign(link, resource);
      document.head.appendChild(link);
    });

    // Preconnect to critical domains with highest priority
    const criticalDomains = [
      'https://dthlgsnakhoftinssokm.supabase.co',
      'https://fonts.gstatic.com',
      'https://vitals.vercel-insights.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Setup advanced caching strategies
   */
  private setupAdvancedCaching() {
    // Implement aggressive browser caching
    if ('caches' in window) {
      const criticalAssets = [
        '/src/main.tsx',
        '/src/App.tsx',
        '/src/index.css',
        '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
      ];

      caches.open('talentxcel-v1').then(cache => {
        cache.addAll(criticalAssets.filter(asset => 
          !asset.includes('localhost') && !asset.includes('preview')
        ));
      });
    }

    // Setup memory-efficient resource caching
    const resourceCache = new Map();
    
    // Override fetch for critical resources
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      
      // Cache API responses for 5 minutes
      if (url.includes('/api/') && resourceCache.has(url)) {
        const cached = resourceCache.get(url);
        if (Date.now() - cached.timestamp < 300000) { // 5 minutes
          return Promise.resolve(new Response(JSON.stringify(cached.data), {
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
      
      const response = await originalFetch(input, init);
      
      // Cache successful API responses
      if (url.includes('/api/') && response.ok) {
        const clonedResponse = response.clone();
        clonedResponse.json().then(data => {
          resourceCache.set(url, { data, timestamp: Date.now() });
        });
      }
      
      return response;
    };
  }

  /**
   * Enable hyper-instant navigation
   */
  private enableHyperInstantNavigation() {
    const prefetchedLinks = new Set<string>();
    
    // Aggressive link prefetching on mousedown and mouseover
    const prefetchLink = (href: string) => {
      if (prefetchedLinks.has(href)) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.fetchPriority = 'low';
      document.head.appendChild(link);
      prefetchedLinks.add(href);
    };

    // Prefetch on hover with 50ms delay for intent detection
    let hoverTimeout: number;
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link?.hostname === location.hostname) {
        clearTimeout(hoverTimeout);
        hoverTimeout = window.setTimeout(() => {
          prefetchLink(link.href);
        }, 50);
      }
    }, { passive: true });

    // Immediate prefetch on mousedown
    document.addEventListener('mousedown', (e) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link?.hostname === location.hostname) {
        prefetchLink(link.href);
      }
    }, { passive: true, capture: true });

    // Prefetch visible links in viewport
    if ('IntersectionObserver' in window) {
      const linkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            prefetchLink(link.href);
          }
        });
      }, { rootMargin: '50px' });

      // Observe all links after DOM is ready
      const observeLinks = () => {
        document.querySelectorAll('a[href]').forEach(link => {
          if ((link as HTMLAnchorElement).hostname === location.hostname) {
            linkObserver.observe(link);
          }
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeLinks);
      } else {
        observeLinks();
      }
    }
  }

  /**
   * Optimize DOM rendering performance
   */
  private optimizeDOMRendering() {
    // Batch DOM updates for better performance
    let scheduledUpdate = false;
    const batchUpdates = () => {
      if (scheduledUpdate) return;
      scheduledUpdate = true;
      
      requestAnimationFrame(() => {
        // Apply layout optimizations
        document.querySelectorAll('img:not([data-optimized])').forEach((img, index) => {
          const htmlImg = img as HTMLImageElement;
          
          // Critical images get high priority
          if (index < 3) {
            htmlImg.fetchPriority = 'high';
            htmlImg.loading = 'eager';
          } else {
            htmlImg.loading = 'lazy';
            htmlImg.fetchPriority = 'low';
          }
          
          htmlImg.decoding = 'async';
          htmlImg.setAttribute('data-optimized', 'true');
        });
        
        scheduledUpdate = false;
      });
    };

    // Monitor DOM changes and optimize
    if ('MutationObserver' in window) {
      const observer = new MutationObserver(() => {
        batchUpdates();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Setup continuous performance monitoring and optimization
   */
  private setupContinuousOptimization() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.performanceMetrics.firstContentfulPaint = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

      } catch (e) {
        console.debug('Performance observers not supported');
      }
    }

    // Cleanup unused resources periodically
    setInterval(() => {
      this.cleanupUnusedResources();
    }, 30000); // Every 30 seconds
  }

  /**
   * Clean up unused resources for memory efficiency
   */
  private cleanupUnusedResources() {
    // Remove unused prefetch links
    document.querySelectorAll('link[rel="prefetch"]:not([data-used])').forEach(link => {
      if (Math.random() > 0.7) { // Randomly cleanup 30% of unused prefetch links
        link.remove();
      }
    });

    // Force garbage collection if available (dev only)
    if (typeof window !== 'undefined' && 'gc' in window && process.env.NODE_ENV === 'development') {
      (window as any).gc();
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      ...this.performanceMetrics,
      currentTime: performance.now(),
      timeToInteractive: performance.now() - this.performanceMetrics.startTime
    };
  }

  /**
   * Force enable smooth scrolling after initial load
   */
  enableSmoothScrolling() {
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }
}

// Export singleton instance
export const hyperPerformanceCore = HyperPerformanceCore.getInstance();

// Auto-initialize with delay to prevent conflicts
if (typeof document !== 'undefined') {
  // Initialize immediately for critical optimizations
  hyperPerformanceCore.init();
  
  // Enable smooth scrolling after page is loaded
  window.addEventListener('load', () => {
    hyperPerformanceCore.enableSmoothScrolling();
  });
}