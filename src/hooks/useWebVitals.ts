import { useState, useEffect } from 'react';

interface WebVitals {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
  metrics?: any;
  insights?: any;
}

export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitals>({});

  useEffect(() => {
    const updateVital = (name: string, value: number) => {
      // Defer state updates to avoid blocking
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        setVitals(prev => ({ ...prev, [name]: value }));
      });
    };

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            updateVital('fcp', entry.startTime);
          }
        });
      });
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        updateVital('lcp', lastEntry.startTime);
      });
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        updateVital('cls', clsValue);
      });
    });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        list.getEntries().forEach((entry: any) => {
          updateVital('fid', entry.processingStart - entry.startTime);
        });
      });
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'], buffered: true });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
      clsObserver.observe({ entryTypes: ['layout-shift'], buffered: true });
      fidObserver.observe({ entryTypes: ['first-input'], buffered: true });
    } catch (e) {
      console.debug('Web vitals observers not supported:', e);
    }

    // Time to First Byte - defer this too
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    idleCallback(() => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        updateVital('ttfb', ttfb);
      }
    });

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  return vitals;
};