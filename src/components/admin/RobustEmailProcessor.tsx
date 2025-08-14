import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  RefreshCw,
  Activity,
  Send,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProcessingStats {
  processed: number;
  failed: number;
  retrying: number;
  total: number;
}

interface EdgeFunctionHealth {
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
  lastChecked: Date;
}

export const RobustEmailProcessor: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [edgeHealth, setEdgeHealth] = useState<EdgeFunctionHealth | null>(null);
  const [processingMethod, setProcessingMethod] = useState<'auto' | 'database' | 'force'>('auto');

  const checkEdgeFunctionHealth = async (): Promise<EdgeFunctionHealth> => {
    try {
      const startTime = Date.now();
      
      // Simple health check with timeout
      const healthPromise = supabase.functions.invoke('process-email-queue', {
        body: { healthCheck: true }
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([healthPromise, timeoutPromise]) as any;
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return {
          isHealthy: false,
          error: error.message,
          responseTime,
          lastChecked: new Date()
        };
      }
      
      return {
        isHealthy: true,
        responseTime,
        lastChecked: new Date()
      };
      
    } catch (error: any) {
      return {
        isHealthy: false,
        error: error.message || 'Edge function unavailable',
        lastChecked: new Date()
      };
    }
  };

  const processEmailsWithDatabase = async (): Promise<ProcessingStats> => {
    try {
      // Get pending emails
      const { data: pendingEmails, error: fetchError } = await supabase
        .from('email_automation_queue')
        .select('*')
        .filter('status', 'eq', 'pending')
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;

      if (!pendingEmails || pendingEmails.length === 0) {
        return { processed: 0, failed: 0, retrying: 0, total: 0 };
      }

      const stats: ProcessingStats = {
        processed: 0,
        failed: 0,
        retrying: 0,
        total: pendingEmails.length
      };

      // Process emails one by one using the reliable send-automated-email function
      for (const email of pendingEmails) {
        try {
          // Call the reliable email function directly
          const { data, error } = await supabase.functions.invoke('send-automated-email', {
            body: {
              to: (email as any)?.recipient_email,
              triggerType: (email as any)?.trigger_type,
              templateData: (email as any)?.template_data || {},
              recipientName: (email as any)?.recipient_name || 'User'
            }
          });

          if (error) {
            throw error;
          }

          // Mark as sent
          await supabase
            .from('email_automation_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              attempts: ((email as any)?.attempts || 0) + 1
            } as any)
            .eq('id', (email as any)?.id);

          stats.processed++;

        } catch (emailError: any) {
          console.error(`Failed to process email ${(email as any)?.id}:`, emailError);
          
          const newAttempts = ((email as any)?.attempts || 0) + 1;
          const shouldRetry = newAttempts < 3;
          
          await supabase
            .from('email_automation_queue')
            .update({
              status: shouldRetry ? 'pending' : 'failed',
              attempts: newAttempts,
              error_message: emailError.message,
              next_retry_at: shouldRetry ? new Date(Date.now() + (newAttempts * 60000)).toISOString() : null
            } as any)
            .eq('id', (email as any)?.id);

          if (shouldRetry) {
            stats.retrying++;
          } else {
            stats.failed++;
          }
        }

        // Update progress
        setProcessingStats({ ...stats });
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return stats;

    } catch (error: any) {
      console.error('Database processing error:', error);
      throw error;
    }
  };

  const processEmailsWithEdgeFunction = async (): Promise<ProcessingStats> => {
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { manual: true, batchSize: 50 }
      });

      if (error) throw error;

      return {
        processed: data?.processed || 0,
        failed: data?.failed || 0,
        retrying: data?.retrying || 0,
        total: (data?.processed || 0) + (data?.failed || 0) + (data?.retrying || 0)
      };

    } catch (error: any) {
      console.error('Edge function processing error:', error);
      throw error;
    }
  };

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      setProcessingStats(null);

      let stats: ProcessingStats;
      let method = processingMethod;

      // Auto method: check edge function health first
      if (method === 'auto') {
        toast({
          title: "Checking system health...",
          description: "Determining the best processing method"
        });

        const health = await checkEdgeFunctionHealth();
        setEdgeHealth(health);

        method = health.isHealthy ? 'force' : 'database';
        
        toast({
          title: health.isHealthy ? "Using Edge Function" : "Using Database Fallback",
          description: health.isHealthy 
            ? `Edge function responding in ${health.responseTime}ms`
            : `Edge function unavailable: ${health.error}`
        });
      }

      // Process emails based on chosen method
      if (method === 'database') {
        toast({
          title: "Processing with Database Method",
          description: "Using direct database processing for maximum reliability"
        });
        stats = await processEmailsWithDatabase();
      } else {
        toast({
          title: "Processing with Edge Function",
          description: "Using the process-email-queue function"
        });
        stats = await processEmailsWithEdgeFunction();
      }

      setProcessingStats(stats);

      // Show results
      if (stats.total === 0) {
        toast({
          title: "No emails to process",
          description: "Email queue is empty"
        });
      } else if (stats.failed === 0) {
        toast({
          title: "Email processing completed successfully!",
          description: `Processed ${stats.processed} emails${stats.retrying > 0 ? `, ${stats.retrying} will retry later` : ''}`
        });
      } else {
        toast({
          title: "Email processing completed with issues",
          description: `${stats.processed} sent, ${stats.failed} failed, ${stats.retrying} retrying`,
          variant: "destructive"
        });
      }

      // Refresh parent component
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }

    } catch (error: any) {
      console.error('Email processing error:', error);
      toast({
        title: "Email processing failed",
        description: error.message || 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodBadge = (method: string) => {
    const configs = {
      auto: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap },
      database: { color: 'text-green-600', bg: 'bg-green-50', icon: Database },
      force: { color: 'text-orange-600', bg: 'bg-orange-50', icon: Send }
    };
    
    const config = configs[method as keyof typeof configs];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.bg} ${config.color} border-current`}>
        <Icon className="w-3 h-3 mr-1" />
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Robust Email Processor
        </CardTitle>
        <CardDescription>
          Intelligent email processing with health checks and fallback options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Edge Function Health Status */}
        {edgeHealth && (
          <Alert className={edgeHealth.isHealthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  <strong>Edge Function Status:</strong> 
                  {edgeHealth.isHealthy ? (
                    <span className="text-green-700 ml-2">
                      ✅ Healthy ({edgeHealth.responseTime}ms)
                    </span>
                  ) : (
                    <span className="text-red-700 ml-2">
                      ❌ Unavailable - {edgeHealth.error}
                    </span>
                  )}
                </span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {edgeHealth.lastChecked.toLocaleTimeString()}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Processing Method Selection */}
        <div className="grid grid-cols-3 gap-2">
          {(['auto', 'database', 'force'] as const).map((method) => (
            <Button
              key={method}
              variant={processingMethod === method ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProcessingMethod(method)}
              disabled={isProcessing}
              className="h-auto p-3 flex flex-col items-center gap-1"
            >
              {getMethodBadge(method)}
              <span className="text-xs">
                {method === 'auto' && 'Smart Choice'}
                {method === 'database' && 'Database Direct'}
                {method === 'force' && 'Edge Function'}
              </span>
            </Button>
          ))}
        </div>

        {/* Processing Button */}
        <Button 
          onClick={processEmails}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Emails...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Process Email Queue
            </>
          )}
        </Button>

        {/* Processing Progress */}
        {isProcessing && processingStats && (
          <div className="space-y-2">
            <Progress value={(processingStats.processed + processingStats.failed) / processingStats.total * 100} />
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="text-green-600">
                ✅ Sent: {processingStats.processed}
              </div>
              <div className="text-yellow-600">
                🔄 Retrying: {processingStats.retrying}
              </div>
              <div className="text-red-600">
                ❌ Failed: {processingStats.failed}
              </div>
            </div>
          </div>
        )}

        {/* Final Results */}
        {!isProcessing && processingStats && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Processing Complete:</strong> {processingStats.processed} emails sent successfully
              {processingStats.retrying > 0 && `, ${processingStats.retrying} will retry later`}
              {processingStats.failed > 0 && `, ${processingStats.failed} failed permanently`}
            </AlertDescription>
          </Alert>
        )}

        {/* Method Descriptions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>Auto:</strong> Checks edge function health, uses best available method</div>
          <div><strong>Database:</strong> Direct processing via database, slower but most reliable</div>
          <div><strong>Force:</strong> Uses edge function even if health check fails</div>
        </div>
      </CardContent>
    </Card>
  );
};