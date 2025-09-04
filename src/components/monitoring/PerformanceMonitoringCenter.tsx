import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Cpu, Database, Globe, Zap, AlertTriangle, 
  CheckCircle, Clock, TrendingUp, Server, Monitor
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  triggeredCount: number;
}

interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'cost' | 'reliability' | 'security';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedImprovement: string;
}

const PerformanceMonitoringCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadPerformanceData();
    loadSystemHealth();
    loadAlertRules();
    loadSuggestions();
  }, [selectedTimeframe]);

  const loadPerformanceData = () => {
    const mockMetrics: PerformanceMetric[] = [
      {
        name: 'API Response Time',
        value: 245,
        unit: 'ms',
        status: 'good',
        threshold: 500,
        trend: 'stable',
        history: [230, 245, 252, 248, 245, 240, 245]
      },
      {
        name: 'Database Queries/sec',
        value: 1247,
        unit: 'ops',
        status: 'good',
        threshold: 2000,
        trend: 'up',
        history: [1100, 1150, 1200, 1220, 1240, 1245, 1247]
      },
      {
        name: 'Memory Usage',
        value: 78,
        unit: '%',
        status: 'warning',
        threshold: 80,
        trend: 'up',
        history: [65, 68, 72, 75, 76, 77, 78]
      },
      {
        name: 'CPU Usage',
        value: 45,
        unit: '%',
        status: 'good',
        threshold: 70,
        trend: 'stable',
        history: [42, 44, 46, 45, 44, 45, 45]
      },
      {
        name: 'Error Rate',
        value: 0.12,
        unit: '%',
        status: 'good',
        threshold: 1,
        trend: 'down',
        history: [0.15, 0.14, 0.13, 0.12, 0.12, 0.11, 0.12]
      },
      {
        name: 'Throughput',
        value: 15600,
        unit: 'req/min',
        status: 'good',
        threshold: 10000,
        trend: 'up',
        history: [14800, 15000, 15200, 15400, 15500, 15550, 15600]
      }
    ];
    setMetrics(mockMetrics);
  };

  const loadSystemHealth = () => {
    const mockHealth: SystemHealth[] = [
      {
        component: 'API Gateway',
        status: 'healthy',
        uptime: 99.98,
        responseTime: 245,
        errorRate: 0.02,
        lastCheck: new Date(Date.now() - 60000)
      },
      {
        component: 'Database',
        status: 'healthy',
        uptime: 99.95,
        responseTime: 12,
        errorRate: 0.01,
        lastCheck: new Date(Date.now() - 30000)
      },
      {
        component: 'Cache Layer',
        status: 'degraded',
        uptime: 98.5,
        responseTime: 156,
        errorRate: 1.2,
        lastCheck: new Date(Date.now() - 120000)
      },
      {
        component: 'File Storage',
        status: 'healthy',
        uptime: 99.99,
        responseTime: 89,
        errorRate: 0.001,
        lastCheck: new Date(Date.now() - 45000)
      },
      {
        component: 'AI Services',
        status: 'healthy',
        uptime: 99.2,
        responseTime: 1250,
        errorRate: 0.8,
        lastCheck: new Date(Date.now() - 90000)
      }
    ];
    setSystemHealth(mockHealth);
  };

  const loadAlertRules = () => {
    const mockRules: AlertRule[] = [
      {
        id: '1',
        name: 'High API Response Time',
        metric: 'api_response_time',
        condition: 'greater_than',
        threshold: 500,
        severity: 'high',
        enabled: true,
        triggeredCount: 0
      },
      {
        id: '2',
        name: 'Memory Usage Critical',
        metric: 'memory_usage',
        condition: 'greater_than',
        threshold: 90,
        severity: 'critical',
        enabled: true,
        triggeredCount: 2
      },
      {
        id: '3',
        name: 'Error Rate Spike',
        metric: 'error_rate',
        condition: 'greater_than',
        threshold: 5,
        severity: 'high',
        enabled: true,
        triggeredCount: 1
      },
      {
        id: '4',
        name: 'Database Connection Pool',
        metric: 'db_connections',
        condition: 'greater_than',
        threshold: 80,
        severity: 'medium',
        enabled: false,
        triggeredCount: 0
      }
    ];
    setAlertRules(mockRules);
  };

  const loadSuggestions = () => {
    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        category: 'performance',
        title: 'Implement Redis Caching',
        description: 'Add Redis caching layer to reduce database queries and improve response times',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '40% faster response times'
      },
      {
        id: '2',
        category: 'cost',
        title: 'Optimize Database Queries',
        description: 'Add indexes and optimize slow queries to reduce CPU usage',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '25% cost reduction'
      },
      {
        id: '3',
        category: 'reliability',
        title: 'Add Circuit Breakers',
        description: 'Implement circuit breaker pattern for external API calls',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '99.9% uptime'
      },
      {
        id: '4',
        category: 'security',
        title: 'Rate Limiting Enhancement',
        description: 'Implement advanced rate limiting to prevent abuse',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '90% fewer attacks'
      }
    ];
    setSuggestions(mockSuggestions);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'cost':
        return <TrendingUp className="h-4 w-4" />;
      case 'reliability':
        return <Server className="h-4 w-4" />;
      case 'security':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <TieredAccessGuard feature="performance_monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Performance Monitoring Center
            </h2>
            <p className="text-muted-foreground">Real-time system performance and optimization insights</p>
          </div>
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={25} label="Monitoring Events" />

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      {getStatusIcon(metric.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {metric.value.toLocaleString()}
                        <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                      </p>
                      <Badge className={getStatusColor(metric.status)} variant="outline">
                        {metric.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Threshold</span>
                        <span>{metric.threshold.toLocaleString()} {metric.unit}</span>
                      </div>
                      <Progress 
                        value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">24h Trend</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {metric.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                        {metric.trend === 'stable' && <Activity className="h-3 w-3 text-yellow-500" />}
                        <span>{metric.trend}</span>
                      </div>
                    </div>

                    {/* Mini chart representation */}
                    <div className="h-16 flex items-end justify-between gap-1">
                      {metric.history.map((value, i) => (
                        <div
                          key={i}
                          className="bg-primary/30 rounded-t flex-1"
                          style={{ 
                            height: `${(value / Math.max(...metric.history)) * 100}%`,
                            minHeight: '2px'
                          }}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemHealth.map((component, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        {component.component}
                      </CardTitle>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-semibold text-green-600">{component.uptime}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="font-semibold">{component.responseTime}ms</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Error Rate</p>
                        <p className="font-semibold">{component.errorRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Check</p>
                        <p className="font-semibold">{component.lastCheck.toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Health Score</span>
                        <span>{component.uptime}%</span>
                      </div>
                      <Progress value={component.uptime} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-3">
              {alertRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <h3 className="font-semibold">{rule.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                        <div className="text-sm text-center">
                          <p className="font-medium">{rule.triggeredCount}</p>
                          <p className="text-muted-foreground">triggered</p>
                        </div>
                        <Button size="sm" variant="outline">
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(suggestion.category)}
                        <div>
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <Badge variant="outline">{suggestion.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Impact</p>
                        <p className={`font-semibold ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Effort</p>
                        <p className="font-semibold">{suggestion.effort}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Estimated Improvement</p>
                      <p className="text-sm text-muted-foreground">{suggestion.estimatedImprovement}</p>
                    </div>

                    <Button className="w-full">
                      Implement Suggestion
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};

export default PerformanceMonitoringCenter;