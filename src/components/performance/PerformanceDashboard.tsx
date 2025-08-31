// Phase 4: Performance Monitoring Dashboard
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { BundleAnalyzer } from '@/utils/bundleOptimizer';
import { PerformanceOptimizer } from '@/utils/performanceOptimizer';

interface PerformanceDashboardProps {
  isAdmin?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isAdmin = false 
}) => {
  const { 
    metrics, 
    getPerformanceScore, 
    getPerformanceWarnings,
    isPerformanceGood 
  } = usePerformanceMonitor('PerformanceDashboard');

  const [bundleMetrics, setBundleMetrics] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  useEffect(() => {
    // Get bundle metrics
    const bundle = BundleAnalyzer.measureBundleSize();
    setBundleMetrics(bundle);

    // Get performance report (admin only)
    if (isAdmin) {
      const optimizer = PerformanceOptimizer.getInstance();
      const report = optimizer.getPerformanceReport();
      setPerformanceReport(report);
    }
  }, [isAdmin]);

  const scores = getPerformanceScore();
  const warnings = getPerformanceWarnings();

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreLabel = (score: string) => {
    switch (score) {
      case 'good': return 'Good';
      case 'needs-improvement': return 'Needs Improvement';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Overview
            <Badge variant={isPerformanceGood ? "default" : "destructive"}>
              {isPerformanceGood ? 'Healthy' : 'Needs Attention'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Core Web Vitals */}
            <div className="space-y-2">
              <h4 className="font-medium">Largest Contentful Paint</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Measuring...'}
                </span>
                <Badge className={getScoreColor(scores.lcp || 'unknown')}>
                  {getScoreLabel(scores.lcp || 'unknown')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">First Input Delay</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Measuring...'}
                </span>
                <Badge className={getScoreColor(scores.fid || 'unknown')}>
                  {getScoreLabel(scores.fid || 'unknown')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Cumulative Layout Shift</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {metrics.cls ? metrics.cls.toFixed(3) : 'Measuring...'}
                </span>
                <Badge className={getScoreColor(scores.cls || 'unknown')}>
                  {getScoreLabel(scores.cls || 'unknown')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Time to First Byte</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'Measuring...'}
                </span>
                <Badge className={getScoreColor(scores.ttfb || 'unknown')}>
                  {getScoreLabel(scores.ttfb || 'unknown')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Information */}
      {bundleMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {bundleMetrics.totalJSSize}KB
                </div>
                <div className="text-sm text-muted-foreground">
                  JavaScript ({bundleMetrics.jsChunks} chunks)
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {bundleMetrics.totalCSSSize}KB
                </div>
                <div className="text-sm text-muted-foreground">
                  CSS ({bundleMetrics.cssChunks} chunks)
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {bundleMetrics.loadTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Load Time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.memoryUsage && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{metrics.memoryUsage}MB</span>
                </div>
                <Progress 
                  value={Math.min((metrics.memoryUsage / 256) * 100, 100)} 
                  className="h-2"
                />
              </div>
            )}

            {metrics.connectionType && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Connection</span>
                <Badge variant="outline">
                  {metrics.connectionType}
                  {metrics.bandwidth && ` (${metrics.bandwidth} Mbps)`}
                </Badge>
              </div>
            )}

            {metrics.componentMountTime && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Component Mount Time</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.componentMountTime}ms
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            {warnings.length > 0 ? (
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                  >
                    <div className="text-sm text-yellow-800">{warning}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                🎉 No performance issues detected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics (First Contentful Paint, INP) */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.fcp && (
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.round(metrics.fcp)}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  First Contentful Paint
                </div>
              </div>
            )}

            {metrics.inp && (
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {Math.round(metrics.inp)}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Interaction to Next Paint
                </div>
              </div>
            )}

            {metrics.renderTime && (
              <div className="text-center">
                <div className="text-lg font-semibold">
                  {metrics.renderTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Render Time
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin-only Performance Report */}
      {isAdmin && performanceReport && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Performance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Active Optimizations</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(performanceReport.optimizations).map(([key, enabled]) => (
                    <Badge 
                      key={key}
                      variant={enabled ? "default" : "secondary"}
                    >
                      {key}: {enabled ? 'ON' : 'OFF'}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Performance Metrics History</h4>
                <div className="text-sm text-muted-foreground">
                  <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(performanceReport.metrics, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};