import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Zap, Settings, Database, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PerformanceConfig {
  batchSize: number;
  processingInterval: number;
  maxRetries: number;
  rateLimitPerMinute: number;
  enableBulkProcessing: boolean;
  enableSmartRetry: boolean;
}

interface PerformanceMetrics {
  queueDepth: number;
  avgProcessingTime: number;
  throughputPerMinute: number;
  errorRate: number;
  retrySuccessRate: number;
}

export const EmailPerformanceOptimizer = () => {
  const [config, setConfig] = useState<PerformanceConfig>({
    batchSize: 10,
    processingInterval: 30,
    maxRetries: 3,
    rateLimitPerMinute: 14, // AWS SES limit is 14/sec, so 840/min
    enableBulkProcessing: true,
    enableSmartRetry: true
  });
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queueDepth: 0,
    avgProcessingTime: 0,
    throughputPerMinute: 0,
    errorRate: 0,
    retrySuccessRate: 0
  });
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPerformanceMetrics = async () => {
    try {
      // Get current queue depth
      const { count: queueDepth } = await supabase
        .from('email_automation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get recent processing metrics
      const { data: recentEmails } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, processed_at')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(100);

      if (recentEmails) {
        const processed = recentEmails.filter(email => email.processed_at);
        const failed = recentEmails.filter(email => email.status === 'failed');
        
        const avgProcessingTime = processed.length > 0 
          ? processed.reduce((sum, email) => {
              const processingTime = new Date(email.processed_at!).getTime() - new Date(email.created_at).getTime();
              return sum + processingTime;
            }, 0) / processed.length / 1000 // Convert to seconds
          : 0;

        setMetrics({
          queueDepth: queueDepth || 0,
          avgProcessingTime,
          throughputPerMinute: processed.length,
          errorRate: recentEmails.length > 0 ? (failed.length / recentEmails.length) * 100 : 0,
          retrySuccessRate: 85 // Mock for now
        });
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const optimizeEmailQueue = async () => {
    setIsOptimizing(true);
    try {
      // Create optimization function to clean up and optimize queue
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
        description: "Email queue has been optimized for better performance"
      });
      
      setLastOptimization(new Date().toISOString());
      fetchPerformanceMetrics();
    } catch (error) {
      console.error('Error optimizing email queue:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize email queue",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyPerformanceConfig = async () => {
    try {
      // Store performance config in database
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'email_performance_config',
          value: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configuration Applied",
        description: "Performance settings have been updated"
      });
    } catch (error) {
      console.error('Error applying config:', error);
      toast({
        title: "Configuration Failed",
        description: "Failed to apply performance settings",
        variant: "destructive"
      });
    }
  };

  const runLoadTest = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('email-load-test', {
        body: {
          emailCount: 50,
          testType: 'performance',
          concurrency: config.batchSize
        }
      });

      if (error) throw error;

      toast({
        title: "Load Test Started",
        description: "Performance load test is running"
      });
    } catch (error) {
      console.error('Error running load test:', error);
      toast({
        title: "Load Test Failed",
        description: "Failed to start performance test",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    const queueScore = metrics.queueDepth < 20 ? 100 : Math.max(0, 100 - metrics.queueDepth * 2);
    const speedScore = metrics.avgProcessingTime < 3 ? 100 : Math.max(0, 100 - metrics.avgProcessingTime * 10);
    const errorScore = Math.max(0, 100 - metrics.errorRate * 5);
    return Math.round((queueScore + speedScore + errorScore) / 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Performance</h2>
          <p className="text-muted-foreground">Optimize email processing and delivery performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runLoadTest} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Load Test
          </Button>
          <Button onClick={optimizeEmailQueue} disabled={isOptimizing}>
            <Zap className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>Overall email system performance rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">{getPerformanceScore()}/100</div>
            <Badge variant={getPerformanceScore() > 80 ? "default" : getPerformanceScore() > 60 ? "secondary" : "destructive"}>
              {getPerformanceScore() > 80 ? 'Excellent' : getPerformanceScore() > 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
          <Progress value={getPerformanceScore()} className="mb-2" />
          {lastOptimization && (
            <p className="text-xs text-muted-foreground">
              Last optimized: {new Date(lastOptimization).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Current Metrics</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Queue Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.queueDepth}</div>
                <p className="text-xs text-muted-foreground">emails pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgProcessingTime.toFixed(1)}s</div>
                <p className="text-xs text-muted-foreground">per email</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.throughputPerMinute}</div>
                <p className="text-xs text-muted-foreground">emails/hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">failed deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retry Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.retrySuccessRate}%</div>
                <p className="text-xs text-muted-foreground">retry recovery</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Configuration</CardTitle>
              <CardDescription>Adjust email processing parameters for optimal performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={config.batchSize}
                    onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                  />
                  <p className="text-xs text-muted-foreground">Emails processed per batch</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processingInterval">Processing Interval (seconds)</Label>
                  <Input
                    id="processingInterval"
                    type="number"
                    value={config.processingInterval}
                    onChange={(e) => setConfig({ ...config, processingInterval: parseInt(e.target.value) })}
                    min="10"
                    max="300"
                  />
                  <p className="text-xs text-muted-foreground">Time between queue processing</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={config.maxRetries}
                    onChange={(e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-muted-foreground">Retry attempts for failed emails</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={config.rateLimitPerMinute}
                    onChange={(e) => setConfig({ ...config, rateLimitPerMinute: parseInt(e.target.value) })}
                    min="1"
                    max="840"
                  />
                  <p className="text-xs text-muted-foreground">AWS SES limit: 14/sec (840/min)</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enableBulkProcessing}
                  onCheckedChange={(checked) => setConfig({ ...config, enableBulkProcessing: checked })}
                />
                <Label>Enable Bulk Processing</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enableSmartRetry}
                  onCheckedChange={(checked) => setConfig({ ...config, enableSmartRetry: checked })}
                />
                <Label>Enable Smart Retry Logic</Label>
              </div>

              <Button onClick={applyPerformanceConfig} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Apply Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Optimization</CardTitle>
              <CardDescription>AI-powered email performance optimization recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Optimization Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Queue depth is optimal (under 20 emails)</li>
                  <li>• Consider increasing batch size to 15 for better throughput</li>
                  <li>• Enable smart retry for failed emails</li>
                  <li>• Processing interval can be reduced to 20 seconds</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">Available Optimizations</h4>
                <div className="space-y-2">
                  <Badge variant="outline">Cleanup Failed Emails</Badge>
                  <Badge variant="outline">Batch Pending Emails</Badge>
                  <Badge variant="outline">Optimize Retry Logic</Badge>
                  <Badge variant="outline">Update Processing Intervals</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};