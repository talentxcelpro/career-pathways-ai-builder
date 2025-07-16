import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Zap, 
  Globe, 
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
}

interface PageMetric {
  page: string;
  loadTime: number;
  fcp: number;
  lcp: number;
  cls: number;
  score: number;
}

export const PerformanceMonitoring = () => {
  const [metrics] = useState<PerformanceMetric[]>([
    { name: 'Page Load Time', value: 1.2, unit: 's', status: 'good', trend: 'down', target: 2.0 },
    { name: 'First Contentful Paint', value: 0.8, unit: 's', status: 'good', trend: 'stable', target: 1.0 },
    { name: 'Largest Contentful Paint', value: 2.1, unit: 's', status: 'warning', trend: 'up', target: 2.0 },
    { name: 'Cumulative Layout Shift', value: 0.05, unit: '', status: 'good', trend: 'down', target: 0.1 },
    { name: 'Time to Interactive', value: 1.8, unit: 's', status: 'good', trend: 'stable', target: 3.0 },
    { name: 'Server Response Time', value: 180, unit: 'ms', status: 'good', trend: 'down', target: 200 }
  ]);

  const [pageMetrics] = useState<PageMetric[]>([
    { page: '/services', loadTime: 1.1, fcp: 0.7, lcp: 1.9, cls: 0.03, score: 94 },
    { page: '/marketplace', loadTime: 1.3, fcp: 0.9, lcp: 2.2, cls: 0.06, score: 89 },
    { page: '/services/:id', loadTime: 1.5, fcp: 0.8, lcp: 2.4, cls: 0.04, score: 87 },
    { page: '/marketplace/post-service', loadTime: 1.0, fcp: 0.6, lcp: 1.7, cls: 0.02, score: 96 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">Real-time performance metrics and optimization insights</p>
        </div>
        <Button>
          <Activity className="h-4 w-4 mr-2" />
          Run Performance Audit
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Core Web Vitals</span>
              </div>
              <Badge variant="outline" className="text-green-500">Good</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>LCP: 2.1s</span>
                <span className="text-yellow-500">Needs Improvement</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>FID: 45ms</span>
                <span className="text-green-500">Good</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>CLS: 0.05</span>
                <span className="text-green-500">Good</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Lighthouse Score</span>
              </div>
              <span className="text-2xl font-bold text-green-500">91</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span className="text-green-500">91</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accessibility</span>
                <span className="text-green-500">96</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>SEO</span>
                <span className="text-green-500">98</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Server Health</span>
              </div>
              <Badge variant="outline" className="text-green-500">Healthy</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uptime</span>
                <span className="text-green-500">99.9%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="text-green-500">180ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="text-green-500">0.02%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <h4 className="font-medium">{metric.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {metric.target}{metric.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}{metric.unit}
                        </span>
                        <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                      </div>
                      <Progress 
                        value={(metric.value / metric.target) * 100} 
                        className="w-24 h-2 mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-4">
            {pageMetrics.map((page, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{page.page}</h4>
                    <Badge className={getScoreColor(page.score)}>
                      Score: {page.score}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Load Time</span>
                      <p className="font-medium">{page.loadTime}s</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">FCP</span>
                      <p className="font-medium">{page.fcp}s</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LCP</span>
                      <p className="font-medium">{page.lcp}s</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CLS</span>
                      <p className="font-medium">{page.cls}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Image Optimization
                </CardTitle>
                <CardDescription>
                  Optimize images to improve Largest Contentful Paint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Convert images to WebP format and implement lazy loading to reduce load times by up to 30%.
                </p>
                <Button size="sm">Apply Optimization</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-500" />
                  Database Query Optimization
                </CardTitle>
                <CardDescription>
                  Optimize slow database queries affecting page load
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Add indexes to frequently queried columns and implement query caching.
                </p>
                <Button size="sm">Review Queries</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};