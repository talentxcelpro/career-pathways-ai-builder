import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';

interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint
  inp: number | null; // Interaction to Next Paint
}

export const WebVitalsTracker: React.FC = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null
  });

  useEffect(() => {
    // Function to track Core Web Vitals
    const trackWebVitals = () => {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ 
              ...prev, 
              fid: Math.round(entry.processingStart - entry.startTime) 
            }));
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });
          setMetrics(prev => ({ ...prev, cls: Math.round(clsScore * 1000) / 1000 }));
        }).observe({ entryTypes: ['layout-shift'] });

        // Navigation timing for TTFB and FCP
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          setMetrics(prev => ({ ...prev, ttfb }));
        }

        // FCP - First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries[0];
          setMetrics(prev => ({ ...prev, fcp: Math.round(fcp.startTime) }));
        }).observe({ entryTypes: ['paint'] });

        // INP - Interaction to Next Paint (newer metric)
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.interactionId) {
                setMetrics(prev => ({ 
                  ...prev, 
                  inp: Math.round(entry.processingEnd - entry.startTime) 
                }));
              }
            });
          }).observe({ entryTypes: ['event'] });
        } catch (e) {
          // INP might not be supported in all browsers yet
        }
      }
    };

    trackWebVitals();

    // Send metrics to analytics (optional)
    const sendToAnalytics = () => {
      if (window.gtag && Object.values(metrics).some(v => v !== null)) {
        window.gtag('event', 'web_vitals', {
          custom_map: {
            metric_lcp: metrics.lcp,
            metric_fid: metrics.fid,
            metric_cls: metrics.cls,
            metric_ttfb: metrics.ttfb,
            metric_fcp: metrics.fcp,
            metric_inp: metrics.inp
          }
        });
      }
    };

    const timer = setTimeout(sendToAnalytics, 5000);
    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (metric: string, value: number | null): "default" | "secondary" | "destructive" | "outline" => {
    if (value === null) return "outline";
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? "default" : value <= 4000 ? "secondary" : "destructive";
      case 'fid':
      case 'inp':
        return value <= 100 ? "default" : value <= 300 ? "secondary" : "destructive";
      case 'cls':
        return value <= 0.1 ? "default" : value <= 0.25 ? "secondary" : "destructive";
      case 'ttfb':
        return value <= 800 ? "default" : value <= 1800 ? "secondary" : "destructive";
      case 'fcp':
        return value <= 1800 ? "default" : value <= 3000 ? "secondary" : "destructive";
      default:
        return "outline";
    }
  };

  const formatValue = (metric: string, value: number | null): string => {
    if (value === null) return "—";
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'lcp':
      case 'fid':
      case 'inp':
      case 'ttfb':
      case 'fcp':
        return `${value}ms`;
      default:
        return value.toString();
    }
  };

  const vitalsData = [
    { 
      key: 'lcp', 
      name: 'LCP', 
      description: 'Largest Contentful Paint',
      icon: <Clock className="h-4 w-4" />,
      value: metrics.lcp,
      target: "< 2.5s"
    },
    { 
      key: 'fid', 
      name: 'FID', 
      description: 'First Input Delay',
      icon: <Zap className="h-4 w-4" />,
      value: metrics.fid,
      target: "< 100ms"
    },
    { 
      key: 'cls', 
      name: 'CLS', 
      description: 'Cumulative Layout Shift',
      icon: <Activity className="h-4 w-4" />,
      value: metrics.cls,
      target: "< 0.1"
    },
    { 
      key: 'ttfb', 
      name: 'TTFB', 
      description: 'Time to First Byte',
      icon: <TrendingUp className="h-4 w-4" />,
      value: metrics.ttfb,
      target: "< 800ms"
    },
    { 
      key: 'fcp', 
      name: 'FCP', 
      description: 'First Contentful Paint',
      icon: <Clock className="h-4 w-4" />,
      value: metrics.fcp,
      target: "< 1.8s"
    },
    { 
      key: 'inp', 
      name: 'INP', 
      description: 'Interaction to Next Paint',
      icon: <Zap className="h-4 w-4" />,
      value: metrics.inp,
      target: "< 200ms"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Core Web Vitals Monitor
        </CardTitle>
        <CardDescription>
          Real-time performance metrics for SEO optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {vitalsData.map((vital) => (
            <div key={vital.key} className="space-y-2">
              <div className="flex items-center gap-2">
                {vital.icon}
                <span className="font-medium text-sm">{vital.name}</span>
              </div>
              <Badge variant={getScoreColor(vital.key, vital.value)}>
                {formatValue(vital.key, vital.value)}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Target: {vital.target}
              </p>
              <p className="text-xs text-muted-foreground">
                {vital.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>SEO Impact:</strong> Good Core Web Vitals improve search rankings and user experience.
            Green badges indicate excellent performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for programmatic access to Web Vitals
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null
  });

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // Similar implementation as above but just for the hook
      const observers: PerformanceObserver[] = [];

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(lcpObserver);

      return () => {
        observers.forEach(observer => observer.disconnect());
      };
    }
  }, []);

  return vitals;
};