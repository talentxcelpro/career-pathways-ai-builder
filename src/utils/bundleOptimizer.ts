// Phase 4: Simplified Bundle Optimizer (using existing components only)
import { lazy } from 'react';

// Resource hints for critical resources
export class ResourceOptimizer {
  private static preloadedResources = new Set<string>();

  // Preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      '/fonts/inter-latin-400.woff2',
      '/fonts/inter-latin-500.woff2',
      '/fonts/inter-latin-600.woff2',
      '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png', // Logo
    ];

    criticalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        
        if (resource.includes('font')) {
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
        } else if (resource.includes('image') || resource.includes('.png') || resource.includes('.jpg')) {
          link.as = 'image';
        }
        
        document.head.appendChild(link);
        this.preloadedResources.add(resource);
      }
    });
  }

  // Prefetch next route resources
  static prefetchRoute(route: string) {
    const routeChunks = this.getRouteChunks(route);
    
    routeChunks.forEach(chunk => {
      if (!this.preloadedResources.has(chunk)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = chunk;
        link.as = 'script';
        document.head.appendChild(link);
        this.preloadedResources.add(chunk);
      }
    });
  }

  private static getRouteChunks(route: string): string[] {
    const chunkMap: Record<string, string[]> = {
      '/jobs': ['/src/pages/Jobs.tsx'],
      '/profile': ['/src/pages/Profile.tsx'],
      '/network': ['/src/pages/Network.tsx'],
      '/admin': ['/src/pages/Admin.tsx'],
    };
    
    return chunkMap[route] || [];
  }

  // Critical CSS inlining for above-the-fold content
  static inlineCriticalCSS() {
    const criticalCSS = `
      .hero-section { display: flex; align-items: center; min-height: 50vh; }
      .nav-container { position: sticky; top: 0; z-index: 50; }
      .loading-spinner { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    
    if (!document.querySelector('#critical-css')) {
      const style = document.createElement('style');
      style.id = 'critical-css';
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    }
  }
}

// Bundle analysis utilities
export class BundleAnalyzer {
  static measureBundleSize() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    return {
      totalJSSize: Math.round(totalJSSize / 1024), // KB
      totalCSSSize: Math.round(totalCSSSize / 1024), // KB
      jsChunks: jsResources.length,
      cssChunks: cssResources.length,
      loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    };
  }

  static reportBundleMetrics() {
    const metrics = this.measureBundleSize();
    
    // Report to analytics (if available)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', 'bundle_analysis', {
        custom_map: {
          js_size_kb: metrics.totalJSSize,
          css_size_kb: metrics.totalCSSSize,
          js_chunks: metrics.jsChunks,
          load_time_ms: metrics.loadTime,
        }
      });
    }
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.group('📦 Bundle Analysis');
      console.log(`JavaScript: ${metrics.totalJSSize}KB (${metrics.jsChunks} chunks)`);
      console.log(`CSS: ${metrics.totalCSSSize}KB (${metrics.cssChunks} chunks)`);
      console.log(`Total Load Time: ${metrics.loadTime}ms`);
      console.groupEnd();
    }
    
    return metrics;
  }
}

// Tree shaking utilities
export class TreeShakingOptimizer {
  // Dynamic imports for heavy libraries
  static async loadChartLibrary() {
    const recharts = await import('recharts');
    return recharts;
  }

  static async loadDateLibrary() {
    const dateFns = await import('date-fns');
    return dateFns;
  }

  static async loadImageLibrary() {
    const imageOptim = await import('@/utils/imageOptimizer');
    return imageOptim;
  }

  // Conditional loading based on features
  static async loadFeature(featureName: string) {
    const featureMap: Record<string, () => Promise<any>> = {
      'charts': () => import('recharts'),
      'calendar': () => import('react-big-calendar'),
      'pdf': () => import('pdfjs-dist'),
      'qr': () => import('qrcode.react'),
    };

    const loader = featureMap[featureName];
    if (!loader) {
      throw new Error(`Feature ${featureName} not found`);
    }

    return await loader();
  }
}

// Initialize optimizations
export function initializeBundleOptimization() {
  // Preload critical resources immediately
  ResourceOptimizer.preloadCriticalResources();
  
  // Inline critical CSS
  ResourceOptimizer.inlineCriticalCSS();
  
  // Report bundle metrics after load
  window.addEventListener('load', () => {
    // Delay to ensure all resources are loaded
    setTimeout(() => {
      BundleAnalyzer.reportBundleMetrics();
    }, 1000);
  });
  
  // Prefetch routes on interaction
  document.addEventListener('mouseenter', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (link && link.href && link.origin === window.location.origin) {
      const route = new URL(link.href).pathname;
      ResourceOptimizer.prefetchRoute(route);
    }
  }, { passive: true });
}