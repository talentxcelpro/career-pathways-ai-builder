import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Server,
  Database,
  Zap,
  TrendingUp,
  RefreshCw,
  Wifi,
  Shield
} from 'lucide-react';
import { useTXCPerformance } from '@/hooks/useTXCPerformance';
import { useToast } from '@/hooks/use-toast';

interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  icon: React.ComponentType<any>;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

const TXCSystemStatus: React.FC = () => {
  const { toast } = useToast();
  const { metrics, isOptimizing, optimizePerformance, cacheStats } = useTXCPerformance();
  const [components, setComponents] = useState<SystemComponent[]>([
    {
      name: 'TXC Mining Engine',
      status: 'operational',
      responseTime: 45,
      uptime: 99.9,
      lastChecked: new Date(),
      icon: Zap
    },
    {
      name: 'Balance Service',
      status: 'operational',
      responseTime: 32,
      uptime: 99.8,
      lastChecked: new Date(),
      icon: Database
    },
    {
      name: 'Leaderboard API',
      status: 'operational',
      responseTime: 78,
      uptime: 99.7,
      lastChecked: new Date(),
      icon: TrendingUp
    },
    {
      name: 'Real-time System',
      status: 'operational',
      responseTime: 25,
      uptime: 99.9,
      lastChecked: new Date(),
      icon: Wifi
    },
    {
      name: 'Security Layer',
      status: 'operational',
      responseTime: 15,
      uptime: 100,
      lastChecked: new Date(),
      icon: Shield
    },
    {
      name: 'Database Cluster',
      status: 'operational',
      responseTime: 40,
      uptime: 99.95,
      lastChecked: new Date(),
      icon: Server
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'info',
      message: 'TXC Phase 5 optimizations deployed successfully',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      resolved: false
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'down'>('operational');

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setComponents(prevComponents => 
        prevComponents.map(component => ({
          ...component,
          responseTime: Math.max(10, component.responseTime + (Math.random() - 0.5) * 20),
          lastChecked: new Date(),
          // Occasionally simulate degraded performance
          status: Math.random() > 0.95 ? 'degraded' : 'operational'
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate overall system status
  useEffect(() => {
    const degradedComponents = components.filter(c => c.status === 'degraded' || c.status === 'down');
    
    if (degradedComponents.length === 0) {
      setOverallStatus('operational');
    } else if (degradedComponents.length < components.length / 2) {
      setOverallStatus('degraded');
    } else {
      setOverallStatus('down');
    }
  }, [components]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API calls to check component status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setComponents(prevComponents =>
        prevComponents.map(component => ({
          ...component,
          status: Math.random() > 0.1 ? 'operational' : 'degraded',
          responseTime: Math.random() * 100 + 10,
          lastChecked: new Date()
        }))
      );

      toast({
        title: "Status Updated",
        description: "System status has been refreshed",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh system status",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      case 'maintenance': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOverallStatusBadge = () => {
    switch (overallStatus) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Degraded Performance</Badge>;
      case 'down':
        return <Badge variant="destructive">System Issues</Badge>;
      default:
        return <Badge variant="secondary">Unknown Status</Badge>;
    }
  };

  const avgResponseTime = components.reduce((sum, comp) => sum + comp.responseTime, 0) / components.length;
  const avgUptime = components.reduce((sum, comp) => sum + comp.uptime, 0) / components.length;

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              TXC System Status
            </CardTitle>
            <div className="flex items-center gap-3">
              {getOverallStatusBadge()}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{avgUptime.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground">Average Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.hitRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.activeConnections}</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Components */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {components.map((component, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <component.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last checked: {component.lastChecked.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(component.status)}
                    <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                      {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {component.responseTime.toFixed(0)}ms • {component.uptime.toFixed(2)}% uptime
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <span className="text-sm">{cacheStats.hitRate.toFixed(1)}%</span>
              </div>
              <Progress value={cacheStats.hitRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">System Performance</span>
                <span className="text-sm">{(100 - metrics.errorRate).toFixed(1)}%</span>
              </div>
              <Progress value={100 - metrics.errorRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Memory Efficiency</span>
                <span className="text-sm">
                  {metrics.memoryUsage ? (metrics.memoryUsage / 1024 / 1024).toFixed(1) : '0'}MB
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={optimizePerformance} 
                disabled={isOptimizing}
                className="w-full"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize Performance
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.type === 'error' ? 'border-red-200' :
                  alert.type === 'warning' ? 'border-yellow-200' :
                  'border-blue-200'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-start">
                    <div>
                      <div>{alert.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Badge variant="outline" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TXCSystemStatus;