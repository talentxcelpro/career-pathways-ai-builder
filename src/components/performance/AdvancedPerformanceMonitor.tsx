import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Timer, 
  Gauge, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  inp: number | null;
  memory: number;
  fps: number;
  renderTime: number;
  bundleSize: number;
}

interface PerformanceThresholds {
  lcp: { good: number; needs: number };
  fid: { good: number; needs: number };
  cls: { good: number; needs: number };
  ttfb: { good: number; needs: number };
  fcp: { good: number; needs: number };
  inp: { good: number; needs: number };
}

const thresholds: PerformanceThresholds = {
  lcp: { good: 2500, needs: 4000 },
  fid: { good: 100, needs: 300 },
  cls: { good: 0.1, needs: 0.25 },
  ttfb: { good: 800, needs: 1800 },
  fcp: { good: 1800, needs: 3000 },
  inp: { good: 200, needs: 500 }
};

export const AdvancedPerformanceMonitor: React.FC = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    inp: null,
    memory: 0,
    fps: 0,
    renderTime: 0,
    bundleSize: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!isMonitoring) return;

    // Core Web Vitals observers
    const observers: PerformanceObserver[] = [];

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // CLS Observer
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      observers.push(fcpObserver);
    } catch (e) {
      console.warn('FCP observer not supported');
    }

    // Navigation timing for TTFB
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const navEntry = navEntries[0];
      setMetrics(prev => ({ 
        ...prev, 
        ttfb: navEntry.responseStart - navEntry.fetchStart 
      }));
    }

    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    requestAnimationFrame(measureFPS);

    // Memory monitoring
    if ('memory' in performance) {
      const updateMemory = () => {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: memInfo.usedJSHeapSize / 1024 / 1024
        }));
      };
      
      const memoryInterval = setInterval(updateMemory, 2000);
      
      return () => {
        observers.forEach(observer => observer.disconnect());
        clearInterval(memoryInterval);
      };
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [isMonitoring]);

  // Alert system
  useEffect(() => {
    const newAlerts: string[] = [];
    
    if (metrics.lcp && metrics.lcp > thresholds.lcp.needs) {
      newAlerts.push('LCP needs improvement');
    }
    if (metrics.fid && metrics.fid > thresholds.fid.needs) {
      newAlerts.push('FID needs improvement');
    }
    if (metrics.cls && metrics.cls > thresholds.cls.needs) {
      newAlerts.push('CLS needs improvement');
    }
    if (metrics.fps > 0 && metrics.fps < 30) {
      newAlerts.push('Low frame rate detected');
    }
    if (metrics.memory > 100) {
      newAlerts.push('High memory usage');
    }
    
    setAlerts(newAlerts);
  }, [metrics]);

  const getScoreVariant = (metric: keyof PerformanceThresholds, value: number | null): 'default' | 'secondary' | 'destructive' => {
    if (value === null) return 'secondary';
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'default';
    if (value <= threshold.needs) return 'secondary';
    return 'destructive';
  };

  const formatValue = (metric: string, value: number | null): string => {
    if (value === null) return '--';
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'memory':
        return `${value.toFixed(1)}MB`;
      case 'fps':
        return `${Math.round(value)}fps`;
      case 'ttfb':
      case 'lcp':
      case 'fid':
      case 'fcp':
      case 'inp':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const getOverallScore = (): number => {
    const scores = [];
    
    if (metrics.lcp) scores.push(metrics.lcp <= thresholds.lcp.good ? 100 : metrics.lcp <= thresholds.lcp.needs ? 50 : 0);
    if (metrics.fid) scores.push(metrics.fid <= thresholds.fid.good ? 100 : metrics.fid <= thresholds.fid.needs ? 50 : 0);
    if (metrics.cls) scores.push(metrics.cls <= thresholds.cls.good ? 100 : metrics.cls <= thresholds.cls.needs ? 50 : 0);
    if (metrics.fcp) scores.push(metrics.fcp <= thresholds.fcp.good ? 100 : metrics.fcp <= thresholds.fcp.needs ? 50 : 0);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isMonitoring ? 'default' : 'secondary'}
              className="animate-pulse"
            >
              {isMonitoring ? 'Live' : 'Paused'}
            </Badge>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Performance</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getOverallScore())}/100
            </span>
          </div>
          <Progress value={getOverallScore()} className="h-2" />
        </div>
        
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-3 space-y-1">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {alert}
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Core Web Vitals */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Core Web Vitals
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'lcp', label: 'LCP', icon: Timer },
              { key: 'fid', label: 'FID', icon: Zap },
              { key: 'cls', label: 'CLS', icon: Activity },
              { key: 'fcp', label: 'FCP', icon: CheckCircle },
              { key: 'ttfb', label: 'TTFB', icon: Activity }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <Badge variant={getScoreVariant(key as keyof PerformanceThresholds, metrics[key as keyof PerformanceMetrics] as number)}>
                  {formatValue(key, metrics[key as keyof PerformanceMetrics] as number)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        
        {/* Runtime Metrics */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Runtime Performance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <span className="text-sm font-medium">Memory</span>
              <Badge variant={metrics.memory > 50 ? 'destructive' : 'default'}>
                {formatValue('memory', metrics.memory)}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
              <span className="text-sm font-medium">FPS</span>
              <Badge variant={metrics.fps < 30 && metrics.fps > 0 ? 'destructive' : 'default'}>
                {formatValue('fps', metrics.fps)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AdvancedPerformanceMonitor.displayName = 'AdvancedPerformanceMonitor';