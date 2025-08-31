// Phase 4: Enhanced Performance Monitoring Hook
import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  
  // Additional metrics
  ttfb: number | null;
  fcp: number | null;
  inp: number | null;
  
  // Custom metrics
  renderTime: number | null;
  componentMountTime: number | null;
  memoryUsage: number | null;
  
  // Network
  connectionType: string | null;
  bandwidth: number | null;
}

interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
};

export function usePerformanceMonitor(componentName?: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null,
    renderTime: null,
    componentMountTime: null,
    memoryUsage: null,
    connectionType: null,
    bandwidth: null,
  });

  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Measure component mount time
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    setMetrics(prev => ({ ...prev, componentMountTime: mountTime }));
  }, []);

  // Measure render time
  const measureRenderTime = useCallback(() => {
    const renderTime = Date.now() - renderStartRef.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  // Core Web Vitals measurement
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }
    });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, fid }));
        }
      });
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      });
    });

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    // INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingEnd && entry.startTime) {
          const inp = entry.processingEnd - entry.startTime;
          setMetrics(prev => ({ ...prev, inp }));
        }
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      inpObserver.observe({ entryTypes: ['event'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  // Memory usage monitoring
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    measureMemory();
    const interval = setInterval(measureMemory, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Network information
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({
        ...prev,
        connectionType: connection.effectiveType || null,
        bandwidth: connection.downlink || null,
      }));

      const handleConnectionChange = () => {
        setMetrics(prev => ({
          ...prev,
          connectionType: connection.effectiveType || null,
          bandwidth: connection.downlink || null,
        }));
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, []);

  // TTFB measurement
  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.fetchStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }
  }, []);

  // Performance scoring
  const getPerformanceScore = useCallback((thresholds = DEFAULT_THRESHOLDS) => {
    const scores: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};
    
    if (metrics.lcp !== null) {
      scores.lcp = metrics.lcp <= thresholds.lcp.good ? 'good' : 
                   metrics.lcp <= thresholds.lcp.poor ? 'needs-improvement' : 'poor';
    }
    
    if (metrics.fid !== null) {
      scores.fid = metrics.fid <= thresholds.fid.good ? 'good' : 
                   metrics.fid <= thresholds.fid.poor ? 'needs-improvement' : 'poor';
    }
    
    if (metrics.cls !== null) {
      scores.cls = metrics.cls <= thresholds.cls.good ? 'good' : 
                   metrics.cls <= thresholds.cls.poor ? 'needs-improvement' : 'poor';
    }
    
    if (metrics.ttfb !== null) {
      scores.ttfb = metrics.ttfb <= thresholds.ttfb.good ? 'good' : 
                    metrics.ttfb <= thresholds.ttfb.poor ? 'needs-improvement' : 'poor';
    }

    return scores;
  }, [metrics]);

  // Report metrics to analytics
  const reportMetrics = useCallback((additionalData?: Record<string, any>) => {
    const reportData = {
      ...metrics,
      componentName,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      ...additionalData,
    };

    // Report to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        custom_map: reportData,
      });
    }

    // Report to Supabase (if needed)
    if (componentName) {
      console.log(`Performance metrics for ${componentName}:`, reportData);
    }

    return reportData;
  }, [metrics, componentName]);

  // Performance warnings
  const getPerformanceWarnings = useCallback(() => {
    const warnings: string[] = [];
    const scores = getPerformanceScore();

    if (scores.lcp === 'poor') warnings.push('Largest Contentful Paint is slow');
    if (scores.fid === 'poor') warnings.push('First Input Delay is high');
    if (scores.cls === 'poor') warnings.push('Cumulative Layout Shift is high');
    if (scores.ttfb === 'poor') warnings.push('Time to First Byte is slow');
    
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      warnings.push('High memory usage detected');
    }
    
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      warnings.push('Slow network connection detected');
    }

    return warnings;
  }, [metrics, getPerformanceScore]);

  return {
    metrics,
    measureRenderTime,
    getPerformanceScore,
    reportMetrics,
    getPerformanceWarnings,
    isPerformanceGood: getPerformanceScore().lcp === 'good' && 
                       getPerformanceScore().fid === 'good' && 
                       getPerformanceScore().cls === 'good',
  };
}

// HOC for automatic performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceMonitoredComponent(props: T) {
    const { reportMetrics, getPerformanceWarnings } = usePerformanceMonitor(componentName);

    useEffect(() => {
      // Report metrics after component is stable
      const timer = setTimeout(() => {
        const warnings = getPerformanceWarnings();
        reportMetrics({ warnings });
      }, 2000);

      return () => clearTimeout(timer);
    }, [reportMetrics, getPerformanceWarnings]);

    return React.createElement(Component, props);
  };
}