import { useEffect, useState } from 'react';

export interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

export interface PerformanceInsights {
  score: 'good' | 'needs-improvement' | 'poor';
  metrics: WebVitalsMetrics;
  recommendations: string[];
}

export const useWebVitals = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
  });

  const [insights, setInsights] = useState<PerformanceInsights | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        setMetrics(prev => ({ 
          ...prev, 
          fid: entry.processingStart - entry.startTime 
        }));
      });
    });

    // Cumulative Layout Shift
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          setMetrics(prev => ({ ...prev, cls: clsScore }));
        }
      });
    });

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    // Time to First Byte
    const ttfbObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({ ...prev, ttfb: entry.responseStart }));
        }
      });
    });

    // Interaction to Next Paint (newer metric replacing FID)
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        setMetrics(prev => ({ 
          ...prev, 
          inp: entry.processingStart - entry.startTime 
        }));
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      ttfbObserver.observe({ entryTypes: ['navigation'] });
      
      // INP is newer, so wrap in try-catch
      try {
        inpObserver.observe({ entryTypes: ['event'] });
      } catch (e) {
        console.log('INP not supported in this browser');
      }
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      ttfbObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  // Generate insights based on metrics
  useEffect(() => {
    if (!metrics.lcp && !metrics.fid && !metrics.cls) return;

    const recommendations: string[] = [];
    let goodCount = 0;
    let poorCount = 0;

    // LCP scoring (< 2.5s good, 2.5-4s needs improvement, > 4s poor)
    if (metrics.lcp !== null) {
      if (metrics.lcp > 4000) {
        poorCount++;
        recommendations.push('Optimize Largest Contentful Paint: Consider image optimization, server response times, and resource loading');
      } else if (metrics.lcp > 2500) {
        recommendations.push('Improve LCP: Consider preloading critical resources');
      } else {
        goodCount++;
      }
    }

    // FID/INP scoring (< 100ms good, 100-300ms needs improvement, > 300ms poor)
    const interactionDelay = metrics.inp || metrics.fid;
    if (interactionDelay !== null) {
      if (interactionDelay > 300) {
        poorCount++;
        recommendations.push('Reduce input delay: Minimize JavaScript execution time and optimize event handlers');
      } else if (interactionDelay > 100) {
        recommendations.push('Improve interaction responsiveness: Consider code splitting and defer non-critical JavaScript');
      } else {
        goodCount++;
      }
    }

    // CLS scoring (< 0.1 good, 0.1-0.25 needs improvement, > 0.25 poor)
    if (metrics.cls !== null) {
      if (metrics.cls > 0.25) {
        poorCount++;
        recommendations.push('Fix layout shifts: Add dimensions to images and avoid inserting content above existing content');
      } else if (metrics.cls > 0.1) {
        recommendations.push('Reduce layout shifts: Ensure elements have proper sizing');
      } else {
        goodCount++;
      }
    }

    // TTFB scoring (< 800ms good, 800-1800ms needs improvement, > 1800ms poor)
    if (metrics.ttfb !== null) {
      if (metrics.ttfb > 1800) {
        poorCount++;
        recommendations.push('Improve server response time: Optimize backend performance and consider CDN');
      } else if (metrics.ttfb > 800) {
        recommendations.push('Optimize TTFB: Consider server-side optimizations');
      } else {
        goodCount++;
      }
    }

    const totalMetrics = [metrics.lcp, metrics.fid || metrics.inp, metrics.cls, metrics.ttfb].filter(m => m !== null).length;
    const score = poorCount > 0 ? 'poor' : 
                  (goodCount / totalMetrics) >= 0.75 ? 'good' : 'needs-improvement';

    setInsights({
      score,
      metrics,
      recommendations
    });
  }, [metrics]);

  // Send metrics to analytics
  const sendToAnalytics = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== null) {
          window.gtag('event', 'web_vitals', {
            metric_name: key,
            metric_value: Math.round(value),
            metric_rating: getMetricRating(key, value)
          });
        }
      });
    }
  };

  const getMetricRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
      case 'inp':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'ttfb':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  };

  return {
    metrics,
    insights,
    sendToAnalytics
  };
};