import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Activity, Database, Mail, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemHealthData {
  email: {
    total24h: number;
    sent: number;
    pending: number;
    failed: number;
    successRate: number;
    queueHealth: 'good' | 'warning' | 'critical';
  };
  database: {
    connections: number;
    avgResponseTime: number;
    errorRate: number;
    status: 'healthy' | 'degraded' | 'down';
  };
  edgeFunctions: {
    total: number;
    healthy: number;
    errors: number;
    avgResponseTime: number;
  };
  aws: {
    region: string;
    quotaUsed: number;
    quotaRemaining: number;
    dailyLimit: number;
    status: 'active' | 'warning' | 'limited';
  };
}

export default function SystemHealthDashboard() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchHealthData = async () => {
    try {
      // Fetch email system health
      const { data: emailStats } = await supabase
        .from('email_automation_queue')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const emailData = emailStats || [];
      const emailHealth = {
        total24h: emailData.length,
        sent: emailData.filter(e => e.status === 'sent').length,
        pending: emailData.filter(e => e.status === 'pending').length,
        failed: emailData.filter(e => e.status === 'failed').length,
        successRate: emailData.length ? (emailData.filter(e => e.status === 'sent').length / emailData.length) * 100 : 0,
        queueHealth: 'good' as const
      };

      if (emailHealth.pending > 100) emailHealth.queueHealth = 'warning' as const;
      if (emailHealth.pending > 500 || emailHealth.successRate < 50) emailHealth.queueHealth = 'critical' as const;

      // Fetch function health logs
      const { data: functionLogs } = await supabase
        .from('function_health_logs')
        .select('status, response_time_ms, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const functionHealth = {
        total: functionLogs?.length || 0,
        healthy: functionLogs?.filter(f => f.status === 'success').length || 0,
        errors: functionLogs?.filter(f => f.status === 'error').length || 0,
        avgResponseTime: functionLogs?.length ? 
          functionLogs.reduce((sum, f) => sum + (f.response_time_ms || 0), 0) / functionLogs.length : 0
      };

      // Mock AWS data (in production, this would come from AWS API)
      const awsHealth = {
        region: 'us-east-1',
        quotaUsed: 16,
        quotaRemaining: 49984,
        dailyLimit: 50000,
        status: 'active' as const
      };

      // Mock database health (in production, this would come from monitoring)
      const dbHealth = {
        connections: 12,
        avgResponseTime: 45,
        errorRate: 0.2,
        status: 'healthy' as const
      };

      setHealthData({
        email: emailHealth,
        database: dbHealth,
        edgeFunctions: functionHealth,
        aws: awsHealth
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system health data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'active':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'down':
      case 'limited':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'down':
      case 'limited':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <Button onClick={fetchHealthData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email System</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(healthData.email.queueHealth)}
              <span className={`text-sm font-medium ${getStatusColor(healthData.email.queueHealth)}`}>
                {healthData.email.queueHealth.toUpperCase()}
              </span>
            </div>
            <div className="text-2xl font-bold">{healthData.email.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {healthData.email.sent}/{healthData.email.total24h} emails sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(healthData.database.status)}
              <span className={`text-sm font-medium ${getStatusColor(healthData.database.status)}`}>
                {healthData.database.status.toUpperCase()}
              </span>
            </div>
            <div className="text-2xl font-bold">{healthData.database.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {healthData.database.connections} active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(healthData.edgeFunctions.errors > 10 ? 'warning' : 'healthy')}
              <span className={`text-sm font-medium ${getStatusColor(healthData.edgeFunctions.errors > 10 ? 'warning' : 'healthy')}`}>
                {healthData.edgeFunctions.errors > 10 ? 'WARNING' : 'HEALTHY'}
              </span>
            </div>
            <div className="text-2xl font-bold">{healthData.edgeFunctions.avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              {healthData.edgeFunctions.errors} errors in 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AWS SES</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(healthData.aws.status)}
              <span className={`text-sm font-medium ${getStatusColor(healthData.aws.status)}`}>
                {healthData.aws.status.toUpperCase()}
              </span>
            </div>
            <div className="text-2xl font-bold">{((healthData.aws.quotaUsed / healthData.aws.dailyLimit) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {healthData.aws.quotaRemaining.toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email System</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="aws">AWS Status</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Queue Status</CardTitle>
                <CardDescription>24-hour email processing summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <Badge variant={healthData.email.successRate > 90 ? "default" : "destructive"}>
                    {healthData.email.successRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={healthData.email.successRate} className="h-2" />
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-600">{healthData.email.sent}</div>
                    <div className="text-muted-foreground">Sent</div>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-600">{healthData.email.pending}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">{healthData.email.failed}</div>
                    <div className="text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {healthData.email.queueHealth === 'critical' && (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-600">Critical Issues Detected</div>
                        <div className="text-muted-foreground">High failure rate or queue backlog</div>
                      </div>
                    </div>
                  )}
                  {healthData.email.queueHealth === 'warning' && (
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-600">Queue Performance Issues</div>
                        <div className="text-muted-foreground">Monitor queue processing</div>
                      </div>
                    </div>
                  )}
                  {healthData.email.queueHealth === 'good' && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-600">Email System Healthy</div>
                        <div className="text-muted-foreground">All systems operating normally</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Functions Performance</CardTitle>
              <CardDescription>24-hour function execution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthData.edgeFunctions.total}</div>
                  <div className="text-sm text-muted-foreground">Total Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{healthData.edgeFunctions.healthy}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{healthData.edgeFunctions.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthData.edgeFunctions.avgResponseTime.toFixed(0)}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aws" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AWS SES Quota</CardTitle>
                <CardDescription>Daily sending limits and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Daily Usage</span>
                  <span className="font-medium">
                    {healthData.aws.quotaUsed.toLocaleString()} / {healthData.aws.dailyLimit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(healthData.aws.quotaUsed / healthData.aws.dailyLimit) * 100} 
                  className="h-2" 
                />
                <div className="text-sm text-muted-foreground">
                  {healthData.aws.quotaRemaining.toLocaleString()} emails remaining today
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Region Configuration</CardTitle>
                <CardDescription>AWS SES regional settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Primary Region</span>
                    <Badge variant="outline">{healthData.aws.region}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant={healthData.aws.status === 'active' ? 'default' : 'destructive'}>
                      {healthData.aws.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monitor your AWS SES console in the {healthData.aws.region} region for accurate statistics.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}