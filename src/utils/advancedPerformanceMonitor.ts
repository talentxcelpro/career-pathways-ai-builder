/**
 * Advanced Performance Monitor - LinkedIn/Facebook Level
 * Tracks Core Web Vitals, user interactions, and real-time metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceBudget {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

class AdvancedPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private budget: PerformanceBudget = {
    LCP: 1500,
    FID: 100,
    CLS: 0.1,
    TTFB: 600,
  };

  constructor() {
    if (typeof window === 'undefined') return;
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
      const value = lcpEntry.renderTime || lcpEntry.loadTime;
      this.recordMetric('LCP', value, this.getRating('LCP', value));
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const fidEntry = entries[0] as PerformanceEventTiming;
      const value = fidEntry.processingStart - fidEntry.startTime;
      this.recordMetric('FID', value, this.getRating('FID', value));
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue, this.getRating('CLS', clsValue));
    });

    // Long Tasks
    this.observeMetric('longtask', (entries) => {
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
          this.recordMetric('LongTask', entry.duration, 'poor');
        }
      });
    });

    // Navigation Timing
    this.measureNavigationTiming();
  }

  private observeMetric(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (e) {
      console.warn(`Performance observer not supported: ${type}`);
    }
  }

  private measureNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordMetric('TTFB', ttfb, this.getRating('TTFB', ttfb));

      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      this.recordMetric('DOMContentLoaded', domContentLoaded, 'good');

      const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
      this.recordMetric('LoadComplete', loadComplete, 'good');
    });
  }

  private getRating(metric: keyof PerformanceBudget, value: number): 'good' | 'needs-improvement' | 'poor' {
    const budget = this.budget[metric];
    if (value <= budget) return 'good';
    if (value <= budget * 1.5) return 'needs-improvement';
    return 'poor';
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Log to console in dev mode
    if (import.meta.env.DEV) {
      const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
    }

    // Send to analytics in production
    if (!import.meta.env.DEV && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        metric_rating: rating,
      });
    }
  }

  // Track route changes
  trackRouteChange(route: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.recordMetric(`Route_${route}`, duration, duration < 500 ? 'good' : 'needs-improvement');
  }

  // Track user interactions
  trackInteraction(action: string, duration?: number) {
    if (duration) {
      this.recordMetric(`Interaction_${action}`, duration, duration < 100 ? 'good' : 'poor');
    }
  }

  // Get all metrics
  getMetrics() {
    const result: Record<string, PerformanceMetric[]> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Get metric summary
  getMetricSummary(metricName: string) {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
      count: values.length,
    };
  }

  // Check if all budgets are met
  checkBudgets() {
    const results: Record<string, boolean> = {};
    Object.keys(this.budget).forEach(metric => {
      const summary = this.getMetricSummary(metric);
      results[metric] = summary ? summary.latest <= this.budget[metric as keyof PerformanceBudget] : true;
    });
    return results;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const advancedPerformanceMonitor = new AdvancedPerformanceMonitor();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => advancedPerformanceMonitor.cleanup());
}
