// Performance budget monitoring and enforcement
export interface PerformanceBudget {
  lcp: number;      // Largest Contentful Paint (ms)
  fid: number;      // First Input Delay (ms) 
  cls: number;      // Cumulative Layout Shift
  ttfb: number;     // Time to First Byte (ms)
  bundleSize: number; // JS bundle size (KB)
  imageSize: number;  // Image size limit (KB)
}

export const PERFORMANCE_TARGETS: PerformanceBudget = {
  lcp: 1600,    // ≤ 1.6s
  fid: 100,     // ≤ 100ms
  cls: 0.05,    // ≤ 0.05
  ttfb: 200,    // ≤ 200ms
  bundleSize: 150, // ≤ 150KB gzipped
  imageSize: 300   // ≤ 300KB above fold
};

export class PerformanceBudgetMonitor {
  private static violations: string[] = [];

  // Monitor Core Web Vitals
  static monitorWebVitals() {
    if (typeof window === 'undefined') return;

    // Monitor LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry && lastEntry.startTime > PERFORMANCE_TARGETS.lcp) {
        this.logViolation('LCP', lastEntry.startTime, PERFORMANCE_TARGETS.lcp);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart - entry.startTime > PERFORMANCE_TARGETS.fid) {
          this.logViolation('FID', entry.processingStart - entry.startTime, PERFORMANCE_TARGETS.fid);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Monitor CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      if (clsValue > PERFORMANCE_TARGETS.cls) {
        this.logViolation('CLS', clsValue, PERFORMANCE_TARGETS.cls);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Monitor bundle size
  static checkBundleSize() {
    if (typeof navigator === 'undefined') return;

    // Estimate bundle size from network timing
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navTiming) {
      const transferSize = navTiming.transferSize || 0;
      const estimatedJSSize = transferSize * 0.6; // Rough estimate
      
      if (estimatedJSSize > PERFORMANCE_TARGETS.bundleSize * 1024) {
        this.logViolation('Bundle Size', estimatedJSSize / 1024, PERFORMANCE_TARGETS.bundleSize);
      }
    }
  }

  // Log performance violations
  static logViolation(metric: string, actual: number, target: number) {
    const violation = `${metric} violation: ${actual.toFixed(2)} > ${target} (${((actual - target) / target * 100).toFixed(1)}% over budget)`;
    this.violations.push(violation);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Performance Budget Violation:', violation);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_violation', {
        custom_parameter_1: metric,
        value: Math.round(actual),
        target: target
      });
    }
  }

  // Get all violations
  static getViolations(): string[] {
    return [...this.violations];
  }

  // Clear violations
  static clearViolations() {
    this.violations = [];
  }

  // Initialize monitoring
  static init() {
    if (typeof window === 'undefined') return;

    this.monitorWebVitals();
    
    // Check bundle size after load
    window.addEventListener('load', () => {
      setTimeout(() => this.checkBundleSize(), 1000);
    });
  }
}

// Performance optimization helpers
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

export const defer = (fn: () => void, delay = 0) => {
  if (typeof window !== 'undefined') {
    if (delay === 0) {
      requestIdleCallback ? requestIdleCallback(fn) : setTimeout(fn, 0);
    } else {
      setTimeout(fn, delay);
    }
  }
};

// Auto-initialize
PerformanceBudgetMonitor.init();