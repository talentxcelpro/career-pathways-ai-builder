import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Zap, Server, Database, Globe, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const PerformanceMonitoring = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Mock data - replace with real data from useAdvancedAdmin hook
  const systemHealth = [
    { 
      service: 'Web Server', 
      status: 'healthy', 
      uptime: '99.9%', 
      responseTime: '125ms',
      lastCheck: '2 minutes ago',
      icon: Server
    },
    { 
      service: 'Database', 
      status: 'healthy', 
      uptime: '99.8%', 
      responseTime: '45ms',
      lastCheck: '1 minute ago',
      icon: Database
    },
    { 
      service: 'CDN', 
      status: 'warning', 
      uptime: '98.5%', 
      responseTime: '89ms',
      lastCheck: '3 minutes ago',
      icon: Globe
    },
    { 
      service: 'AI Services', 
      status: 'healthy', 
      uptime: '99.2%', 
      responseTime: '234ms',
      lastCheck: '1 minute ago',
      icon: Zap
    }
  ];

  const performanceMetrics = [
    { name: 'Page Load Time', value: 1.8, target: 2.0, unit: 's', status: 'good' },
    { name: 'First Contentful Paint', value: 0.9, target: 1.5, unit: 's', status: 'good' },
    { name: 'Largest Contentful Paint', value: 2.1, target: 2.5, unit: 's', status: 'good' },
    { name: 'Cumulative Layout Shift', value: 0.08, target: 0.1, unit: '', status: 'good' },
    { name: 'Time to Interactive', value: 2.8, target: 3.5, unit: 's', status: 'good' },
    { name: 'Total Blocking Time', value: 78, target: 200, unit: 'ms', status: 'good' }
  ];

  const alertsData = [
    { id: 1, severity: 'warning', message: 'CDN response time increased by 15%', time: '5 minutes ago', resolved: false },
    { id: 2, severity: 'info', message: 'Database connection pool optimized', time: '1 hour ago', resolved: true },
    { id: 3, severity: 'error', message: 'API rate limit exceeded for user analytics', time: '2 hours ago', resolved: true },
    { id: 4, severity: 'warning', message: 'Memory usage above 80% on server-02', time: '3 hours ago', resolved: false }
  ];

  const performanceData = [
    { time: '00:00', loadTime: 1.8, responseTime: 125, throughput: 450 },
    { time: '04:00', loadTime: 1.6, responseTime: 110, throughput: 380 },
    { time: '08:00', loadTime: 2.1, responseTime: 145, throughput: 680 },
    { time: '12:00', loadTime: 2.3, responseTime: 160, throughput: 920 },
    { time: '16:00', loadTime: 2.0, responseTime: 140, throughput: 850 },
    { time: '20:00', loadTime: 1.9, responseTime: 130, throughput: 720 },
    { time: '24:00', loadTime: 1.7, responseTime: 120, throughput: 480 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemHealth.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  {getStatusBadge(service.status)}
                </div>
                <h3 className="font-semibold">{service.service}</h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response</span>
                    <span className="font-medium">{service.responseTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.lastCheck}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{metric.name}</h3>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target}{metric.unit}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Time</CardTitle>
                <CardDescription>Average page load time over 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="loadTime" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Server Response Time</CardTitle>
                <CardDescription>API response time trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="hsl(var(--secondary))" 
                      fill="hsl(var(--secondary))"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Throughput Analysis</CardTitle>
              <CardDescription>Request throughput over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="throughput" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>System alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertsData.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {alert.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.severity === 'info' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{alert.message}</p>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.time}
                        </span>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button variant="outline" size="sm">
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity and error logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">[2024-01-15 14:32:15]</span> INFO: Database connection pool optimized
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">[2024-01-15 14:31:42]</span> WARN: CDN response time increased
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">[2024-01-15 14:30:18]</span> INFO: Cache cleared successfully
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">[2024-01-15 14:28:55]</span> ERROR: API rate limit exceeded
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">[2024-01-15 14:27:33]</span> INFO: Backup completed successfully
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Load More Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoring;