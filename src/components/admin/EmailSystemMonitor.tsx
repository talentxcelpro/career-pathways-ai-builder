import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Mail, Server, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailMetrics {
  total24h: number;
  sent: number;
  pending: number;
  failed: number;
  processing: number;
  successRate: number;
  avgProcessingTime: number;
  queueBacklog: number;
  regionStatus: {
    primary: string;
    fallback: string;
    activeRegion: string;
  };
}

interface QueueItem {
  id: string;
  trigger_type: string;
  recipient_email: string;
  status: string;
  scheduled_at: string;
  created_at: string;
  attempts: number;
  error_message?: string;
}

export default function EmailSystemMonitor() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const { toast } = useToast();

  const fetchEmailMetrics = async () => {
    try {
      // Get email statistics for last 24 hours
      const { data: emailStats } = await supabase
        .from('email_automation_queue')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (emailStats) {
        const total24h = emailStats.length;
        const sent = emailStats.filter(e => e.status === 'sent').length;
        const pending = emailStats.filter(e => e.status === 'pending').length;
        const failed = emailStats.filter(e => e.status === 'failed').length;
        const processing = emailStats.filter(e => e.status === 'processing').length;
        
        const sentEmails = emailStats.filter(e => e.status === 'sent' && e.processed_at);
        const avgProcessingTime = sentEmails.length > 0 
          ? sentEmails.reduce((sum, email) => {
              const created = new Date(email.created_at).getTime();
              const processed = new Date(email.processed_at).getTime();
              return sum + (processed - created);
            }, 0) / sentEmails.length / 1000 / 60 // Convert to minutes
          : 0;

        // Count backlog (emails pending for more than 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const queueBacklog = emailStats.filter(e => 
          e.status === 'pending' && new Date(e.created_at) < thirtyMinutesAgo
        ).length;

        setMetrics({
          total24h,
          sent,
          pending,
          failed,
          processing,
          successRate: total24h > 0 ? (sent / total24h) * 100 : 0,
          avgProcessingTime,
          queueBacklog,
          regionStatus: {
            primary: 'us-east-1',
            fallback: 'eu-west-1',
            activeRegion: 'us-east-1' // This would come from system monitoring
          }
        });

        // Get recent queue items for detailed view
        setQueueItems(emailStats.slice(0, 20) as QueueItem[]);
      }
    } catch (error) {
      console.error('Failed to fetch email metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email system metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeEmailQueue = async () => {
    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-email-queue', {
        body: {
          config: {
            maxRetries: 3,
            batchSize: 50,
            processingInterval: 30
          },
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
        title: "Success",
        description: `Email queue optimized successfully. ${data?.optimizationsApplied || 0} optimizations applied.`,
      });

      // Refresh metrics after optimization
      await fetchEmailMetrics();
    } catch (error: any) {
      console.error('Failed to optimize email queue:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to optimize email queue",
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const runSystemOptimizer = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('system-optimizer', {
        body: { action: 'optimize_all' }
      });

      if (error) throw error;

      toast({
        title: "System Optimization Complete",
        description: `Saved ${data?.summary?.total_savings_mb || 0}MB, optimized ${data?.results?.length || 0} components`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to run system optimizer",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEmailMetrics();
    const interval = setInterval(fetchEmailMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthStatus = () => {
    if (!metrics) return { status: 'unknown', color: 'gray', icon: Clock };
    
    if (metrics.successRate > 95 && metrics.queueBacklog < 10) {
      return { status: 'Excellent', color: 'green', icon: CheckCircle };
    } else if (metrics.successRate > 85 && metrics.queueBacklog < 50) {
      return { status: 'Good', color: 'blue', icon: CheckCircle };
    } else if (metrics.successRate > 70 && metrics.queueBacklog < 100) {
      return { status: 'Warning', color: 'yellow', icon: AlertTriangle };
    } else {
      return { status: 'Critical', color: 'red', icon: XCircle };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Email System Monitor</h2>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email System Monitor</h2>
          <div className="flex items-center space-x-2 mt-1">
            <HealthIcon className={`h-4 w-4 text-${healthStatus.color}-600`} />
            <span className={`text-sm font-medium text-${healthStatus.color}-600`}>
              System Status: {healthStatus.status}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={optimizeEmailQueue} disabled={optimizing} variant="outline">
            {optimizing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            Optimize Queue
          </Button>
          <Button onClick={runSystemOptimizer} variant="outline">
            <Server className="h-4 w-4 mr-2" />
            System Optimizer
          </Button>
          <Button onClick={fetchEmailMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics.queueBacklog > 100 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High queue backlog detected: {metrics.queueBacklog} emails pending for over 30 minutes. 
            Consider running queue optimization.
          </AlertDescription>
        </Alert>
      )}

      {metrics.successRate < 50 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Critical: Email success rate is below 50%. Check AWS SES configuration and quotas.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.sent} of {metrics.total24h} emails sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Backlog</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queueBacklog}</div>
             <p className="text-xs text-muted-foreground">
               Emails pending &gt; 30min
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgProcessingTime.toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Region</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.regionStatus.activeRegion}</div>
            <p className="text-xs text-muted-foreground">
              Primary: {metrics.regionStatus.primary}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Queue Status</TabsTrigger>
          <TabsTrigger value="recent">Recent Emails</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.sent}</div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.processing}</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Queue Items</CardTitle>
              <CardDescription>Last 20 email processing entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-sm">{item.trigger_type}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        To: {item.recipient_email}
                      </div>
                      {item.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {item.error_message}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{new Date(item.created_at).toLocaleTimeString()}</div>
                      {item.attempts > 1 && (
                        <div className="text-xs">Attempts: {item.attempts}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AWS SES Configuration</CardTitle>
                <CardDescription>Regional setup and fallbacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Primary Region</span>
                    <Badge variant="outline">{metrics.regionStatus.primary}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallback Region</span>
                    <Badge variant="outline">{metrics.regionStatus.fallback}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently Active</span>
                    <Badge variant="default">{metrics.regionStatus.activeRegion}</Badge>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Monitor your AWS SES statistics in the <strong>{metrics.regionStatus.activeRegion}</strong> region 
                    for accurate email delivery metrics.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Recommendations</CardTitle>
                <CardDescription>Optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {metrics.queueBacklog > 50 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">High Queue Backlog</div>
                        <div className="text-muted-foreground">Consider running queue optimization</div>
                      </div>
                    </div>
                  )}
                  {metrics.successRate < 90 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Low Success Rate</div>
                        <div className="text-muted-foreground">Check AWS SES configuration and limits</div>
                      </div>
                    </div>
                  )}
                  {metrics.avgProcessingTime > 10 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Slow Processing</div>
                        <div className="text-muted-foreground">Email processing is taking longer than expected</div>
                      </div>
                    </div>
                  )}
                  {metrics.successRate > 95 && metrics.queueBacklog < 10 && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">System Healthy</div>
                        <div className="text-muted-foreground">Email system is operating optimally</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}