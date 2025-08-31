import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Activity
} from "lucide-react";

interface UpdateStatus {
  lastUpdate: string;
  nextUpdate: string;
  status: 'idle' | 'updating' | 'completed' | 'error';
  progress: number;
  componentUpdates: Array<{
    component: string;
    status: 'pending' | 'updating' | 'completed' | 'error';
    lastUpdated: string;
    errorMessage?: string;
  }>;
}

interface PerformanceMetrics {
  cacheHitRate: number;
  apiResponseTime: number;
  pageLoadTime: number;
  mobilePerformance: number;
  desktopPerformance: number;
  seoScore: number;
  accessibilityScore: number;
}

export const AutoUpdateSystem: React.FC = () => {
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(30); // seconds
  const queryClient = useQueryClient();

  // Fetch update status
  const { data: updateStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['auto-update-status'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        lastUpdate: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        nextUpdate: new Date(Date.now() + 1000 * 60 * 25).toISOString(), // 25 minutes from now
        status: 'idle' as const,
        progress: 0,
        componentUpdates: [
          {
            component: 'Job Data',
            status: 'completed' as const,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 2).toISOString()
          },
          {
            component: 'Salary Insights',
            status: 'completed' as const,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 3).toISOString()
          },
          {
            component: 'Trending Analytics',
            status: 'completed' as const,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 1).toISOString()
          },
          {
            component: 'Regional Data',
            status: 'completed' as const,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 4).toISOString()
          }
        ]
      } as UpdateStatus;
    },
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Fetch performance metrics
  const { data: performanceMetrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      return {
        cacheHitRate: 94.2,
        apiResponseTime: 145,
        pageLoadTime: 2.1,
        mobilePerformance: 89,
        desktopPerformance: 96,
        seoScore: 92,
        accessibilityScore: 88
      } as PerformanceMetrics;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Auto-update functionality
  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['trending-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['salary-insights'] });
      queryClient.invalidateQueries({ queryKey: ['regional-trends'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-metrics'] });
      
      console.log('Auto-update triggered - cache invalidated');
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [updateInterval, queryClient]);

  // Manual update function
  const triggerManualUpdate = useCallback(async () => {
    setIsManualUpdate(true);
    try {
      // Invalidate all queries
      await queryClient.invalidateQueries();
      
      // Prefetch critical data
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['trending-jobs'],
          queryFn: () => Promise.resolve([]) // Replace with actual API call
        }),
        queryClient.prefetchQuery({
          queryKey: ['salary-insights'],
          queryFn: () => Promise.resolve([]) // Replace with actual API call
        }),
        queryClient.prefetchQuery({
          queryKey: ['regional-trends'],
          queryFn: () => Promise.resolve([]) // Replace with actual API call
        })
      ]);
      
      toast.success('Data updated successfully!');
    } catch (error) {
      toast.error('Failed to update data');
      console.error('Manual update failed:', error);
    } finally {
      setIsManualUpdate(false);
    }
  }, [queryClient]);

  // Service Worker registration disabled to prevent stale caches
  useEffect(() => {
    console.log('AutoUpdateSystem: SW registration disabled');
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'updating': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'updating': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-Update Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Auto-Update System
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(updateStatus?.status || 'idle')}>
                {updateStatus?.status?.toUpperCase() || 'IDLE'}
              </Badge>
              <Button 
                size="sm" 
                onClick={triggerManualUpdate}
                disabled={isManualUpdate}
              >
                {isManualUpdate ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isManualUpdate ? 'Updating...' : 'Update Now'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Update</span>
              <div className="font-semibold">
                {updateStatus ? formatTime(updateStatus.lastUpdate) : '--:--'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Next Update</span>
              <div className="font-semibold">
                {updateStatus ? formatTime(updateStatus.nextUpdate) : '--:--'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Update Interval</span>
              <div className="flex items-center space-x-2">
                <select 
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {updateStatus?.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Update Progress</span>
                <span>{updateStatus.progress}%</span>
              </div>
              <Progress value={updateStatus.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Update Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Component Update Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updateStatus?.componentUpdates.map((component) => (
              <div key={component.component} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(component.status)}
                  <div>
                    <div className="font-medium">{component.component}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {formatTime(component.lastUpdated)}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(component.status)}>
                  {component.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Real-time Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.cacheHitRate || 0)}`}>
                {performanceMetrics?.cacheHitRate || 0}%
              </div>
              <Progress value={performanceMetrics?.cacheHitRate || 0} className="h-2 mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">API Response Time</span>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics?.apiResponseTime || 0}ms
              </div>
              <Progress value={Math.max(0, 100 - (performanceMetrics?.apiResponseTime || 0) / 10)} className="h-2 mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Page Load Time</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics?.pageLoadTime || 0}s
              </div>
              <Progress value={Math.max(0, 100 - (performanceMetrics?.pageLoadTime || 0) * 20)} className="h-2 mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Mobile Performance</span>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.mobilePerformance || 0)}`}>
                {performanceMetrics?.mobilePerformance || 0}
              </div>
              <Progress value={performanceMetrics?.mobilePerformance || 0} className="h-2 mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Desktop Performance</span>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.desktopPerformance || 0)}`}>
                {performanceMetrics?.desktopPerformance || 0}
              </div>
              <Progress value={performanceMetrics?.desktopPerformance || 0} className="h-2 mt-2" />
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">SEO Score</span>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`text-2xl font-bold ${getPerformanceColor(performanceMetrics?.seoScore || 0)}`}>
                {performanceMetrics?.seoScore || 0}
              </div>
              <Progress value={performanceMetrics?.seoScore || 0} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Update Features */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Update Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Data Sources</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Real-time job postings</li>
                <li>• Live salary data feeds</li>
                <li>• Market trend analytics</li>
                <li>• Regional hiring statistics</li>
                <li>• Company performance metrics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Performance Optimizations</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Intelligent caching layer</li>
                <li>• Background data prefetching</li>
                <li>• Lazy loading components</li>
                <li>• Progressive image loading</li>
                <li>• Service worker updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};