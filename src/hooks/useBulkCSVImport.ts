
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  batchNumber: number;
  totalTime?: number;
  usersPerSecond?: number;
  successRate?: number;
}

export const useBulkCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'healthy' | 'unhealthy'>('unhealthy');
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
    batchNumber: 0
  });

  const testConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus('testing');
      console.log('Testing connection to bulk-csv-import function...');
      
      // Use direct fetch with hardcoded values since we know they work
      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;
      
      console.log('Function URL:', functionUrl);

      const testPayload = { isTest: true };
      console.log('Sending test payload:', testPayload);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(testPayload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Test response:', result);
      
      setConnectionStatus('healthy');
      console.log('✅ Connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus('unhealthy');
      return false;
    }
  };

  const importFromCSV = async (
    csvData: string,
    options: {
      batchSize?: number;
      maxConcurrent?: number;
      speed?: 'slow' | 'medium' | 'fast';
    } = {}
  ) => {
    try {
      setIsImporting(true);
      setIsPaused(false);
      
      // Reset progress
      setProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        batchNumber: 0
      });

      console.log('Starting CSV import with options:', options);
      console.log('CSV data length:', csvData.length);

      // Use direct fetch instead of supabase.functions.invoke
      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;

      const payload = {
        csvData,
        batchSize: options.batchSize || 50,
        maxConcurrent: options.maxConcurrent || 3,
        speed: options.speed || 'medium'
      };

      console.log('Sending import request to:', functionUrl);
      console.log('Payload:', { ...payload, csvData: `${csvData.substring(0, 100)}...` });

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify(payload)
      });

      console.log('Import response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Import response:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update final progress
      setProgress(prev => ({
        ...prev,
        total: result.total || prev.total,
        processed: result.processed || result.successful + result.failed,
        successful: result.successful || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
        totalTime: result.totalTime,
        usersPerSecond: result.usersPerSecond,
        successRate: result.successRate
      }));

      toast.success(`Import completed! ${result.successful} users imported successfully.`);
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} users failed to import. Check the progress details for more information.`);
      }

      return result;
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error.message}`);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const pauseImport = () => {
    setIsPaused(true);
    toast.info('Import paused');
  };

  const resumeImport = () => {
    setIsPaused(false);
    toast.info('Import resumed');
  };

  const cancelImport = () => {
    setIsImporting(false);
    setIsPaused(false);
    toast.info('Import cancelled');
  };

  return {
    isImporting,
    isPaused,
    progress,
    connectionStatus,
    testConnection,
    importFromCSV,
    pauseImport,
    resumeImport,
    cancelImport
  };
};
