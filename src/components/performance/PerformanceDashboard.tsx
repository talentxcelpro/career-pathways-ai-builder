import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebVitals } from '@/hooks/useWebVitals';
import { Activity, Zap, Clock, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { metrics, insights, sendToAnalytics } = useWebVitals();
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [deviceMemory, setDeviceMemory] = useState<number | undefined>();

  useEffect(() => {
    // Get connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    // Get device memory
    if ('deviceMemory' in navigator) {
      setDeviceMemory((navigator as any).deviceMemory);
    }

    // Send metrics to analytics after 5 seconds
    const timer = setTimeout(() => {
      sendToAnalytics();
    }, 5000);

    return () => clearTimeout(timer);
  }, [sendToAnalytics]);

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMetricColor = (metric: string, value: number | null) => {
    if (value === null) return 'text-gray-500';
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-600' : value <= 4000 ? 'text-yellow-600' : 'text-red-600';
      case 'fid':
      case 'inp':
        return value <= 100 ? 'text-green-600' : value <= 300 ? 'text-yellow-600' : 'text-red-600';
      case 'cls':
        return value <= 0.1 ? 'text-green-600' : value <= 0.25 ? 'text-yellow-600' : 'text-red-600';
      case 'ttfb':
        return value <= 800 ? 'text-green-600' : value <= 1800 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMetricValue = (metric: string, value: number | null) => {
    if (value === null) return 'N/A';
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'lcp':
      case 'fid':
      case 'inp':
      case 'fcp':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      default:
        return Math.round(value).toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Score
            </CardTitle>
            <CardDescription>
              Overall Core Web Vitals performance assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${getScoreColor(insights.score)}`} />
              <span className="text-2xl font-bold capitalize">{insights.score.replace('-', ' ')}</span>
              {insights.score === 'poor' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            </div>
            {insights.recommendations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Recommendations:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {insights.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <CardDescription className="text-xs">Largest Contentful Paint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getMetricColor('lcp', metrics.lcp)}>
                {formatMetricValue('lcp', metrics.lcp)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;2.5s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">INP</CardTitle>
            <CardDescription className="text-xs">Interaction to Next Paint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getMetricColor('inp', metrics.inp || metrics.fid)}>
                {formatMetricValue('inp', metrics.inp || metrics.fid)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;200ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <CardDescription className="text-xs">Cumulative Layout Shift</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getMetricColor('cls', metrics.cls)}>
                {formatMetricValue('cls', metrics.cls)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;0.1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TTFB</CardTitle>
            <CardDescription className="text-xs">Time to First Byte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getMetricColor('ttfb', metrics.ttfb)}>
                {formatMetricValue('ttfb', metrics.ttfb)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;800ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium capitalize">{connectionType}</div>
            <p className="text-xs text-muted-foreground">Network type</p>
          </CardContent>
        </Card>

        {deviceMemory && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Device Memory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{deviceMemory} GB</div>
              <p className="text-xs text-muted-foreground">Available RAM</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              FCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {formatMetricValue('fcp', metrics.fcp)}
            </div>
            <p className="text-xs text-muted-foreground">First Contentful Paint</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Quick Wins</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enable browser caching</li>
                <li>• Optimize images (WebP format)</li>
                <li>• Minimize JavaScript bundles</li>
                <li>• Use CDN for static assets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Optimizations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implement code splitting</li>
                <li>• Use service workers</li>
                <li>• Preload critical resources</li>
                <li>• Minimize main thread work</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};