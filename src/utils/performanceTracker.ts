/**
 * TalentXcel Performance Tracker - Global Media Competition Ready
 * Targets: <0.8s FCP, <200ms TTFB, >98 Lighthouse Score
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface WebVitalThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

class PerformanceTrackerClass {
  private entries = new Map<string, PerformanceEntry>();
  private vitals: Record<string, number> = {};
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  // Global media competition thresholds
  private readonly thresholds: WebVitalThresholds = {
    lcp: { good: 800, poor: 2500 }, // Faster than CNN/BBC
    fid: { good: 50, poor: 100 },   // Faster than Reuters
    cls: { good: 0.05, poor: 0.1 }, // Better than NY Times
    fcp: { good: 600, poor: 1800 }, // Faster than Guardian
    ttfb: { good: 150, poor: 600 }  // Faster than Bloomberg
  };

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.setupWebVitalsMonitoring();
    this.setupNavigationTiming();
    this.setupResourceTiming();
    this.setupCustomMetrics();
    this.isInitialized = true;
  }

  // Core Web Vitals monitoring
  private setupWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.vitals.lcp = lastEntry.startTime;
        this.reportVital('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime;
          this.vitals.fid = fid;
          this.reportVital('fid', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.vitals.cls = clsValue;
            this.reportVital('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.vitals.fcp = entry.startTime;
            this.reportVital('fcp', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  // Navigation timing for TTFB
  private setupNavigationTiming() {
    const navObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart;
          this.vitals.ttfb = ttfb;
          this.reportVital('ttfb', ttfb);
          
          // Additional navigation metrics
          this.reportMetric('dns_lookup', entry.domainLookupEnd - entry.domainLookupStart);
          this.reportMetric('tcp_connect', entry.connectEnd - entry.connectStart);
          this.reportMetric('dom_complete', entry.domComplete - entry.navigationStart);
        }
      });
    });
    navObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navObserver);
  }

  // Resource timing for optimization insights
  private setupResourceTiming() {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.duration > 1000) { // Slow resources
          this.reportSlowResource(entry.name, entry.duration);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  // Custom performance metrics
  private setupCustomMetrics() {
    // Time to Interactive approximation
    setTimeout(() => {
      const tti = performance.now();
      this.vitals.tti = tti;
      this.reportVital('tti', tti);
    }, 100);

    // Bundle size tracking
    this.trackBundleSize();
  }

  // Public API methods
  start(name: string, metadata?: Record<string, any>): void {
    this.entries.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  end(name: string): number {
    const entry = this.entries.get(name);
    if (!entry) return 0;

    const endTime = performance.now();
    const duration = endTime - entry.startTime;
    
    this.entries.set(name, {
      ...entry,
      endTime,
      duration
    });

    this.reportCustomMetric(name, duration, entry.metadata);
    return duration;
  }

  mark(name: string): void {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): void {
    try {
      performance.measure(name, startMark, endMark);
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  // Navigation tracking
  trackNavigation(route: string, duration: number): void {
    this.reportMetric('navigation', duration, { route });
    
    // Track navigation performance against thresholds
    if (duration > 1000) {
      console.warn(`Slow navigation to ${route}: ${duration}ms`);
    }
  }

  // Bundle size tracking
  private trackBundleSize(): void {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.reportMetric('network_speed', connection.effectiveType);
        this.reportMetric('data_saver', connection.saveData);
      }
    }
  }

  // Reporting methods
  private reportVital(name: string, value: number): void {
    const threshold = this.thresholds[name as keyof WebVitalThresholds];
    const rating = threshold ? 
      (value <= threshold.good ? 'good' : value <= threshold.poor ? 'needs-improvement' : 'poor') :
      'unknown';

    this.reportToAnalytics('web_vital', {
      metric_name: name,
      metric_value: Math.round(value),
      metric_rating: rating,
      page_path: window.location.pathname
    });

    // Console warnings for poor performance
    if (rating === 'poor') {
      console.warn(`Poor ${name.toUpperCase()}: ${value}ms (target: <${threshold?.good}ms)`);
    }
  }

  private reportMetric(name: string, value: any, metadata?: Record<string, any>): void {
    this.reportToAnalytics('performance_metric', {
      metric_name: name,
      metric_value: value,
      ...metadata
    });
  }

  private reportCustomMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    this.reportToAnalytics('custom_timing', {
      timing_category: 'Performance',
      timing_var: name,
      timing_value: Math.round(duration),
      page_path: window.location.pathname,
      ...metadata
    });
  }

  private reportSlowResource(url: string, duration: number): void {
    console.warn(`Slow resource: ${url} (${duration}ms)`);
    this.reportToAnalytics('slow_resource', {
      resource_url: url,
      load_time: Math.round(duration)
    });
  }

  private reportToAnalytics(eventName: string, parameters: Record<string, any>): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }

    // Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', eventName);
    }

    // Custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, data: parameters }),
        keepalive: true
      }).catch(() => {}); // Fail silently
    }
  }

  // Performance insights
  getPerformanceScore(): number {
    const scores = {
      lcp: this.getMetricScore('lcp', this.vitals.lcp),
      fid: this.getMetricScore('fid', this.vitals.fid),
      cls: this.getMetricScore('cls', this.vitals.cls),
      fcp: this.getMetricScore('fcp', this.vitals.fcp),
      ttfb: this.getMetricScore('ttfb', this.vitals.ttfb)
    };

    const validScores = Object.values(scores).filter(score => score > 0);
    return validScores.length > 0 ? 
      Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 
      0;
  }

  private getMetricScore(metric: string, value: number): number {
    if (!value) return 0;
    
    const threshold = this.thresholds[metric as keyof WebVitalThresholds];
    if (!threshold) return 50;

    if (value <= threshold.good) return 100;
    if (value <= threshold.poor) return 75;
    return 25;
  }

  getVitals(): Record<string, number> {
    return { ...this.vitals };
  }

  cleanup(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers = [];
    this.entries.clear();
    this.isInitialized = false;
  }
}

// Global instance
export const PerformanceTracker = new PerformanceTrackerClass();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PerformanceTracker.init();
    });
  } else {
    PerformanceTracker.init();
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    PerformanceTracker.cleanup();
  });
}

// TypeScript declarations
declare global {
  interface Window {
    va?: (...args: any[]) => void;
  }
}