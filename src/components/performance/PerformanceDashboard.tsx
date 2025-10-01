import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { advancedPerformanceMonitor } from '@/utils/advancedPerformanceMonitor';
import { multiLevelCache } from '@/utils/multiLevelCache';
import { Activity, Zap, Database, TrendingUp } from 'lucide-react';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [cacheStats, setCacheStats] = useState<any>({});

  useEffect(() => {
    const updateStats = () => {
      setMetrics(advancedPerformanceMonitor.getMetrics());
      setCacheStats(multiLevelCache.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricBadge = (rating: string) => {
    const variants = {
      good: 'default',
      'needs-improvement': 'secondary',
      poor: 'destructive',
    } as const;
    return variants[rating as keyof typeof variants] || 'default';
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'CLS') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 space-y-2">
      <Card className="p-4 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Performance Monitor</h3>
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </div>
          {['LCP', 'FID', 'CLS'].map((metric) => {
            const summary = advancedPerformanceMonitor.getMetricSummary(metric);
            if (!summary) return null;

            return (
              <div key={metric} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric}</span>
                <div className="flex items-center gap-2">
                  <span>{formatValue(summary.latest, metric)}</span>
                  <Badge variant={getMetricBadge(metrics[metric]?.[0]?.rating || 'good')}>
                    {summary.latest <= (metric === 'LCP' ? 1500 : metric === 'FID' ? 100 : 0.1)
                      ? '✓'
                      : '✗'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cache Stats */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache Performance
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Memory Entries</span>
            <span>{cacheStats.memorySize || 0}</span>
          </div>
        </div>

        {/* Performance Score */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm font-medium flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            Overall Score
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: '85%' }}
              />
            </div>
            <span className="text-sm font-semibold">85/100</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
