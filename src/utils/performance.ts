// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  
  constructor() {
    this.initializeWebVitals();
  }

  private initializeWebVitals() {
    // Core Web Vitals monitoring
    if (typeof window !== 'undefined') {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const fcpEntry = list.getEntries().find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          this.reportMetric('fcp', fcpEntry.startTime);
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.metrics.lcp = lcpEntry.startTime;
          this.reportMetric('lcp', lcpEntry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const fidEntry = list.getEntries()[0] as any;
        if (fidEntry) {
          this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          this.reportMetric('fid', this.metrics.fid);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.reportMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  private reportMetric(name: string, value: number) {
    // Report to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: 'performance_monitoring'
      });
    }
    
    console.log(`Performance Metric - ${name}:`, Math.round(value));
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

// Resource hints for critical assets
export const preloadCriticalResources = () => {
  if (typeof document === 'undefined') return;

  const criticalAssets = [
    // Critical fonts
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
    // Critical CSS would be inlined, but we can preload additional stylesheets
  ];

  criticalAssets.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Image optimization utilities
export const optimizeImageUrl = (url: string, width?: number, quality = 80): string => {
  if (!url) return '';
  
  // If it's already optimized or external, return as-is
  if (url.includes('?') || url.startsWith('http') || url.includes('supabase')) {
    return url;
  }
  
  // Add optimization parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());
  params.append('f', 'webp');
  
  return `${url}?${params.toString()}`;
};

// Lazy loading intersection observer
export const createLazyLoader = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
};

// Bundle size monitoring
export const monitorBundleSize = () => {
  if (typeof window === 'undefined') return;
  
  // Monitor resource sizes
  window.addEventListener('load', () => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    
    entries.forEach(entry => {
      if (entry.transferSize) {
        totalSize += entry.transferSize;
      }
    });
    
    console.log('Total resource size:', (totalSize / 1024 / 1024).toFixed(2) + 'MB');
    
    // Report large bundles
    const largeResources = entries.filter(entry => 
      entry.transferSize > 100 * 1024 // > 100KB
    );
    
    if (largeResources.length > 0) {
      console.warn('Large resources detected:', largeResources.map(r => ({
        name: r.name,
        size: Math.round(r.transferSize / 1024) + 'KB'
      })));
    }
  });
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const budgets = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    totalSize: 2 * 1024 * 1024 // 2MB
  };
  
  // This would integrate with your monitoring system
  return budgets;
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  const monitor = new PerformanceMonitor();
  preloadCriticalResources();
  monitorBundleSize();
  
  return monitor;
};