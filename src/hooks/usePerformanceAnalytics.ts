import { useEffect, useCallback } from 'react';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export const usePerformanceAnalytics = () => {
  // Track Core Web Vitals
  const trackWebVital = useCallback((name: string, value: number, id?: string) => {
    const event: AnalyticsEvent = {
      name: `web_vital_${name.toLowerCase()}`,
      properties: {
        value: Math.round(value),
        metric: name,
        id,
        url: window.location.pathname,
        timestamp: Date.now()
      }
    };

    // Send to analytics service
    sendAnalyticsEvent(event);
    
    // Log performance budget violations
    const budgets = {
      FCP: 1800,
      LCP: 2500,
      FID: 100,
      CLS: 0.1
    };

    const budget = budgets[name as keyof typeof budgets];
    if (budget && value > budget) {
      console.warn(`Performance budget exceeded for ${name}:`, {
        actual: Math.round(value),
        budget,
        violation: Math.round(((value - budget) / budget) * 100)
      });
      
      // Track budget violations
      sendAnalyticsEvent({
        name: 'performance_budget_violation',
        properties: {
          metric: name,
          actual: Math.round(value),
          budget,
          violationPercentage: Math.round(((value - budget) / budget) * 100)
        }
      });
    }
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback((interaction: string, target?: string) => {
    const event: AnalyticsEvent = {
      name: 'user_interaction',
      properties: {
        interaction,
        target,
        timestamp: Date.now(),
        url: window.location.pathname
      }
    };

    sendAnalyticsEvent(event);
  }, []);

  // Track route changes and navigation timing
  const trackRouteChange = useCallback((from: string, to: string) => {
    const navigationStart = performance.timeOrigin + performance.now();
    
    requestAnimationFrame(() => {
      const navigationEnd = performance.timeOrigin + performance.now();
      const navigationTime = navigationEnd - navigationStart;

      const event: AnalyticsEvent = {
        name: 'route_change',
        properties: {
          from,
          to,
          navigationTime: Math.round(navigationTime),
          timestamp: Date.now()
        }
      };

      sendAnalyticsEvent(event);
    });
  }, []);

  // Track JavaScript errors
  const trackError = useCallback((error: Error, context?: string) => {
    const event: AnalyticsEvent = {
      name: 'javascript_error',
      properties: {
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    };

    sendAnalyticsEvent(event);
  }, []);

  // Track resource loading performance
  const trackResourcePerformance = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach(resource => {
      if (resource.duration > 1000) { // Track slow resources (>1s)
        const event: AnalyticsEvent = {
          name: 'slow_resource',
          properties: {
            name: resource.name,
            duration: Math.round(resource.duration),
            size: resource.transferSize,
            type: resource.initiatorType,
            timestamp: Date.now()
          }
        };

        sendAnalyticsEvent(event);
      }
    });
  }, []);

  // Send analytics event to service
  const sendAnalyticsEvent = useCallback((event: AnalyticsEvent) => {
    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
      return;
    }

    // In production, send to analytics service
    try {
      // Replace with your analytics service
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        keepalive: true // Ensure event is sent even if page unloads
      }).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    // Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              trackWebVital('FCP', entry.startTime);
            }
            break;
          case 'largest-contentful-paint':
            trackWebVital('LCP', entry.startTime);
            break;
          case 'layout-shift':
            // Track cumulative layout shift
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              trackWebVital('CLS', clsEntry.value);
            }
            break;
          case 'first-input':
            const fidEntry = entry as any;
            trackWebVital('FID', fidEntry.processingStart - fidEntry.startTime);
            break;
        }
      });
    });

    try {
      observer.observe({ 
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] 
      });
    } catch (e) {
      console.debug('Performance observer not supported');
    }

    // Error tracking
    const errorHandler = (event: ErrorEvent) => {
      trackError(new Error(event.message), 'global_error_handler');
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason), 'unhandled_promise_rejection');
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Resource performance tracking
    setTimeout(trackResourcePerformance, 5000);

    return () => {
      observer.disconnect();
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, [trackWebVital, trackError, trackResourcePerformance]);

  return {
    trackWebVital,
    trackUserInteraction,
    trackRouteChange,
    trackError,
    trackResourcePerformance
  };
};