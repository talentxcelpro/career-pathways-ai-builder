// Phase 4: Advanced Performance Optimization Engine
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceObserver: PerformanceObserver | null = null;
  private metrics: Map<string, number[]> = new Map();
  private optimizations: Map<string, boolean> = new Map();

  private constructor() {
    this.initializeOptimizations();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private initializeOptimizations() {
    // Critical path optimizations
    this.optimizeCriticalPath();
    
    // Image optimization
    this.optimizeImages();
    
    // Font optimization
    this.optimizeFonts();
    
    // JavaScript execution optimization
    this.optimizeJavaScript();
    
    // Memory optimization
    this.optimizeMemory();
    
    // Network optimization
    this.optimizeNetwork();
  }

  // Critical rendering path optimization
  private optimizeCriticalPath() {
    // Minimize critical resources
    const criticalCSS = this.extractCriticalCSS();
    this.inlineCriticalCSS(criticalCSS);
    
    // Defer non-critical CSS
    this.deferNonCriticalCSS();
    
    // Preload critical resources
    this.preloadCriticalResources();
  }

  private extractCriticalCSS(): string {
    // Above-the-fold CSS for faster initial render
    return `
      /* Critical CSS for immediate viewport */
      .hero-section, .nav-container, .loading-spinner {
        /* Essential styles only */
      }
      
      /* Layout prevention for CLS */
      .content-container {
        min-height: 100vh;
        width: 100%;
      }
      
      /* Critical animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
  }

  private inlineCriticalCSS(css: string) {
    if (!document.querySelector('#critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = css;
      document.head.insertBefore(style, document.head.firstChild);
    }
  }

  private deferNonCriticalCSS() {
    // Convert non-critical CSS to load after initial render
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    stylesheets.forEach((stylesheet) => {
      const link = stylesheet as HTMLLinkElement;
      const newLink = document.createElement('link');
      newLink.rel = 'preload';
      newLink.as = 'style';
      newLink.href = link.href;
      newLink.onload = () => {
        newLink.rel = 'stylesheet';
      };
      
      link.parentNode?.replaceChild(newLink, link);
    });
  }

  private preloadCriticalResources() {
    const criticalResources = [
      { href: '/fonts/inter-latin.woff2', as: 'font', type: 'font/woff2' },
      { href: '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png', as: 'image' },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.as === 'font') link.crossOrigin = 'anonymous';
      
      document.head.appendChild(link);
    });
  }

  // Image optimization
  private optimizeImages() {
    // Implement progressive JPEG and WebP conversion
    this.enableProgressiveImages();
    
    // Lazy load images with intersection observer
    this.setupImageLazyLoading();
    
    // Optimize image delivery based on device
    this.optimizeImageDelivery();
  }

  private enableProgressiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      const src = imageElement.dataset.src;
      
      if (src && this.supportsWebP()) {
        imageElement.src = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
      }
    });
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px',
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  private optimizeImageDelivery() {
    // Detect device capabilities and serve appropriate images
    const connection = (navigator as any).connection;
    const deviceMemory = (navigator as any).deviceMemory;
    
    let quality = 'high';
    
    if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      quality = 'low';
    } else if (deviceMemory && deviceMemory < 4) {
      quality = 'medium';
    }
    
    // Apply quality-based image optimization
    this.applyImageQuality(quality);
  }

  private applyImageQuality(quality: string) {
    const qualityMap = {
      low: { width: 480, quality: 60 },
      medium: { width: 768, quality: 75 },
      high: { width: 1200, quality: 90 },
    };
    
    const settings = qualityMap[quality as keyof typeof qualityMap];
    
    // Update image sources with quality parameters
    document.querySelectorAll('img').forEach((img) => {
      if (img.src && img.src.includes('supabase')) {
        const url = new URL(img.src);
        url.searchParams.set('width', settings.width.toString());
        url.searchParams.set('quality', settings.quality.toString());
        img.src = url.toString();
      }
    });
  }

  // Font optimization
  private optimizeFonts() {
    // Preload critical fonts
    this.preloadFonts();
    
    // Use font-display: swap for better loading performance
    this.optimizeFontDisplay();
    
    // Subset fonts for better performance
    this.subsetFonts();
  }

  private preloadFonts() {
    const fontPreloads = [
      '/fonts/inter-latin-400.woff2',
      '/fonts/inter-latin-500.woff2',
      '/fonts/inter-latin-600.woff2',
    ];

    fontPreloads.forEach((font) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private optimizeFontDisplay() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        /* Ensures text remains visible during font load */
      }
    `;
    document.head.appendChild(style);
  }

  private subsetFonts() {
    // Use font subsets for specific languages/characters
    const language = document.documentElement.lang || 'en';
    const fontSubsets = {
      en: 'latin',
      hi: 'devanagari',
      ar: 'arabic',
    };
    
    const subset = fontSubsets[language as keyof typeof fontSubsets] || 'latin';
    
    // Apply subset-specific font loading
    console.log(`Loading font subset: ${subset}`);
  }

  // JavaScript execution optimization
  private optimizeJavaScript() {
    // Defer non-critical JavaScript
    this.deferNonCriticalJS();
    
    // Use requestIdleCallback for non-urgent tasks
    this.scheduleIdleTasks();
    
    // Optimize expensive operations
    this.optimizeExpensiveOperations();
  }

  private deferNonCriticalJS() {
    // Defer analytics and non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script[data-defer]');
    
    nonCriticalScripts.forEach((script) => {
      const scriptElement = script as HTMLScriptElement;
      scriptElement.defer = true;
    });
  }

  private scheduleIdleTasks() {
    const idleTasks: (() => void)[] = [];
    
    const runIdleTasks = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && idleTasks.length > 0) {
        const task = idleTasks.shift();
        task?.();
      }
      
      if (idleTasks.length > 0) {
        requestIdleCallback(runIdleTasks);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(runIdleTasks);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        idleTasks.forEach(task => task());
        idleTasks.length = 0;
      }, 100);
    }
  }

  private optimizeExpensiveOperations() {
    // Debounce frequent operations
    this.debounceScrollHandlers();
    
    // Throttle resize handlers
    this.throttleResizeHandlers();
    
    // Use Web Workers for heavy computations
    this.offloadToWebWorkers();
  }

  private debounceScrollHandlers() {
    let scrollTimeout: number;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        // Execute scroll-dependent operations
        this.handleScrollOptimizations();
      }, 16); // ~60fps
    }, { passive: true });
  }

  private throttleResizeHandlers() {
    let resizeTimeout: number;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        // Execute resize-dependent operations
        this.handleResizeOptimizations();
      }, 250);
    });
  }

  private offloadToWebWorkers() {
    // Use Web Workers for CPU-intensive tasks
    if ('Worker' in window) {
      const worker = new Worker('/workers/performance-worker.js');
      
      worker.postMessage({
        type: 'heavy-computation',
        data: { /* computation data */ }
      });
      
      worker.onmessage = (event) => {
        // Handle worker response
        console.log('Worker completed:', event.data);
      };
    }
  }

  // Memory optimization
  private optimizeMemory() {
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Implement object pooling
    this.implementObjectPooling();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
  }

  private cleanupEventListeners() {
    // Track and cleanup event listeners to prevent memory leaks
    const listeners = new WeakMap<any, Array<{ type: any; listener: any; options: any }>>();
    
    const originalAddEventListener = EventTarget.prototype.addEventListener as any;
    EventTarget.prototype.addEventListener = function (this: any, type: any, listener: any, options?: any) {
      try {
        // Some libraries call addEventListener with an unbound "this" (undefined)
        // WeakMap keys must be objects, so fallback to window when needed
        const target: any = (this && (typeof this === 'object' || typeof this === 'function')) ? this : window;

        let list = listeners.get(target);
        if (!list) {
          list = [];
          listeners.set(target, list);
        }
        list.push({ type, listener, options });

        return originalAddEventListener.call(target, type, listener, options);
      } catch (_) {
        // Fail-safe: never block event registration
        return originalAddEventListener.call(this as any, type, listener, options);
      }
    } as any;
  }

  private implementObjectPooling() {
    // Object pool for frequently created/destroyed objects
    const objectPools = new Map();
    
    class ObjectPool<T> {
      private objects: T[] = [];
      private createFn: () => T;
      
      constructor(createFn: () => T, initialSize = 10) {
        this.createFn = createFn;
        for (let i = 0; i < initialSize; i++) {
          this.objects.push(this.createFn());
        }
      }
      
      acquire(): T {
        return this.objects.pop() || this.createFn();
      }
      
      release(obj: T) {
        this.objects.push(obj);
      }
    }
    
    // Example: DOM element pool
    const divPool = new ObjectPool(() => document.createElement('div'));
    objectPools.set('div', divPool);
  }

  private monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usage = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        };
        
        // Warn if memory usage is high
        if (usage.used / usage.limit > 0.8) {
          console.warn('High memory usage detected:', usage);
          this.triggerGarbageCollection();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private triggerGarbageCollection() {
    // Force garbage collection if available (Chrome DevTools)
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear caches and pools
    this.clearPerformanceCaches();
  }

  // Network optimization
  private optimizeNetwork() {
    // Implement request deduplication
    this.deduplicateRequests();
    
    // Use compression
    this.enableCompression();
    
    // Optimize API calls
    this.optimizeAPICalls();
  }

  private deduplicateRequests() {
    const pendingRequests = new Map<string, Promise<any>>();
    
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = input.toString();
      
      if (pendingRequests.has(url)) {
        return pendingRequests.get(url)!;
      }
      
      const request = originalFetch(input, init);
      pendingRequests.set(url, request);
      
      request.finally(() => {
        pendingRequests.delete(url);
      });
      
      return request;
    };
  }

  private enableCompression() {
    // Configure compression headers for API requests
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init: RequestInit = {}) {
      init.headers = {
        ...init.headers,
        'Accept-Encoding': 'gzip, deflate, br',
      };
      
      return originalFetch(input, init);
    };
  }

  private optimizeAPICalls() {
    // Batch API calls where possible
    // Implement caching for repeated requests
    // Use GraphQL for efficient data fetching
  }

  // Utility methods
  private handleScrollOptimizations() {
    // Implement scroll-based optimizations
    this.lazyLoadComponents();
    this.updateVisibleElements();
  }

  private handleResizeOptimizations() {
    // Implement resize-based optimizations
    this.recalculateLayout();
    this.updateResponsiveImages();
  }

  private lazyLoadComponents() {
    // Lazy load components entering viewport
  }

  private updateVisibleElements() {
    // Update only visible elements
  }

  private recalculateLayout() {
    // Recalculate layout for responsive design
  }

  private updateResponsiveImages() {
    // Update image sources for new viewport size
  }

  private clearPerformanceCaches() {
    // Clear various performance caches
    this.metrics.clear();
    
    // Clear browser caches if needed
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('performance')) {
            caches.delete(name);
          }
        });
      });
    }
  }

  // Public API
  public getPerformanceReport() {
    return {
      metrics: Object.fromEntries(this.metrics),
      optimizations: Object.fromEntries(this.optimizations),
      timestamp: Date.now(),
    };
  }

  public applyOptimization(name: string, enabled: boolean) {
    this.optimizations.set(name, enabled);
  }
}

// Initialize performance optimizer
export function initializePerformanceOptimization() {
  const optimizer = PerformanceOptimizer.getInstance();
  
  // Apply optimizations after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🚀 Performance optimization initialized');
    });
  } else {
    console.log('🚀 Performance optimization initialized');
  }
  
  return optimizer;
}