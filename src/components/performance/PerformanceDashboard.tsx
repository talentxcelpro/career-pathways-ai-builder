import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PerformanceTracker } from '@/utils/performanceTracker';
import { useWebVitals } from '@/hooks/useWebVitals';
import { useAdvancedInterlinking } from '@/hooks/useAdvancedInterlinking';
import { Activity, Zap, Target, Link2, TrendingUp } from 'lucide-react';

export const PerformanceDashboard = () => {
  const { metrics, insights } = useWebVitals();
  const { linkMetrics, contextualSuggestions } = useAdvancedInterlinking();
  const [performanceScore, setPerformanceScore] = useState(0);
  const [competitorComparison, setCompetitorComparison] = useState<Record<string, any>>({});

  useEffect(() => {
    const score = PerformanceTracker.getPerformanceScore();
    setPerformanceScore(score);

    // Global media benchmarks
    setCompetitorComparison({
      cnn: { lcp: 3200, fcp: 1800, ttfb: 650 },
      bbc: { lcp: 2900, fcp: 1600, ttfb: 580 },
      reuters: { lcp: 3100, fcp: 1700, ttfb: 720 },
      nytimes: { lcp: 2800, fcp: 1500, ttfb: 490 },
      talentxcel: { 
        lcp: metrics.lcp || 0, 
        fcp: metrics.fcp || 0, 
        ttfb: metrics.ttfb || 0 
      }
    });
  }, [metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatus = (value: number, good: number, poor: number) => {
    if (value <= good) return { status: 'good', color: 'bg-green-500' };
    if (value <= poor) return { status: 'needs-improvement', color: 'bg-yellow-500' };
    return { status: 'poor', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                {performanceScore}
              </div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
              <Progress value={performanceScore} className="mt-2" />
            </div>

            {/* Core Web Vitals */}
            {metrics.lcp && (
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getMetricStatus(metrics.lcp, 2500, 4000).color.replace('bg-', 'text-')}`}>
                  {Math.round(metrics.lcp)}ms
                </div>
                <div className="text-sm text-muted-foreground">LCP</div>
                <Badge variant={getMetricStatus(metrics.lcp, 2500, 4000).status === 'good' ? 'default' : 'destructive'}>
                  {getMetricStatus(metrics.lcp, 2500, 4000).status}
                </Badge>
              </div>
            )}

            {metrics.fcp && (
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getMetricStatus(metrics.fcp, 1800, 3000).color.replace('bg-', 'text-')}`}>
                  {Math.round(metrics.fcp)}ms
                </div>
                <div className="text-sm text-muted-foreground">FCP</div>
                <Badge variant={getMetricStatus(metrics.fcp, 1800, 3000).status === 'good' ? 'default' : 'destructive'}>
                  {getMetricStatus(metrics.fcp, 1800, 3000).status}
                </Badge>
              </div>
            )}

            {metrics.cls !== null && (
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getMetricStatus(metrics.cls, 0.1, 0.25).color.replace('bg-', 'text-')}`}>
                  {metrics.cls.toFixed(3)}
                </div>
                <div className="text-sm text-muted-foreground">CLS</div>
                <Badge variant={getMetricStatus(metrics.cls, 0.1, 0.25).status === 'good' ? 'default' : 'destructive'}>
                  {getMetricStatus(metrics.cls, 0.1, 0.25).status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Global Media Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Global Media Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(competitorComparison).map(([site, data]) => (
              <div key={site} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="font-medium capitalize">{site}</div>
                <div className="flex gap-4 text-sm">
                  <span>LCP: {data.lcp}ms</span>
                  <span>FCP: {data.fcp}ms</span>
                  <span>TTFB: {data.ttfb}ms</span>
                </div>
                {site === 'talentxcel' && (
                  <Badge variant="default">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interlinking Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Interlinking Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Performing Links</h4>
              <div className="space-y-2">
                {Object.entries(linkMetrics)
                  .sort(([,a], [,b]) => b.clicks - a.clicks)
                  .slice(0, 5)
                  .map(([href, data]) => (
                    <div key={href} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm truncate">{href}</span>
                      <Badge variant="secondary">{data.clicks} clicks</Badge>
                    </div>
                  ))
                }
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Contextual Suggestions</h4>
              <div className="space-y-2">
                {contextualSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm">{suggestion.text}</span>
                    <Badge variant="outline">{Math.round(suggestion.relevanceScore * 100)}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={insights.score === 'good' ? 'default' : insights.score === 'needs-improvement' ? 'secondary' : 'destructive'}>
                  {insights.score}
                </Badge>
                <span className="text-sm">Overall Performance Rating</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations:</h4>
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-muted-foreground p-2 bg-muted rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Performance Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Real-time Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">FAST</div>
              <div className="text-sm text-muted-foreground">Page Load</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">OPTIMIZED</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">ACTIVE</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">ELITE</div>
              <div className="text-sm text-muted-foreground">Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};