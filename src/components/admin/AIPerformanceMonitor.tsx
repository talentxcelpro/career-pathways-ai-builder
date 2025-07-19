
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Clock,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastChecked: string;
}

interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  service: string;
}

export const AIPerformanceMonitor = () => {
  const [services, setServices] = useState<ServiceHealth[]>([
    {
      id: '1',
      name: 'Resume Enhancement',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 1200,
      errorRate: 0.1,
      lastChecked: '2 minutes ago'
    },
    {
      id: '2',
      name: 'ATS Optimizer',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 1500,
      errorRate: 0.2,
      lastChecked: '1 minute ago'
    },
    {
      id: '3',
      name: 'Career Advisor',
      status: 'warning',
      uptime: 98.5,
      responseTime: 2800,
      errorRate: 1.5,
      lastChecked: '3 minutes ago'
    },
    {
      id: '4',
      name: 'Salary Analyzer',
      status: 'healthy',
      uptime: 99.7,
      responseTime: 900,
      errorRate: 0.3,
      lastChecked: '1 minute ago'
    }
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Career Advisor response time above threshold (2.8s)',
      timestamp: '5 minutes ago',
      service: 'Career Advisor'
    },
    {
      id: '2',
      type: 'info',
      message: 'Daily API usage reached 80% of limit',
      timestamp: '1 hour ago',
      service: 'Global'
    },
    {
      id: '3',
      type: 'error',
      message: 'Temporary spike in error rate detected',
      timestamp: '2 hours ago',
      service: 'ATS Optimizer'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      // Update last checked times
      setServices(prev => prev.map(service => ({
        ...service,
        lastChecked: 'Just now'
      })));
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default">Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const overallHealth = services.reduce((sum, service) => {
    if (service.status === 'healthy') return sum + 25;
    if (service.status === 'warning') return sum + 15;
    if (service.status === 'critical') return sum + 5;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and health status of AI services
          </p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold">{overallHealth}%</p>
                <Progress value={overallHealth} className="mt-2" />
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold">{services.filter(s => s.status !== 'offline').length}/{services.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">{Math.round(services.reduce((sum, s) => sum + s.responseTime, 0) / services.length)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{(services.reduce((sum, s) => sum + s.errorRate, 0) / services.length).toFixed(2)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Service Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Last Checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(service.status)}
                      <span className="font-medium">{service.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(service.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{service.uptime}%</span>
                      <Progress value={service.uptime} className="w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{service.responseTime}ms</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={service.errorRate > 1 ? 'text-red-600' : 'text-green-600'}>
                      {service.errorRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.lastChecked}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={
                alert.type === 'error' ? 'border-red-200' :
                alert.type === 'warning' ? 'border-yellow-200' : 'border-blue-200'
              }>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {alert.service}
                          </Badge>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
