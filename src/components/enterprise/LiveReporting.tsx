import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  status: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export const LiveReporting: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      id: '1',
      name: 'Active Users',
      value: 1247,
      change: 5.2,
      status: 'up',
      lastUpdated: new Date().toLocaleTimeString()
    },
    {
      id: '2',
      name: 'Job Applications',
      value: 89,
      change: -2.1,
      status: 'down',
      lastUpdated: new Date().toLocaleTimeString()
    },
    {
      id: '3',
      name: 'System Load',
      value: 67,
      change: 0,
      status: 'stable',
      lastUpdated: new Date().toLocaleTimeString()
    },
    {
      id: '4',
      name: 'Response Time',
      value: 145,
      change: -8.3,
      status: 'up',
      lastUpdated: new Date().toLocaleTimeString()
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'success',
      message: 'Marketing campaign reached 10K impressions',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString()
    },
    {
      id: '2',
      type: 'warning',
      message: 'High memory usage detected on server cluster',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString()
    },
    {
      id: '3',
      type: 'info',
      message: 'Weekly backup completed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString()
    }
  ]);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + Math.floor(Math.random() * 10 - 5),
          change: (Math.random() - 0.5) * 10,
          status: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
          lastUpdated: new Date().toLocaleTimeString()
        }))
      );
      setLastRefresh(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setLastRefresh(new Date());
    // Add a new mock alert
    const newAlert: SystemAlert = {
      id: String(Date.now()),
      type: ['info', 'warning', 'success'][Math.floor(Math.random() * 3)] as any,
      message: 'Data refreshed manually',
      timestamp: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Live Reporting</h2>
          <p className="text-muted-foreground">Real-time system metrics and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        Last updated: {lastRefresh.toLocaleTimeString()}
        <Badge variant="outline" className="ml-2">
          Live
        </Badge>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={metric.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                from last period
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Updated: {metric.lastUpdated}
              </p>
            </CardContent>
            {/* Live indicator */}
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
                <Badge variant={getAlertBadgeVariant(alert.type) as any}>
                  {alert.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">New registrations</span>
                <span className="text-sm font-medium text-green-600">+12 (last hour)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active sessions</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Page views</span>
                <span className="text-sm font-medium text-blue-600">+8,456 (today)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bounce rate</span>
                <span className="text-sm font-medium text-yellow-600">24.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Jobs posted today</span>
                <span className="text-sm font-medium text-green-600">+8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Applications received</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Interviews scheduled</span>
                <span className="text-sm font-medium text-blue-600">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion rate</span>
                <span className="text-sm font-medium text-purple-600">12.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};