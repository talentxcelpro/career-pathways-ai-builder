import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Wrench,
  Play,
  RotateCcw
} from 'lucide-react';

interface FixResult {
  success: boolean;
  message: string;
  reset_count: number;
  processed: number;
  failed?: number;
  total_pending?: number;
  error?: string;
}

export const EmailAutomationFixer = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFixResult, setLastFixResult] = useState<FixResult | null>(null);

  const runEmailFix = async () => {
    setIsFixing(true);
    try {
      console.log('🔧 Starting email automation fix...');
      
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: { action: 'fix_all' }
      });

      if (error) {
        console.error('Fix error:', error);
        throw error;
      }

      console.log('Fix result:', data);
      setLastFixResult(data);

      if (data.success) {
        toast.success(`Email fix completed! Reset ${data.reset_count} failed emails, processed ${data.processed} emails.`);
      } else {
        toast.error(`Email fix failed: ${data.error}`);
      }

    } catch (error: any) {
      console.error('Error running email fix:', error);
      toast.error('Failed to run email fix: ' + error.message);
      setLastFixResult({
        success: false,
        message: 'Fix failed',
        reset_count: 0,
        processed: 0,
        error: error.message
      });
    } finally {
      setIsFixing(false);
    }
  };

  const processEmailQueue = async () => {
    setIsProcessing(true);
    try {
      console.log('📧 Processing email queue...');
      
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { manual_trigger: true }
      });

      if (error) {
        console.error('Process error:', error);
        throw error;
      }

      console.log('Process result:', data);
      
      if (data.processed > 0) {
        toast.success(`Processed ${data.processed} emails successfully!`);
      } else {
        toast.info('No emails to process');
      }

    } catch (error: any) {
      console.error('Error processing queue:', error);
      toast.error('Failed to process queue: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Email Automation Fixer
        </CardTitle>
        <CardDescription>
          Fix failed email automations and process pending emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset & Fix Failed Emails
            </h3>
            <p className="text-sm text-muted-foreground">
              Reset all failed emails to pending status and attempt to send them again using working SMTP configuration.
            </p>
            <Button
              onClick={runEmailFix}
              disabled={isFixing}
              className="w-full"
              variant="default"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Fix Failed Emails
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Play className="h-4 w-4" />
              Process Email Queue
            </h3>
            <p className="text-sm text-muted-foreground">
              Manually trigger the email queue processor to send pending emails immediately.
            </p>
            <Button
              onClick={processEmailQueue}
              disabled={isProcessing}
              className="w-full"
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Process Queue
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Last Fix Result */}
        {lastFixResult && (
          <div className="space-y-3">
            <h3 className="font-medium">Last Fix Result</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                {lastFixResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={lastFixResult.success ? 'default' : 'destructive'}>
                  {lastFixResult.success ? 'Success' : 'Failed'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm">{lastFixResult.message}</p>
              
              {lastFixResult.success && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{lastFixResult.reset_count}</p>
                    <p className="text-xs text-muted-foreground">Reset</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{lastFixResult.processed}</p>
                    <p className="text-xs text-muted-foreground">Processed</p>
                  </div>
                  {lastFixResult.failed !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{lastFixResult.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  )}
                  {lastFixResult.total_pending !== undefined && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{lastFixResult.total_pending}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  )}
                </div>
              )}
              
              {lastFixResult.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <strong>Error:</strong> {lastFixResult.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">How to fix email automation:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Fix Failed Emails" to reset and retry all failed emails</li>
            <li>Use "Process Queue" to manually trigger immediate email processing</li>
            <li>Check the dashboard stats to verify the fix worked</li>
            <li>Monitor the logs for any remaining issues</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};