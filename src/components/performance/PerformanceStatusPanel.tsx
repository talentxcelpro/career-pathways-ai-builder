import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTurbo } from '@/hooks/useTurbo';

export const PerformanceStatusPanel: React.FC = () => {
  const { getMetrics } = useTurbo('PerformanceStatusPanel');
  const metrics = getMetrics();

  const getPerformanceGrade = (metric: number | undefined, thresholds: { good: number; needs: number }) => {
    if (!metric) return { grade: 'Unknown', color: 'secondary' };
    if (metric <= thresholds.good) return { grade: 'Good', color: 'success' };
    if (metric <= thresholds.needs) return { grade: 'Needs Improvement', color: 'warning' };
    return { grade: 'Poor', color: 'destructive' };
  };

  const performanceMetrics = [
    {
      name: 'Render Count',
      value: metrics.renderCount,
      unit: '',
      grade: getPerformanceGrade(metrics.renderCount, { good: 50, needs: 100 }),
      description: 'Number of component renders'
    },
    {
      name: 'Last Render Time',
      value: metrics.renderTime,
      unit: 'ms',
      grade: getPerformanceGrade(metrics.renderTime, { good: 16, needs: 50 }),
      description: 'Time of last render'
    },
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

      {false && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used Memory</span>
                <span>N/A</span>
              </div>
              <Progress 
                value={60} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 MB</span>
                <span>Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};