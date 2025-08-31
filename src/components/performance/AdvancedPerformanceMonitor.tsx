import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, Eye } from 'lucide-react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  inp: number | null;
  lighthouse: number | null;
}

interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  bundleSize: number;
}

export const AdvancedPerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null,
    lighthouse: null,
  });

  const [isVisible, setIsVisible] = useState(false);

  const budgets: PerformanceBudget = {
    lcp: 1600, // 1.6s
    fid: 100,  // 100ms
    cls: 0.05, // 0.05
    ttfb: 200, // 200ms
    bundleSize: 150, // 150KB
  };

  useEffect(() => {
    // Only show in development or for admins
    const isDev = import.meta.env.DEV;
    const isAdmin = localStorage.getItem('showPerformanceMonitor') === 'true';
    setIsVisible(isDev || isAdmin);

    if (!isVisible) return;

    const observePerformance = () => {
      if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

      // Observe Core Web Vitals
      try {
        // LCP - Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay (deprecated, using INP)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
              setMetrics(prev => ({ ...prev, cls: clsValue }));
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Navigation timing for TTFB and FCP
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'navigation') {
              const ttfb = entry.responseStart - entry.requestStart;
              setMetrics(prev => ({ ...prev, ttfb }));
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        // FCP - First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // INP - Interaction to Next Paint (newer metric)
        if ('PerformanceEventTiming' in window) {
          const inpObserver = new PerformanceObserver((list) => {
            let maxDuration = 0;
            for (const entry of list.getEntries()) {
              const eventEntry = entry as any;
              if (eventEntry.duration > maxDuration) {
                maxDuration = eventEntry.duration;
                setMetrics(prev => ({ ...prev, inp: maxDuration }));
              }
            }
          });
          inpObserver.observe({ entryTypes: ['event'] });
        }

      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    };

    observePerformance();
  }, [isVisible]);

  const getMetricStatus = (value: number | null, budget: number, type: 'lcp' | 'fid' | 'cls' | 'ttfb'): string => {
    if (value === null) return 'unknown';
    
    switch (type) {
      case 'lcp':
        return value <= budget ? 'good' : value <= budget * 1.5 ? 'needs-improvement' : 'poor';
      case 'fid':
      case 'ttfb':
        return value <= budget ? 'good' : value <= budget * 2 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= budget ? 'good' : value <= budget * 2 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Performance Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Hide
          </button>
        </div>

        <div className="space-y-3">
          {/* Core Web Vitals */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Core Web Vitals</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="text-xs">LCP</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`h-2 w-2 p-0 border-none ${getStatusColor(getMetricStatus(metrics.lcp, budgets.lcp, 'lcp'))}`}
                />
                <span className="text-xs font-mono">
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                <span className="text-xs">INP</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`h-2 w-2 p-0 border-none ${getStatusColor(getMetricStatus(metrics.inp, 200, 'fid'))}`}
                />
                <span className="text-xs font-mono">
                  {metrics.inp ? `${Math.round(metrics.inp)}ms` : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span className="text-xs">CLS</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`h-2 w-2 p-0 border-none ${getStatusColor(getMetricStatus(metrics.cls, budgets.cls, 'cls'))}`}
                />
                <span className="text-xs font-mono">
                  {metrics.cls ? metrics.cls.toFixed(3) : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">TTFB</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`h-2 w-2 p-0 border-none ${getStatusColor(getMetricStatus(metrics.ttfb, budgets.ttfb, 'ttfb'))}`}
                />
                <span className="text-xs font-mono">
                  {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estimated Score</span>
              <span className={`text-sm font-bold ${getScoreColor(metrics.lighthouse)}`}>
                {metrics.lighthouse ? `${metrics.lighthouse}/100` : 'Calculating...'}
              </span>
            </div>
            {metrics.lighthouse && (
              <Progress 
                value={metrics.lighthouse} 
                className="h-1 mt-1"
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1 pt-2 border-t">
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
            >
              Refresh
            </button>
            <button
              onClick={() => console.log('Performance Metrics:', metrics)}
              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
            >
              Log Data
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Enable performance monitoring for admins
export const enablePerformanceMonitor = () => {
  localStorage.setItem('showPerformanceMonitor', 'true');
  window.location.reload();
};

export const disablePerformanceMonitor = () => {
  localStorage.removeItem('showPerformanceMonitor');
  window.location.reload();
};