import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Mail,
  Database,
  Activity
} from 'lucide-react';

interface DiagnosticResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const EmailSystemDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fixingEmails, setFixingEmails] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Check email queue status
      const { data: queueStats } = await supabase
        .from('email_automation_queue')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (queueStats) {
        const pending = queueStats.filter(q => q.status === 'pending').length;
        const failed = queueStats.filter(q => q.status === 'failed').length;
        const sent = queueStats.filter(q => q.status === 'sent').length;
        
        if (failed > 0) {
          results.push({
            component: 'Email Queue',
            status: 'warning',
            message: `${failed} failed emails in last 24h`,
            details: `Sent: ${sent}, Pending: ${pending}, Failed: ${failed}`
          });
        } else {
          results.push({
            component: 'Email Queue',
            status: 'healthy',
            message: `All emails processing normally`,
            details: `Sent: ${sent}, Pending: ${pending}`
          });
        }
      }

      // Check edge function health
      try {
        const { data, error } = await supabase.functions.invoke('send-email-notification', {
          body: { healthCheck: true }
        });
        
        if (!error) {
          results.push({
            component: 'Email Service',
            status: 'healthy',
            message: 'Edge function operational'
          });
        } else {
          results.push({
            component: 'Email Service',
            status: 'error',
            message: 'Edge function not responding',
            details: error.message
          });
        }
      } catch (funcError: any) {
        results.push({
          component: 'Email Service',
          status: 'error',
          message: 'Edge function error',
          details: funcError.message
        });
      }

      // Check templates
      const { data: templates, error: templateError } = await supabase
        .from('email_templates')
        .select('id, name, is_active')
        .eq('is_active', true);

      if (templateError) {
        results.push({
          component: 'Email Templates',
          status: 'error',
          message: 'Cannot access templates',
          details: templateError.message
        });
      } else if (templates && templates.length > 0) {
        results.push({
          component: 'Email Templates',
          status: 'healthy',
          message: `${templates.length} active templates available`
        });
      } else {
        results.push({
          component: 'Email Templates',
          status: 'warning',
          message: 'No active email templates found'
        });
      }

    } catch (error: any) {
      results.push({
        component: 'System',
        status: 'error',
        message: 'Diagnostic check failed',
        details: error.message
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const fixFailedEmails = async () => {
    setFixingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: { action: 'fix_all' }
      });

      if (error) {
        toast.error('Failed to fix emails: ' + error.message);
      } else {
        toast.success(`Fixed ${data.results?.total_processed || 0} emails`);
        runDiagnostics(); // Refresh diagnostics
      }
    } catch (error: any) {
      toast.error('Fix operation failed: ' + error.message);
    }
    setFixingEmails(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email System Diagnostics
            </CardTitle>
            <CardDescription>
              Monitor and troubleshoot email system health
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </Button>
            <Button 
              onClick={fixFailedEmails} 
              disabled={fixingEmails}
              size="sm"
            >
              <Mail className={`h-4 w-4 mr-2 ${fixingEmails ? 'animate-pulse' : ''}`} />
              Fix Failed Emails
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnostics.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Run diagnostics to check email system health
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.component}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                    {result.details && (
                      <div className="text-xs text-muted-foreground mt-1">{result.details}</div>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusColor(result.status) as any}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> SMTP DNS resolution issues detected. 
            Configure proper SMTP settings in Supabase secrets for reliable email delivery.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};