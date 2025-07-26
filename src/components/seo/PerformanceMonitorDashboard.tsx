import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useBundleAnalysis } from '@/hooks/useBundleAnalysis';
import { trackWebVitals, optimizeCoreWebVitals } from '@/utils/performanceOptimizer';
import { TrendingUp, Zap, Clock, Eye, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { PerformanceBudget } from '@/components/performance/PerformanceBudget';

export const PerformanceMonitorDashboard = () => {
  const { metrics, score, grade, isOptimal } = usePerformanceMonitor();
  const { analysis, isAnalyzing, analyzeBundleSize, performanceScore, optimizationPotential } = useBundleAnalysis();

  useEffect(() => {
    // Initialize performance monitoring
    trackWebVitals();
    optimizeCoreWebVitals();
    
    // Analyze bundle on component mount
    analyzeBundleSize();
  }, [analyzeBundleSize]);

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const coreWebVitals = [
    {
      name: 'LCP (Largest Contentful Paint)',
      value: metrics.lcp,
      unit: 's',
      status: getMetricStatus(metrics.lcp || 0, { good: 2.5, poor: 4.0 }),
      target: '< 2.5s',
      description: 'Time to render the largest content element'
    },
    {
      name: 'CLS (Cumulative Layout Shift)',
      value: metrics.cls,
      unit: '',
      status: getMetricStatus(metrics.cls || 0, { good: 0.1, poor: 0.25 }),
      target: '< 0.1',
      description: 'Visual stability during page load'
    },
    {
      name: 'FID (First Input Delay)',
      value: metrics.fid,
      unit: 'ms',
      status: getMetricStatus(metrics.fid || 0, { good: 100, poor: 300 }),
      target: '< 100ms',
      description: 'Time to process first user interaction'
    },
    {
      name: 'FCP (First Contentful Paint)',
      value: metrics.fcp,
      unit: 's',
      status: getMetricStatus(metrics.fcp || 0, { good: 1.8, poor: 3.0 }),
      target: '< 1.8s',
      description: 'Time to render first content'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Performance Monitoring */}
      <PerformanceMonitor />
      
      {/* Performance Budget Monitoring */}
      <PerformanceBudget />

      {/* Bundle Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Bundle Analysis
              <Badge variant="outline" className="ml-auto">
                Score: {performanceScore}/100
              </Badge>
            </CardTitle>
            <CardDescription>
              JavaScript bundle optimization insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Bundle Size</span>
                </div>
                <div className="text-2xl font-bold">
                  {(analysis.totalSize / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-sm text-muted-foreground">
                  Gzipped: {(analysis.gzippedSize / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Chunk Count</span>
                </div>
                <div className="text-2xl font-bold">{analysis.chunks.length}</div>
                <div className="text-sm text-muted-foreground">
                  Largest: {(Math.max(...analysis.chunks.map(c => c.size)) / 1024).toFixed(1)} KB
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Optimization</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {optimizationPotential.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Potential savings
                </div>
              </div>
            </div>

            {/* Top Chunks */}
            <div className="mt-6 space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Largest Chunks
              </h4>
              <div className="space-y-2">
                {analysis.chunks.slice(0, 5).map((chunk, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-mono">{chunk.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{(chunk.size / 1024).toFixed(1)} KB</span>
                      <Progress value={(chunk.size / Math.max(...analysis.chunks.map(c => c.size))) * 100} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Optimization Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
                    <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Actions</CardTitle>
          <CardDescription>
            Tools to analyze and optimize your application performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={analyzeBundleSize} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Bundle'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Refresh Metrics
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => console.log('Performance Report:', { metrics, score, analysis })}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};