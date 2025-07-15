import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BulkProcessingStatus {
  isProcessing: boolean;
  total: number;
  processed: number;
  failed: number;
  retrying: number;
  currentBatch: number;
  errors: string[];
}

interface BulkEmailProcessorProps {
  onStatsUpdate: () => void;
}

export const BulkEmailProcessor: React.FC<BulkEmailProcessorProps> = ({ onStatsUpdate }) => {
  const [status, setStatus] = useState<BulkProcessingStatus>({
    isProcessing: false,
    total: 0,
    processed: 0,
    failed: 0,
    retrying: 0,
    currentBatch: 0,
    errors: [],
  });

  const BATCH_SIZE = 10; // Process emails in batches
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const processEmailBatch = async (batchNumber: number, retryCount: number = 0): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`Processing batch ${batchNumber}, retry ${retryCount}`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );

      const requestPromise = supabase.functions.invoke('process-email-queue', {
        body: { 
          manual: true, 
          batch_size: BATCH_SIZE,
          batch_number: batchNumber 
        }
      });

      const { data, error } = await Promise.race([requestPromise, timeoutPromise]) as any;

      if (error) {
        throw new Error(error.message || 'Unknown Supabase error');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.error(`Batch ${batchNumber} failed (attempt ${retryCount + 1}):`, errorMessage);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return await processEmailBatch(batchNumber, retryCount + 1);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const processBulkEmails = async () => {
    try {
      setStatus(prev => ({ 
        ...prev, 
        isProcessing: true, 
        processed: 0, 
        failed: 0, 
        retrying: 0,
        errors: [] 
      }));

      // First, get the total count of pending emails
      const { data: pendingEmails, error: countError } = await supabase
        .from('email_automation_queue')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (countError) {
        throw new Error(`Failed to count pending emails: ${countError.message}`);
      }

      const totalPending = pendingEmails?.length || 0;
      
      if (totalPending === 0) {
        toast.info('No pending emails to process');
        setStatus(prev => ({ ...prev, isProcessing: false }));
        return;
      }

      setStatus(prev => ({ ...prev, total: totalPending }));
      
      const totalBatches = Math.ceil(totalPending / BATCH_SIZE);
      let totalProcessed = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      // Process emails in batches
      for (let batchNum = 1; batchNum <= totalBatches; batchNum++) {
        setStatus(prev => ({ ...prev, currentBatch: batchNum }));
        
        const result = await processEmailBatch(batchNum);
        
        if (result.success) {
          const batchProcessed = Math.min(BATCH_SIZE, totalPending - totalProcessed);
          totalProcessed += batchProcessed;
          setStatus(prev => ({ 
            ...prev, 
            processed: totalProcessed 
          }));
        } else {
          totalFailed += BATCH_SIZE;
          if (result.error) {
            allErrors.push(`Batch ${batchNum}: ${result.error}`);
          }
          setStatus(prev => ({ 
            ...prev, 
            failed: totalFailed,
            errors: allErrors 
          }));
        }

        // Small delay between batches to prevent overwhelming the system
        if (batchNum < totalBatches) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Final status update
      const finalMessage = totalFailed === 0 
        ? `✅ Successfully processed ${totalProcessed} emails`
        : `⚠️ Processed ${totalProcessed} emails, ${totalFailed} failed`;

      if (totalFailed === 0) {
        toast.success(finalMessage);
      } else {
        toast.warning(finalMessage);
      }

      // Refresh stats
      await onStatsUpdate();

    } catch (error: any) {
      console.error('Bulk processing error:', error);
      toast.error(`Bulk processing failed: ${error.message}`);
      setStatus(prev => ({ 
        ...prev, 
        errors: [...prev.errors, error.message] 
      }));
    } finally {
      setStatus(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const progress = status.total > 0 ? (status.processed / status.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Bulk Email Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={processBulkEmails}
            disabled={status.isProcessing}
            className="flex-1"
          >
            {status.isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Batch {status.currentBatch}...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Process All Pending Emails
              </>
            )}
          </Button>
        </div>

        {status.isProcessing && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{status.processed} / {status.total}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Processed: {status.processed}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">
                  Failed: {status.failed}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm">
                  Batch: {status.currentBatch}
                </span>
              </div>
            </div>
          </div>
        )}

        {status.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Processing Errors:</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
              {status.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 mb-1">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};