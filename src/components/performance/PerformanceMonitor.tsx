import React, { useEffect, memo } from 'react';
import { usePerformanceMonitoring, useLongTaskMonitoring, usePaintMetrics } from '@/hooks/usePerformanceMonitoring';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Eye, Zap } from 'lucide-react';

interface PerformanceMonitorProps {
  componentName?: string;
  showMonitor?: boolean;
  enableLongTaskMonitoring?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({
  componentName = 'App',
  showMonitor = process.env.NODE_ENV === 'development',
  enableLongTaskMonitoring = true
}) => {
  const { getMetrics } = usePerformanceMonitoring({
    componentName,
    enableLogging: showMonitor
  });

  const paintMetrics = usePaintMetrics();
  
  useLongTaskMonitoring(enableLongTaskMonitoring ? (duration) => {
    console.warn(`Long task detected: ${duration}ms`);
  } : undefined);

  if (!showMonitor) return null;

  const metrics = getMetrics();

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-black/80 backdrop-blur-sm text-white border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Renders</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.renderCount}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="text-xs">Avg Time</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.averageRenderTime.toFixed(1)}ms
            </Badge>
          </div>
        </div>
        
        {paintMetrics.fcp && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className="text-xs">FCP</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {paintMetrics.fcp.toFixed(0)}ms
            </Badge>
          </div>
        )}
        
        {paintMetrics.lcp && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className="text-xs">LCP</span>
            </div>
            <Badge 
              variant={paintMetrics.lcp > 4000 ? "destructive" : paintMetrics.lcp > 2500 ? "secondary" : "outline"}
              className="text-xs"
            >
              {paintMetrics.lcp.toFixed(0)}ms
            </Badge>
          </div>
        )}
        
        {metrics.memoryUsage && (
          <div className="space-y-1">
            <span className="text-xs">Memory</span>
            <Badge variant="outline" className="text-xs">
              {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';