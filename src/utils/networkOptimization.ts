// Network optimization utilities
export interface NetworkConfig {
  compression: boolean;
  http2Push: string[];
  resourceHints: {
    preload: string[];
    prefetch: string[];
    preconnect: string[];
  };
}

export const networkConfig: NetworkConfig = {
  compression: true,
  http2Push: [
    '/src/index.css',
    '/src/assets/logo.svg',
    '/fonts/inter-var.woff2'
  ],
  resourceHints: {
    preload: [
      '/src/index.css',
      '/fonts/inter-var.woff2'
    ],
    prefetch: [
      '/src/components/social/SocialFeed.tsx',
      '/src/components/mobile/MobileLayout.tsx'
    ],
    preconnect: [
      'https://fonts.googleapis.com',
      'https://api.supabase.co'
    ]
  }
};

// Dynamic resource loading based on viewport and interaction
export class AdaptiveResourceLoader {
  private observer: IntersectionObserver | null = null;
  private loadedResources = new Set<string>();

  constructor() {
    this.initIntersectionObserver();
  }

  private initIntersectionObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const resource = element.dataset.resource;
              if (resource && !this.loadedResources.has(resource)) {
                this.loadResource(resource);
                this.loadedResources.add(resource);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );
    }
  }

  observeElement(element: HTMLElement, resource: string) {
    if (this.observer) {
      element.dataset.resource = resource;
      this.observer.observe(element);
    }
  }

  private async loadResource(resource: string) {
    try {
      if (resource.endsWith('.js')) {
        await import(resource);
      } else if (resource.endsWith('.css')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = resource;
        document.head.appendChild(link);
      } else {
        // Prefetch other resources
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      }
    } catch (error) {
      console.warn('Failed to load resource:', resource, error);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Network quality adaptive loading
export const adaptiveLoader = {
  // Detect connection speed and adjust loading strategy
  getOptimalLoadingStrategy: () => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const downlink = conn.downlink || 1;
      const effectiveType = conn.effectiveType || '3g';

      if (effectiveType === '4g' && downlink > 10) {
        return {
          strategy: 'eager',
          maxConcurrent: 6,
          imageQuality: 95,
          preloadDistance: 2000
        };
      } else if (effectiveType === '3g' || downlink > 1) {
        return {
          strategy: 'balanced',
          maxConcurrent: 3,
          imageQuality: 80,
          preloadDistance: 1000
        };
      }
    }

    return {
      strategy: 'conservative',
      maxConcurrent: 2,
      imageQuality: 60,
      preloadDistance: 500
    };
  },

  // Apply resource hints based on network conditions
  applyResourceHints: () => {
    const strategy = adaptiveLoader.getOptimalLoadingStrategy();
    
    // Only apply aggressive hints on fast connections
    if (strategy.strategy === 'eager') {
      networkConfig.resourceHints.preload.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = href.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    }

    // Always apply preconnect hints
    networkConfig.resourceHints.preconnect.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
};

// Initialize network optimizations
export const initNetworkOptimizations = () => {
  if (typeof document !== 'undefined') {
    // Apply resource hints
    adaptiveLoader.applyResourceHints();

    // Set up adaptive resource loader
    const resourceLoader = new AdaptiveResourceLoader();
    
    // Observe elements that need adaptive loading
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-adaptive-load]').forEach(element => {
        const resource = element.getAttribute('data-adaptive-load');
        if (resource) {
          resourceLoader.observeElement(element as HTMLElement, resource);
        }
      });
    });

    return resourceLoader;
  }
  return null;
};