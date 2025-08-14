import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Server, 
  Database, 
  Mail, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime?: number;
  message: string;
  lastChecked: Date;
  details?: any;
}

export const EmailSystemHealthMonitor: React.FC = () => {
  const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  const checkEdgeFunctionHealth = async (): Promise<HealthStatus> => {
    const maxRetries = 3;
    const timeout = 15000; // 15 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const { data, error } = await supabase.functions.invoke('process-email-queue', {
          body: { healthCheck: true }
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (error) {
          // Check if this is a timeout/network error vs function error
          if (error.message.includes('Failed to send a request') || 
              error.message.includes('timeout') ||
              error.message.includes('network')) {
            
            if (attempt < maxRetries) {
              console.log(`Edge function health check attempt ${attempt} failed, retrying...`);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Exponential backoff
              continue;
            }
            
            return {
              component: 'Edge Function',
              status: 'warning',
              responseTime,
              message: `Network timeout after ${maxRetries} attempts (${responseTime}ms)`,
              lastChecked: new Date(),
              details: { error, attempt }
            };
          }
          
          return {
            component: 'Edge Function',
            status: 'error',
            responseTime,
            message: `Edge function error: ${error.message}`,
            lastChecked: new Date(),
            details: error
          };
        }
        
        return {
          component: 'Edge Function',
          status: responseTime > 8000 ? 'warning' : 'healthy',
          responseTime,
          message: responseTime > 8000 
            ? `Slow response: ${responseTime}ms (but functional)` 
            : `Responding normally: ${responseTime}ms`,
          lastChecked: new Date(),
          details: data
        };
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          if (attempt < maxRetries) {
            console.log(`Edge function health check timed out on attempt ${attempt}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          
          return {
            component: 'Edge Function',
            status: 'warning',
            message: `Function timeout after ${timeout/1000}s (${maxRetries} attempts)`,
            lastChecked: new Date(),
            details: { error: 'timeout', attempts: maxRetries }
          };
        }
        
        if (attempt < maxRetries) {
          console.log(`Edge function health check attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        return {
          component: 'Edge Function',
          status: 'error',
          message: `Unavailable: ${error.message}`,
          lastChecked: new Date(),
          details: error
        };
      }
    }
    
    // Fallback (should never reach here)
    return {
      component: 'Edge Function',
      status: 'error',
      message: 'Unexpected error in health check',
      lastChecked: new Date(),
      details: null
    };
  };

  const checkDatabaseHealth = async (): Promise<HealthStatus> => {
    try {
      const startTime = Date.now();
      
      // Check queue table access
      const { data: queueData, error: queueError, count: queueCount } = await supabase
        .from('email_automation_queue')
        .select('id', { count: 'exact' })
        .limit(1);

      // Check events table access  
      const { data: eventsData, error: eventsError, count: eventsCount } = await supabase
        .from('email_delivery_events')
        .select('id', { count: 'exact' })
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (queueError || eventsError) {
        return {
          component: 'Database',
          status: 'error',
          responseTime,
          message: `Database access error: ${queueError?.message || eventsError?.message}`,
          lastChecked: new Date(),
          details: { queueError, eventsError }
        };
      }

      return {
        component: 'Database',
        status: responseTime > 2000 ? 'warning' : 'healthy',
        responseTime,
        message: responseTime > 2000 
          ? `Slow query: ${responseTime}ms` 
          : `Database responding: ${responseTime}ms`,
        lastChecked: new Date(),
        details: { queueCount, eventsCount }
      };

    } catch (error: any) {
      return {
        component: 'Database',
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        lastChecked: new Date(),
        details: error
      };
    }
  };

  const checkEmailQueues = async (): Promise<HealthStatus> => {
    try {
      const startTime = Date.now();
      
      // Check pending emails
      const { data: pendingEmails, error: pendingError } = await supabase
        .from('email_automation_queue')
        .select('*')
        .eq('status', 'pending' as any)
        .limit(100);

      // Check failed emails  
      const { data: failedEmails, error: failedError } = await supabase
        .from('email_automation_queue')
        .select('*')
        .eq('status', 'failed' as any)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const responseTime = Date.now() - startTime;

      if (pendingError || failedError) {
        return {
          component: 'Email Queues',
          status: 'error',
          responseTime,
          message: `Queue check failed: ${pendingError?.message || failedError?.message}`,
          lastChecked: new Date(),
          details: { pendingError, failedError }
        };
      }

      const pendingCount = pendingEmails?.length || 0;
      const failedCount = failedEmails?.length || 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let message = `${pendingCount} pending, ${failedCount} failed today`;

      if (failedCount > 10) {
        status = 'error';
        message = `High failure rate: ${failedCount} failed emails today`;
      } else if (pendingCount > 50 || failedCount > 5) {
        status = 'warning';
        message = `${pendingCount} pending emails, ${failedCount} failed today`;
      }

      return {
        component: 'Email Queues',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: { pendingCount, failedCount }
      };

    } catch (error: any) {
      return {
        component: 'Email Queues',
        status: 'error',
        message: `Queue analysis failed: ${error.message}`,
        lastChecked: new Date(),
        details: error
      };
    }
  };

  const runHealthChecks = async () => {
    setIsChecking(true);
    
    try {
      toast({
        title: "Running health checks...",
        description: "Checking all email system components"
      });

      const [edgeHealth, dbHealth, queueHealth] = await Promise.all([
        checkEdgeFunctionHealth(),
        checkDatabaseHealth(),
        checkEmailQueues()
      ]);

      const statuses = [edgeHealth, dbHealth, queueHealth];
      setHealthStatuses(statuses);

      // Determine overall health
      const hasError = statuses.some(s => s.status === 'error');
      const hasWarning = statuses.some(s => s.status === 'warning');
      
      const overall = hasError ? 'error' : hasWarning ? 'warning' : 'healthy';
      setOverallHealth(overall);

      toast({
        title: "Health check completed",
        description: `System status: ${overall}`,
        variant: overall === 'error' ? 'destructive' : 'default'
      });

    } catch (error: any) {
      console.error('Health check error:', error);
      toast({
        title: "Health check failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      warning: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      error: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.error;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'Edge Function': return <Server className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Email Queues': return <Mail className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Auto-run health checks on mount
  useEffect(() => {
    runHealthChecks();
  }, []);

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Email System Health Monitor
        </CardTitle>
        <CardDescription>
          Real-time monitoring of email processing components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Overall Health Status */}
        <Alert className={
          overallHealth === 'healthy' ? 'border-green-200 bg-green-50' :
          overallHealth === 'warning' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>System Status:</strong> 
                <span className="ml-2">
                  {getStatusIcon(overallHealth)}
                </span>
              </span>
              {getStatusBadge(overallHealth)}
            </div>
          </AlertDescription>
        </Alert>

        {/* Refresh Button */}
        <Button 
          onClick={runHealthChecks}
          disabled={isChecking}
          variant="outline"
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Run Health Checks
            </>
          )}
        </Button>

        {/* Component Status Details */}
        {healthStatuses.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Component Status</h4>
            {healthStatuses.map((status, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  {getComponentIcon(status.component)}
                  <div>
                    <div className="font-medium text-sm">{status.component}</div>
                    <div className="text-xs text-muted-foreground">{status.message}</div>
                    {status.responseTime && (
                      <div className="text-xs text-muted-foreground">
                        Response: {status.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(status.status)}
                  <div className="text-xs text-muted-foreground">
                    {status.lastChecked.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Healthy:</strong> All systems operational</div>
          <div><strong>Warning:</strong> Performance issues or elevated queue sizes</div>
          <div><strong>Error:</strong> Component failures or connection issues</div>
        </div>
      </CardContent>
    </Card>
  );
};