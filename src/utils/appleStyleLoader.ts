/**
 * Apple-style ultra-fast page loading system
 * Implements aggressive prefetching and instant navigation
 */

interface LoadingState {
  isLoading: boolean;
  progress: number;
  startTime: number;
}

class AppleStyleLoader {
  private static instance: AppleStyleLoader;
  private loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    startTime: 0
  };
  private prefetchQueue = new Set<string>();
  private loadedResources = new Set<string>();
  private criticalResourcesLoaded = false;

  private constructor() {}

  static getInstance(): AppleStyleLoader {
    if (!AppleStyleLoader.instance) {
      AppleStyleLoader.instance = new AppleStyleLoader();
    }
    return AppleStyleLoader.instance;
  }

  /**
   * Initialize Apple-style loading with ultra-fast optimizations
   */
  init() {
    this.setupInstantLoading();
    this.setupProgressiveLoading();
    this.setupSmartPrefetching();
    this.optimizeNetworkRequests();
  }

  /**
   * Setup instant loading for critical resources
   */
  private setupInstantLoading() {
    // Critical resource loading with highest priority
    const criticalResources = [
      '/src/main.tsx',
      '/src/App.tsx',
      '/src/index.css',
      '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    ];

    criticalResources.forEach(resource => {
      this.preloadResource(resource, 'high');
    });

    // Font loading optimization
    this.optimizeFontLoading();
  }

  /**
   * Optimize font loading like Apple
   */
  private optimizeFontLoading() {
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // System font fallback for instant text rendering
    const fallbackStyle = document.createElement('style');
    fallbackStyle.textContent = `
      @font-face {
        font-family: 'InterFallback';
        src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto');
        font-display: swap;
        font-weight: 100 900;
      }
      
      body { 
        font-family: 'Inter', 'InterFallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `;
    document.head.appendChild(fallbackStyle);
  }

  /**
   * Setup progressive loading for non-critical resources
   */
  private setupProgressiveLoading() {
    const loadingSteps = [
      { resources: ['navigation', 'hero'], weight: 40 },
      { resources: ['content', 'images'], weight: 30 },
      { resources: ['footer', 'analytics'], weight: 20 },
      { resources: ['extras', 'prefetch'], weight: 10 }
    ];

    let currentProgress = 0;
    
    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        currentProgress += step.weight;
        this.updateLoadingProgress(currentProgress);
        
        if (currentProgress >= 100) {
          this.completeLoading();
        }
      }, index * 50); // Stagger loading by 50ms
    });
  }

  /**
   * Smart prefetching based on user behavior
   */
  private setupSmartPrefetching() {
    let mouseIdleTimer: number;
    let isMouseIdle = false;

    // Track mouse movement for intelligent prefetching
    document.addEventListener('mousemove', () => {
      if (isMouseIdle) {
        isMouseIdle = false;
        this.startAggressivePrefetching();
      }
      
      clearTimeout(mouseIdleTimer);
      mouseIdleTimer = window.setTimeout(() => {
        isMouseIdle = true;
        this.pausePrefetching();
      }, 2000);
    }, { passive: true });

    // Prefetch based on scroll direction
    let lastScrollY = 0;
    document.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      if (scrollDirection === 'down') {
        this.prefetchNextPageResources();
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  /**
   * Optimize network requests for speed
   */
  private optimizeNetworkRequests() {
    // Implement request batching
    const requestQueue: Array<() => Promise<any>> = [];
    let batchTimeout: number;

    const processBatch = () => {
      const batch = requestQueue.splice(0, 5); // Process 5 requests at a time
      Promise.all(batch.map(request => request()));
    };

    const addToBatch = (request: () => Promise<any>) => {
      requestQueue.push(request);
      clearTimeout(batchTimeout);
      batchTimeout = window.setTimeout(processBatch, 10);
    };

    // Override fetch for batching
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      
      // High priority requests execute immediately
      if (url.includes('/api/auth') || url.includes('/api/critical')) {
        return originalFetch(input, init);
      }
      
      // Batch other requests
      return new Promise((resolve, reject) => {
        addToBatch(() => originalFetch(input, init).then(resolve).catch(reject));
      });
    };
  }

  /**
   * Preload resource with priority
   */
  private preloadResource(url: string, priority: 'high' | 'low' = 'low') {
    if (this.loadedResources.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.js') || url.endsWith('.tsx')) {
      link.as = 'script';
    } else if (url.includes('image') || url.endsWith('.png') || url.endsWith('.jpg')) {
      link.as = 'image';
    }
    
    link.fetchPriority = priority;
    document.head.appendChild(link);
    this.loadedResources.add(url);
  }

  /**
   * Start aggressive prefetching when user is idle
   */
  private startAggressivePrefetching() {
    const potentialRoutes = [
      '/jobs',
      '/network',
      '/profile',
      '/tools',
      '/dashboard'
    ];

    potentialRoutes.forEach(route => {
      if (!this.prefetchQueue.has(route)) {
        this.prefetchRoute(route);
        this.prefetchQueue.add(route);
      }
    });
  }

  /**
   * Pause prefetching to save bandwidth
   */
  private pausePrefetching() {
    // Clear prefetch links that haven't been used
    document.querySelectorAll('link[rel="prefetch"]:not([data-used])').forEach(link => {
      if (Math.random() > 0.5) { // Remove 50% of unused prefetch links
        link.remove();
      }
    });
  }

  /**
   * Prefetch next page resources based on current page
   */
  private prefetchNextPageResources() {
    const currentPath = window.location.pathname;
    const nextRoutes: { [key: string]: string[] } = {
      '/': ['/jobs', '/profile'],
      '/jobs': ['/jobs1', '/network'],
      '/profile': ['/tools', '/dashboard'],
      '/tools': ['/resume/builder', '/ai-services']
    };

    const routes = nextRoutes[currentPath] || [];
    routes.forEach(route => this.prefetchRoute(route));
  }

  /**
   * Prefetch a route
   */
  private prefetchRoute(route: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.fetchPriority = 'low';
    document.head.appendChild(link);
  }

  /**
   * Update loading progress
   */
  private updateLoadingProgress(progress: number) {
    this.loadingState.progress = Math.min(progress, 100);
    
    // Dispatch custom event for loading progress
    window.dispatchEvent(new CustomEvent('loadingProgress', {
      detail: { progress: this.loadingState.progress }
    }));
  }

  /**
   * Complete loading process
   */
  private completeLoading() {
    this.loadingState.isLoading = false;
    this.loadingState.progress = 100;
    this.criticalResourcesLoaded = true;

    // Dispatch completion event
    window.dispatchEvent(new CustomEvent('loadingComplete', {
      detail: { 
        loadTime: performance.now() - this.loadingState.startTime,
        metrics: this.getPerformanceMetrics()
      }
    }));

    // Enable additional optimizations after loading
    this.enablePostLoadOptimizations();
  }

  /**
   * Enable optimizations after initial load
   */
  private enablePostLoadOptimizations() {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Start background prefetching
    this.startBackgroundPrefetching();
    
    // Optimize images
    this.optimizeImages();
  }

  /**
   * Start background prefetching of likely next pages
   */
  private startBackgroundPrefetching() {
    // Use requestIdleCallback for non-critical prefetching
    const prefetchWhenIdle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        setTimeout(callback, 1);
      }
    };

    prefetchWhenIdle(() => {
      this.startAggressivePrefetching();
    });
  }

  /**
   * Optimize images for performance
   */
  private optimizeImages() {
    document.querySelectorAll('img:not([data-optimized])').forEach((img, index) => {
      const htmlImg = img as HTMLImageElement;
      
      // First 3 images get high priority
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
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
  }

  /**
   * Get current loading state
   */
  getLoadingState() {
    return { ...this.loadingState };
  }
}

// Export singleton instance
export const appleStyleLoader = AppleStyleLoader.getInstance();

// Auto-initialize
if (typeof document !== 'undefined') {
  appleStyleLoader.init();
}