import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  fcp: number | null;
  ttfb: number | null;
  tbt: number | null;
}

interface PerformanceScore {
  overall: number;
  lcp: number;
  cls: number;
  fid: number;
  recommendations: string[];
}

// 🔴 Performance monitoring for Core Web Vitals tracking
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    cls: null,
    fid: null,
    fcp: null,
    ttfb: null,
    tbt: null
  });

  const [score, setScore] = useState<PerformanceScore>({
    overall: 0,
    lcp: 0,
    cls: 0,
    fid: 0,
    recommendations: []
  });

  useEffect(() => {
    // Track LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    // Track CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    // Track FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
      }
    });

    // Track FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });

    // Track TTFB (Time to First Byte)
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        setMetrics(prev => ({ 
          ...prev, 
          ttfb: navEntry.responseStart - navEntry.requestStart 
        }));
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      navObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.warn('Performance observers not supported');
    }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
      fcpObserver.disconnect();
      navObserver.disconnect();
    };
  }, []);

  // Calculate performance scores
  useEffect(() => {
    const calculateScore = () => {
      const lcpScore = metrics.lcp ? Math.max(0, 100 - (metrics.lcp - 2500) / 25) : 0;
      const clsScore = metrics.cls ? Math.max(0, 100 - metrics.cls * 1000) : 0;
      const fidScore = metrics.fid ? Math.max(0, 100 - (metrics.fid - 100) / 2) : 0;
      
      const overall = Math.round((lcpScore + clsScore + fidScore) / 3);
      
      const recommendations: string[] = [];
      
      if (metrics.lcp && metrics.lcp > 2500) {
        recommendations.push('🔴 LCP > 2.5s: Optimize images, preload critical resources');
      }
      
      if (metrics.cls && metrics.cls > 0.1) {
        recommendations.push('🔴 CLS > 0.1: Set image dimensions, avoid layout shifts');
      }
      
      if (metrics.fid && metrics.fid > 100) {
        recommendations.push('🔴 FID > 100ms: Reduce JavaScript execution time');
      }

      setScore({
        overall,
        lcp: Math.round(lcpScore),
        cls: Math.round(clsScore),
        fid: Math.round(fidScore),
        recommendations
      });
    };

    calculateScore();
  }, [metrics]);

  const getPerformanceGrade = (): 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score.overall >= 90) return 'A';
    if (score.overall >= 80) return 'B';
    if (score.overall >= 70) return 'C';
    if (score.overall >= 60) return 'D';
    return 'F';
  };

  const getBundleInfo = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  };

  return {
    metrics,
    score,
    grade: getPerformanceGrade(),
    bundleInfo: getBundleInfo(),
    isOptimal: score.overall >= 90
  };
};