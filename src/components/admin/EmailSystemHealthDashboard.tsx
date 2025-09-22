import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RealDataEmailTester } from './RealDataEmailTester';
import { EndToEndEmailTester } from './EndToEndEmailTester';
import { EmailMonitoringDashboard } from './EmailMonitoringDashboard';
import { EmailPerformanceOptimizer } from './EmailPerformanceOptimizer';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Mail, 
  Settings, 
  Activity,
  RefreshCw,
  Play,
  Database,
  Server
} from 'lucide-react';

interface EmailSystemHealth {
  smtpConnection: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    lastChecked?: string;
  };
  templateValidation: {
    total: number;
    valid: number;
    invalid: number;
    issues: any[];
  };
  queueStatus: {
    pending: number;
    failed: number;
    sent: number;
    processing: boolean;
  };
  eventDefinitions: {
    total: number;
    enabled: number;
    disabled: number;
  };
}

export const EmailSystemHealthDashboard = () => {
  const [health, setHealth] = useState<EmailSystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const { toast } = useToast();

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      console.log('🏥 Starting comprehensive email system health check...');

      const healthData: EmailSystemHealth = {
        smtpConnection: { status: 'error', message: 'Not tested' },
        templateValidation: { total: 0, valid: 0, invalid: 0, issues: [] },
        queueStatus: { pending: 0, failed: 0, sent: 0, processing: false },
        eventDefinitions: { total: 0, enabled: 0, disabled: 0 }
      };

      // 1. Test SMTP Connection
      try {
        console.log('Testing SMTP connection...');
        const { data: smtpResult, error: smtpError } = await supabase.functions.invoke('test-smtp-connection', {
          body: { sendTest: false }
        });

        if (smtpError || !smtpResult?.success) {
          healthData.smtpConnection = {
            status: 'error',
            message: smtpError?.message || smtpResult?.error || 'SMTP connection failed',
            lastChecked: new Date().toISOString()
          };
        } else {
          healthData.smtpConnection = {
            status: 'healthy',
            message: 'SMTP connection successful',
            lastChecked: new Date().toISOString()
          };
        }
      } catch (error) {
        healthData.smtpConnection = {
          status: 'error',
          message: 'Failed to test SMTP connection',
          lastChecked: new Date().toISOString()
        };
      }

      // 2. Validate Email Templates
      try {
        console.log('Validating email templates...');
        const { data: templateResult, error: templateError } = await supabase.functions.invoke('validate-email-templates');

        if (templateError || !templateResult?.success) {
          healthData.templateValidation = {
            total: 0,
            valid: 0,
            invalid: 0,
            issues: [`Template validation failed: ${templateError?.message || templateResult?.error}`]
          };
        } else {
          healthData.templateValidation = {
            total: templateResult.summary.total_templates,
            valid: templateResult.summary.valid_templates,
            invalid: templateResult.summary.invalid_templates,
            issues: templateResult.results.filter((r: any) => !r.is_valid)
          };
        }
      } catch (error) {
        healthData.templateValidation = {
          total: 0,
          valid: 0,
          invalid: 0,
          issues: ['Failed to validate templates']
        };
      }

      // 3. Check Email Queue Status
      try {
        console.log('Checking email queue status...');
        const { data: queueData, error: queueError } = await supabase
          .from('email_automation_queue')
          .select('status')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (queueError) {
          console.error('Queue check error:', queueError);
        } else {
          const statusCounts = queueData?.reduce((acc: any, email: any) => {
            acc[email.status] = (acc[email.status] || 0) + 1;
            return acc;
          }, {}) || {};

          healthData.queueStatus = {
            pending: statusCounts.pending || 0,
            failed: statusCounts.failed || 0,
            sent: statusCounts.sent || 0,
            processing: false
          };
        }
      } catch (error) {
        console.error('Error checking queue:', error);
      }

      // 4. Check Event Definitions
      try {
        console.log('Checking event definitions...');
        const { data: eventData, error: eventError } = await supabase
          .from('email_event_definitions')
          .select('event_key, is_enabled');

        if (eventError) {
          console.error('Event definitions error:', eventError);
        } else {
          const enabled = eventData?.filter(e => e.is_enabled).length || 0;
          healthData.eventDefinitions = {
            total: eventData?.length || 0,
            enabled,
            disabled: (eventData?.length || 0) - enabled
          };
        }
      } catch (error) {
        console.error('Error checking event definitions:', error);
      }

      setHealth(healthData);
      console.log('Health check complete:', healthData);

    } catch (error: any) {
      console.error('Health check failed:', error);
      toast({
        title: "❌ Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const autoFixIssues = async () => {
    if (!health) return;
    
    setAutoFixing(true);
    try {
      console.log('🔧 Starting auto-fix for email system issues...');
      let fixedIssues = 0;

      // Fix invalid templates
      if (health.templateValidation.invalid > 0) {
        const { data, error } = await supabase.functions.invoke('validate-email-templates?disable_invalid=true');
        
        if (!error && data?.success) {
          fixedIssues++;
          toast({
            title: "✅ Templates Fixed",
            description: `Disabled ${health.templateValidation.invalid} invalid templates`,
          });
        }
      }

      // Fix failed emails in queue
      if (health.queueStatus.failed > 0) {
        const { data, error } = await supabase.functions.invoke('fix-email-automation', {
          body: { action: 'fix_failed' }
        });
        
        if (!error && data?.success) {
          fixedIssues++;
          toast({
            title: "✅ Queue Fixed",
            description: `Reset ${health.queueStatus.failed} failed emails for retry`,
          });
        }
      }

      // Process pending emails
      if (health.queueStatus.pending > 0) {
        const { data, error } = await supabase.functions.invoke('process-email-queue');
        
        if (!error) {
          fixedIssues++;
          toast({
            title: "✅ Queue Processed",
            description: `Processed ${health.queueStatus.pending} pending emails`,
          });
        }
      }

      if (fixedIssues === 0) {
        toast({
          title: "ℹ️ No Issues to Fix",
          description: "System appears to be healthy or requires manual intervention",
        });
      } else {
        toast({
          title: "🎉 Auto-Fix Complete",
          description: `Fixed ${fixedIssues} issue(s). Running health check again...`,
        });
        // Re-run health check
        setTimeout(runHealthCheck, 2000);
      }

    } catch (error: any) {
      console.error('Auto-fix failed:', error);
      toast({
        title: "❌ Auto-Fix Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAutoFixing(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp-connection', {
        body: { sendTest: true }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Test email failed');
      }

      toast({
        title: "✅ Test Email Sent",
        description: "Check test@talentxcel.in for the test email",
      });
    } catch (error: any) {
      toast({
        title: "❌ Test Email Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary', 
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallHealthScore = health ? (
    (
      (health.smtpConnection.status === 'healthy' ? 25 : 0) +
      (health.templateValidation.valid > 0 ? 25 : 0) +
      (health.queueStatus.failed === 0 ? 25 : 0) +
      (health.eventDefinitions.enabled > 0 ? 25 : 0)
    )
  ) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Email System Health</h2>
          <p className="text-muted-foreground">Monitor and maintain your email automation system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runHealthCheck} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Health Check'}
          </Button>
          <Button onClick={autoFixIssues} disabled={!health || autoFixing} variant="default">
            <Settings className={`h-4 w-4 mr-2 ${autoFixing ? 'animate-spin' : ''}`} />
            {autoFixing ? 'Fixing...' : 'Auto Fix Issues'}
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Overall System Health
            </CardTitle>
            <CardDescription>
              Health score based on SMTP, templates, queue, and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={overallHealthScore} className="flex-1" />
              <span className="text-2xl font-bold">{overallHealthScore}%</span>
              {overallHealthScore === 100 ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : overallHealthScore >= 75 ? (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Health Checks */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="realdata">Real Data</TabsTrigger>
          <TabsTrigger value="e2e">E2E Test</TabsTrigger>
          <TabsTrigger value="monitoring">Monitor</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* SMTP Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMTP Connection</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {health && getStatusIcon(health.smtpConnection.status)}
                  {health && getStatusBadge(health.smtpConnection.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {health?.smtpConnection.message || 'Not tested'}
                </p>
              </CardContent>
            </Card>

            {/* Template Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {health?.templateValidation.valid || 0}/{health?.templateValidation.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valid templates
                </p>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Queue</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {health?.queueStatus.failed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed emails
                </p>
              </CardContent>
            </Card>

            {/* Event Definitions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Triggers</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {health?.eventDefinitions.enabled || 0}/{health?.eventDefinitions.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enabled triggers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={sendTestEmail} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration Test</CardTitle>
              <CardDescription>
                Test your AWS SES SMTP connection and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {health && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(health.smtpConnection.status)}
                    {health.smtpConnection.message}
                    {health.smtpConnection.lastChecked && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        Last checked: {new Date(health.smtpConnection.lastChecked).toLocaleTimeString()}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button onClick={sendTestEmail} variant="default">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
                <Button onClick={runHealthCheck} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Template Validation</CardTitle>
              <CardDescription>
                Validate HTML structure and placeholder usage in email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {health && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {health.templateValidation.valid}
                    </div>
                    <p className="text-sm text-muted-foreground">Valid Templates</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {health.templateValidation.invalid}
                    </div>
                    <p className="text-sm text-muted-foreground">Invalid Templates</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {health.templateValidation.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Templates</p>
                  </div>
                </div>
              )}

              {health && health.templateValidation.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Template Issues:</h4>
                  {health.templateValidation.issues.slice(0, 5).map((issue: any, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{issue.template_name}:</strong> {issue.issues.join(', ')}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Queue Status</CardTitle>
              <CardDescription>
                Monitor email processing queue and retry failed emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {health && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {health.queueStatus.pending}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {health.queueStatus.failed}
                    </div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {health.queueStatus.sent}
                    </div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => supabase.functions.invoke('process-email-queue')} 
                  variant="default"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Process Queue
                </Button>
                <Button 
                  onClick={() => supabase.functions.invoke('fix-email-automation', { body: { action: 'fix_failed' }})} 
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Failed
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realdata" className="space-y-4">
          <RealDataEmailTester />
        </TabsContent>

        <TabsContent value="e2e" className="space-y-4">
          <EndToEndEmailTester />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <EmailMonitoringDashboard />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <EmailPerformanceOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};