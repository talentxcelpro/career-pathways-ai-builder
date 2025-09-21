import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useMemoryOptimization } from '@/hooks/useMemoryOptimization';

export const PerformanceStatusPanel: React.FC = () => {
  const { vitals, getMemoryUsage } = usePerformanceMonitor('PerformanceStatusPanel');
  const { getMemoryStats } = useMemoryOptimization();

  const memoryUsage = getMemoryUsage();
  const memoryStats = getMemoryStats();

  const getPerformanceGrade = (metric: number | undefined, thresholds: { good: number; needs: number }) => {
    if (!metric) return { grade: 'Unknown', color: 'secondary' };
    if (metric <= thresholds.good) return { grade: 'Good', color: 'success' };
    if (metric <= thresholds.needs) return { grade: 'Needs Improvement', color: 'warning' };
    return { grade: 'Poor', color: 'destructive' };
  };

  const performanceMetrics = [
    {
      name: 'First Contentful Paint',
      value: vitals.fcp,
      unit: 'ms',
      grade: getPerformanceGrade(vitals.fcp, { good: 1800, needs: 3000 }),
      description: 'Time until first text/image paint'
    },
    {
      name: 'Largest Contentful Paint',
      value: vitals.lcp,
      unit: 'ms',
      grade: getPerformanceGrade(vitals.lcp, { good: 2500, needs: 4000 }),
      description: 'Time until largest element paint'
    },
    {
      name: 'Cumulative Layout Shift',
      value: vitals.cls,
      unit: '',
      grade: getPerformanceGrade(vitals.cls, { good: 0.1, needs: 0.25 }),
      description: 'Visual stability measure'
    },
    {
      name: 'First Input Delay',
      value: vitals.fid,
      unit: 'ms',
      grade: getPerformanceGrade(vitals.fid, { good: 100, needs: 300 }),
      description: 'Time until page becomes interactive'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{metric.name}</p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {metric.value ? `${Math.round(metric.value)}${metric.unit}` : 'N/A'}
                  </p>
                  <Badge variant={metric.grade.color as any} size="sm">
                    {metric.grade.grade}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {memoryStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used Memory</span>
                <span>{Math.round(memoryStats.usedJSHeapSize / 1024 / 1024)} MB</span>
              </div>
              <Progress 
                value={(memoryStats.usedJSHeapSize / memoryStats.jsHeapSizeLimit) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 MB</span>
                <span>{Math.round(memoryStats.jsHeapSizeLimit / 1024 / 1024)} MB limit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};