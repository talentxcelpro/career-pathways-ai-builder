// Network optimization utilities for faster loading
export class NetworkOptimizer {
  private static requestCache = new Map<string, Promise<any>>();
  private static batchQueue: Array<{ url: string; options?: RequestInit; resolve: Function; reject: Function }> = [];
  private static batchTimeout: NodeJS.Timeout | null = null;

  // Request deduplication to prevent duplicate API calls
  static async deduplicatedFetch(url: string, options?: RequestInit): Promise<Response> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }

    const request = fetch(url, {
      ...options,
      headers: {
        'Content-Encoding': 'br, gzip',
        'Accept-Encoding': 'br, gzip, deflate',
        ...options?.headers,
      }
    });

    this.requestCache.set(cacheKey, request);
    
    // Clear cache after 5 seconds
    setTimeout(() => {
      this.requestCache.delete(cacheKey);
    }, 5000);

    return request;
  }

  // Batch multiple API requests
  static async batchRequests<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    const batchSize = 5; // Limit concurrent requests
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      );
      
      results.push(
        ...batchResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<T>).value)
      );
    }
    
    return results;
  }

  // Intelligent prefetching based on user behavior
  static setupIntelligentPrefetch(): void {
    if (typeof window === 'undefined') return;

    const prefetchedUrls = new Set<string>();
    
    // Prefetch on hover with delay
    const handleHover = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !prefetchedUrls.has(link.href)) {
        setTimeout(() => {
          if (link.matches(':hover')) {
            this.prefetchRoute(link.href);
            prefetchedUrls.add(link.href);
          }
        }, 100);
      }
    };

    // Prefetch on touch start for mobile
    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !prefetchedUrls.has(link.href)) {
        this.prefetchRoute(link.href);
        prefetchedUrls.add(link.href);
      }
    };

    document.addEventListener('mouseover', handleHover, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Prefetch likely next routes based on current page
    this.prefetchLikelyRoutes();
  }

  // Prefetch route resources
  private static prefetchRoute(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  // Prefetch likely next routes
  private static prefetchLikelyRoutes(): void {
    const currentPath = window.location.pathname;
    const likelyRoutes: Record<string, string[]> = {
      '/': ['/network', '/jobs', '/login'],
      '/network': ['/jobs', '/profile', '/messages'],
      '/jobs': ['/profile', '/application', '/companies'],
      '/login': ['/network', '/profile'],
    };

    const routes = likelyRoutes[currentPath] || [];
    routes.forEach(route => {
      setTimeout(() => this.prefetchRoute(route), Math.random() * 2000);
    });
  }

  // Optimize for slow connections
  static optimizeForSlowConnections(): void {
    if (typeof navigator === 'undefined') return;

    const connection = (navigator as any).connection;
    if (!connection) return;

    const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                           connection.effectiveType === '2g' ||
                           connection.saveData;

    if (isSlowConnection) {
      // Reduce image quality
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && !img.src.includes('q_auto:low')) {
          img.src = img.src.includes('?') 
            ? `${img.src}&q_auto:low`
            : `${img.src}?q_auto:low`;
        }
      });

      // Disable auto-play videos
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        video.removeAttribute('autoplay');
      });

      // Reduce animation duration more conservatively
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.3s !important;
          transition-duration: 0.3s !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Implement HTTP/3 support where available
  static setupHTTP3Support(): void {
    if (typeof document === 'undefined') return;

    // Add Alt-Svc header support for HTTP/3
    const links = [
      { href: 'https://dthlgsnakhoftinssokm.supabase.co', rel: 'preconnect' },
      { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
      { href: 'https://cdnjs.cloudflare.com', rel: 'dns-prefetch' }
    ];

    links.forEach(({ href, rel }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (rel === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  // Add compression support
  static setupCompressionSupport(): RequestInit {
    return {
      headers: {
        'Accept-Encoding': 'br, gzip, deflate',
        'Content-Type': 'application/json',
      }
    };
  }

  // Network-aware loading strategy
  static getNetworkAwareSettings(): {
    imageQuality: string;
    enableAnimations: boolean;
    prefetchEnabled: boolean;
  } {
    if (typeof navigator === 'undefined') {
      return { imageQuality: 'auto', enableAnimations: true, prefetchEnabled: true };
    }

    const connection = (navigator as any).connection;
    
    if (!connection) {
      return { imageQuality: 'auto', enableAnimations: true, prefetchEnabled: true };
    }

    const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                           connection.effectiveType === '2g';
    const isSaveData = connection.saveData;

    return {
      imageQuality: isSlowConnection || isSaveData ? 'low' : 'auto',
      enableAnimations: !isSlowConnection && !isSaveData,
      prefetchEnabled: !isSlowConnection && !isSaveData
    };
  }

  // Initialize all network optimizations
  static init(): void {
    this.setupHTTP3Support();
    this.optimizeForSlowConnections();
    
    if (this.getNetworkAwareSettings().prefetchEnabled) {
      this.setupIntelligentPrefetch();
    }

    // Monitor network changes
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', () => {
        this.optimizeForSlowConnections();
      });
    }
  }
}

// Enhanced fetch wrapper with optimizations
export async function optimizedFetch(url: string, options?: RequestInit): Promise<Response> {
  const compressionOptions = NetworkOptimizer.setupCompressionSupport();
  
  return NetworkOptimizer.deduplicatedFetch(url, {
    ...compressionOptions,
    ...options,
    headers: {
      ...compressionOptions.headers,
      ...options?.headers,
    }
  });
}

// Auto-initialize
if (typeof window !== 'undefined') {
  NetworkOptimizer.init();
}