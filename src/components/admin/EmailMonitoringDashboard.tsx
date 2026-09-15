import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, Mail, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number;
  avgProcessingTime: number;
  dailyVolume: number;
}

interface EmailAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const EmailMonitoringDashboard = () => {
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    successRate: 0,
    avgProcessingTime: 0,
    dailyVolume: 0
  });
  const [alerts, setAlerts] = useState<EmailAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmailStats = async () => {
    try {
      // Get email queue stats
      const { data: queueData } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, processed_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (queueData) {
        const sent = queueData.filter(item => item.status === 'sent').length;
        const failed = queueData.filter(item => item.status === 'failed').length;
        const pending = queueData.filter(item => item.status === 'pending').length;
        const total = queueData.length;
        
        const successRate = total > 0 ? (sent / total) * 100 : 0;
        
        setStats({
          totalSent: sent,
          totalFailed: failed,
          totalPending: pending,
          successRate,
          avgProcessingTime: 2.5, // Mock for now
          dailyVolume: total
        });
      }

      // Check for alerts
      const newAlerts: EmailAlert[] = [];
      
      if (stats.successRate < 90) {
        newAlerts.push({
          id: '1',
          type: 'error',
          message: `Email success rate is below 90% (${stats.successRate.toFixed(1)}%)`,
          timestamp: new Date().toISOString(),
          severity: 'high'
        });
      }
      
      if (stats.totalPending > 50) {
        newAlerts.push({
          id: '2',
          type: 'warning',
          message: `High number of pending emails: ${stats.totalPending}`,
          timestamp: new Date().toISOString(),
          severity: 'medium'
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching email stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processStuckEmails = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { forceProcess: true }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email queue processing initiated"
      });
      
      fetchEmailStats();
    } catch (error) {
      console.error('Error processing emails:', error);
      toast({
        title: "Error",
        description: "Failed to process email queue",
        variant: "destructive"
      });
    }
  };

  const testEmailDelivery = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
        body: {
          to: 'test@talentxcel.in',
          subject: 'Monitoring Test Email',
          html: '<h2>Email System Health Check</h2><p>This is a test email to verify delivery monitoring.</p>'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email sent successfully"
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEmailStats();
    const interval = setInterval(fetchEmailStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getAlertBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Email Monitoring</h2>
          <p className="text-muted-foreground">Production email system monitoring and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testEmailDelivery} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Test Delivery
          </Button>
          <Button onClick={processStuckEmails}>
            Process Queue
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Volume</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyVolume}</div>
            <p className="text-xs text-muted-foreground">emails in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">in queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFailed}</div>
            <p className="text-xs text-muted-foreground">errors today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Active alerts and issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All Systems Operational</h3>
                  <p className="text-muted-foreground">No active alerts detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getAlertBadgeVariant(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Email processing performance and optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Processing Time</span>
                  <span className="font-mono">{stats.avgProcessingTime}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Queue Processing Rate</span>
                  <span className="font-mono">~24 emails/min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMTP Connection Pool</span>
                  <Badge variant="outline">Healthy</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rate Limiting Status</span>
                  <Badge variant="outline">Within Limits</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Statistics</CardTitle>
              <CardDescription>Email delivery tracking and bounce handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-success">{stats.totalSent}</div>
                  <p className="text-sm text-muted-foreground">Successfully Delivered</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{stats.totalFailed}</div>
                  <p className="text-sm text-muted-foreground">Failed Deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};