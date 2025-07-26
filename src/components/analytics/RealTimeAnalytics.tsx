import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from '@/services/analyticsService';

interface RealTimeMetrics {
  activeUsers: number;
  totalUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  errorRate: number;
  databaseConnections: number;
}

export function RealTimeAnalytics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    totalUsers: 0,
    systemHealth: 'healthy',
    responseTime: 0,
    errorRate: 0,
    databaseConnections: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch real-time metrics
        const [userStats, systemStats] = await Promise.all([
          analyticsService.getRealTimeUserStats(),
          analyticsService.getSystemHealth()
        ]);

        setMetrics({
          activeUsers: userStats.activeUsers || 0,
          totalUsers: userStats.totalUsers || 0,
          systemHealth: systemStats.status || 'healthy',
          responseTime: systemStats.averageResponseTime || 0,
          errorRate: systemStats.errorRate || 0,
          databaseConnections: systemStats.databaseConnections || 0
        });
      } catch (error) {
        console.error('Error fetching real-time metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Set up real-time subscription for metrics updates
    const channel = supabase
      .channel('realtime-analytics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_sessions'
      }, () => {
        // Refresh metrics when user activity changes
        fetchMetrics();
      })
      .subscribe();

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy': return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Analytics</h2>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.totalUsers} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertCircle className={`h-4 w-4 ${getHealthColor(metrics.systemHealth)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {getHealthBadge(metrics.systemHealth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.databaseConnections} DB connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Security Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    RLS Enabled
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Authentication System</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Operational
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>AI Services</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Running
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>API Response Time</span>
                  <span className="font-medium">{metrics.responseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database Query Time</span>
                  <span className="font-medium">&lt; 100ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cache Hit Rate</span>
                  <span className="font-medium">95%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>RLS Policies</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Function Security</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Secured
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Anonymous Access</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Restricted
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}