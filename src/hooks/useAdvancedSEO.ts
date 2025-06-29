
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AdvancedSEOConfig {
  enableLazyLoading?: boolean;
  enablePreloading?: boolean;
  enableWebVitalsTracking?: boolean;
  enableStructuredData?: boolean;
  preloadResources?: string[];
}

export const useAdvancedSEO = (config: AdvancedSEOConfig = {}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [webVitals, setWebVitals] = useState({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  useEffect(() => {
    // Preload critical resources
    if (config.enablePreloading && config.preloadResources) {
      config.preloadResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 
                  resource.endsWith('.js') ? 'script' : 
                  resource.match(/\.(jpg|jpeg|png|webp|avif)$/) ? 'image' : 'fetch';
        if (link.as === 'fetch') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    }

    // Enable lazy loading with Intersection Observer
    if (config.enableLazyLoading) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      );

      const targetElement = document.getElementById('main-content');
      if (targetElement) {
        observer.observe(targetElement);
      }

      return () => observer.disconnect();
    }

    // Track Core Web Vitals
    if (config.enableWebVitalsTracking && 'PerformanceObserver' in window) {
      // LCP Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setWebVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS Observer
      let clsScore = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        setWebVitals(prev => ({ ...prev, cls: clsScore }));
      }).observe({ entryTypes: ['layout-shift'] });
    }

  }, [location.pathname, config]);

  return {
    isVisible,
    webVitals,
    currentPath: location.pathname
  };
};
