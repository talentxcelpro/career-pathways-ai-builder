import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Clock,
  Target,
  BarChart3,
  PlayCircle,
  StopCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OptimizationConfig {
  maxRetries: number;
  batchSize: number;
  processIntervalMinutes: number;
  enableSmartThrottling: boolean;
  priorityRouting: boolean;
  autoFailureRecovery: boolean;
}

interface OptimizationMetrics {
  queueSize: number;
  processingRate: number;
  successRate: number;
  averageDeliveryTime: number;
  failureRate: number;
  lastOptimizedAt: string;
}

export const EmailAutomationOptimizer: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [config, setConfig] = useState<OptimizationConfig>({
    maxRetries: 3,
    batchSize: 10,
    processIntervalMinutes: 5,
    enableSmartThrottling: true,
    priorityRouting: true,
    autoFailureRecovery: true
  });

  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    queueSize: 0,
    processingRate: 0,
    successRate: 95.2,
    averageDeliveryTime: 2.1,
    failureRate: 4.8,
    lastOptimizedAt: new Date().toISOString()
  });

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: 'performance',
      title: 'Increase batch size for better throughput',
      description: 'Current batch size is optimal for your volume',
      impact: 'medium',
      implemented: false
    },
    {
      id: 2,
      type: 'reliability',
      title: 'Enable smart retry logic',
      description: 'Reduce failure rate by implementing exponential backoff',
      impact: 'high',
      implemented: true
    },
    {
      id: 3,
      type: 'efficiency',
      title: 'Optimize processing intervals',
      description: 'Adjust timing based on peak usage patterns',
      impact: 'low',
      implemented: false
    }
  ]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate loading metrics from database
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, scheduled_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate metrics
      const queueSize = data?.filter(item => item.status === 'pending').length || 0;
      const successCount = data?.filter(item => item.status === 'sent').length || 0;
      const failureCount = data?.filter(item => item.status === 'failed').length || 0;
      const total = data?.length || 1;

      setMetrics(prev => ({
        ...prev,
        queueSize,
        successRate: (successCount / total) * 100,
        failureRate: (failureCount / total) * 100,
        processingRate: successCount / 24 // per hour
      }));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-email-queue', {
        body: {
          config,
          actions: [
            'cleanup_failed_emails',
            'batch_pending_emails', 
            'optimize_retry_logic',
            'update_processing_intervals'
          ]
        }
      });

      if (error) throw error;

      toast({
        title: "Optimization Complete",
        description: `Applied ${data.optimizationsApplied} optimizations successfully.`,
      });

      await loadMetrics();
    } catch (error: any) {
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize email queue",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateConfig = (key: keyof OptimizationConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'reliability': return <CheckCircle className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Email Automation Optimizer</h2>
          <p className="text-muted-foreground">Optimize email queue performance and delivery rates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadMetrics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={runOptimization} disabled={isOptimizing} className="gap-2">
            {isOptimizing ? (
              <>
                <StopCircle className="h-4 w-4 animate-pulse" />
                Optimizing...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Run Optimization
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Queue Size</p>
                <p className="text-2xl font-bold">{metrics.queueSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.successRate, { good: 95, warning: 90 })}`}>
                  {metrics.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</p>
                <p className="text-2xl font-bold">{metrics.averageDeliveryTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Rate</p>
                <p className="text-2xl font-bold">{metrics.processingRate.toFixed(1)}/h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Health */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">{metrics.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.successRate} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Queue Efficiency</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Health</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cleaned 15 failed emails</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reset 3 stuck emails</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Queued 8 emails for retry</p>
                      <p className="text-xs text-muted-foreground">8 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={config.maxRetries}
                      onChange={(e) => updateConfig('maxRetries', parseInt(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={config.batchSize}
                      onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="processInterval">Process Interval (minutes)</Label>
                    <Input
                      id="processInterval"
                      type="number"
                      value={config.processIntervalMinutes}
                      onChange={(e) => updateConfig('processIntervalMinutes', parseInt(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Smart Throttling</Label>
                    <Switch
                      checked={config.enableSmartThrottling}
                      onCheckedChange={(checked) => updateConfig('enableSmartThrottling', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Priority Routing</Label>
                    <Switch
                      checked={config.priorityRouting}
                      onCheckedChange={(checked) => updateConfig('priorityRouting', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Auto Failure Recovery</Label>
                    <Switch
                      checked={config.autoFailureRecovery}
                      onCheckedChange={(checked) => updateConfig('autoFailureRecovery', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                        {rec.implemented && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Implemented
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    {!rec.implemented && (
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};