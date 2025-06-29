
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Zap, Eye } from 'lucide-react';

interface WebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export const CoreWebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });

  useEffect(() => {
    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsScore = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsScore }));
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === window.location.origin) {
            setMetrics(prev => ({ ...prev, ttfb: entry.responseStart - entry.requestStart }));
          }
        });
      }).observe({ entryTypes: ['navigation'] });
    };

    if ('PerformanceObserver' in window) {
      observeWebVitals();
    }
  }, []);

  const getScoreColor = (metric: string, value: number | null) => {
    if (value === null) return 'secondary';
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'default' : value <= 4000 ? 'secondary' : 'destructive';
      case 'fid':
        return value <= 100 ? 'default' : value <= 300 ? 'secondary' : 'destructive';
      case 'cls':
        return value <= 0.1 ? 'default' : value <= 0.25 ? 'secondary' : 'destructive';
      case 'ttfb':
        return value <= 800 ? 'default' : value <= 1800 ? 'secondary' : 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatValue = (metric: string, value: number | null) => {
    if (value === null) return 'Measuring...';
    
    switch (metric) {
      case 'lcp':
      case 'fid':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      case 'cls':
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Core Web Vitals
        </CardTitle>
        <CardDescription>
          Real-time performance metrics for SEO optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">LCP</span>
            </div>
            <Badge variant={getScoreColor('lcp', metrics.lcp)} className="w-full">
              {formatValue('lcp', metrics.lcp)}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">FID</span>
            </div>
            <Badge variant={getScoreColor('fid', metrics.fid)} className="w-full">
              {formatValue('fid', metrics.fid)}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">CLS</span>
            </div>
            <Badge variant={getScoreColor('cls', metrics.cls)} className="w-full">
              {formatValue('cls', metrics.cls)}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">TTFB</span>
            </div>
            <Badge variant={getScoreColor('ttfb', metrics.ttfb)} className="w-full">
              {formatValue('ttfb', metrics.ttfb)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
