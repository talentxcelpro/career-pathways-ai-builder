
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Papa from 'papaparse';

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

interface UserRecord {
  email: string;
  full_name?: string;
  user_role?: 'job_seeker' | 'employer';
  password?: string;
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
      
      // Use Supabase client method instead of direct fetch
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: { test: true }
      });

      console.log('Connection test result:', { data, error });

      if (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('unhealthy');
        toast.error('Connection test failed. Please check the Edge Function deployment.');
        return false;
      }

      if (data?.success) {
        console.log('✅ Connection test successful:', data);
        setConnectionStatus('healthy');
        toast.success('Connection test successful!');
        return true;
      } else {
        console.error('Unexpected response:', data);
        setConnectionStatus('unhealthy');
        toast.error('Unexpected response from edge function');
        return false;
      }

    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus('unhealthy');
      toast.error('Connection test failed. Please check the Edge Function deployment.');
      return false;
    }
  };

  const parseCSV = (csvData: string): Promise<UserRecord[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV parsing results:', results);
          
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            reject(new Error(`CSV parsing failed: ${results.errors[0].message}`));
            return;
          }

          const users: UserRecord[] = results.data.map((row: any) => ({
            email: row.email || row.Email || '',
            full_name: row.full_name || row.name || row.Name || row.full_name || '',
            user_role: (row.user_role || row.role || 'job_seeker') as 'job_seeker' | 'employer',
            password: row.password || row.Password || undefined
          }));

          // Filter out rows with missing email
          const validUsers = users.filter(user => user.email && user.email.trim());
          
          if (validUsers.length === 0) {
            reject(new Error('No valid users found in CSV. Make sure email column is present and populated.'));
            return;
          }

          console.log(`Parsed ${validUsers.length} valid users from CSV`);
          resolve(validUsers);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
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

      // Parse CSV data first
      const users = await parseCSV(csvData);
      console.log('Parsed users:', users.length);

      // Validate parsed data
      if (!users || users.length === 0) {
        throw new Error('No valid users found in CSV data');
      }

      // Update progress with total count
      setProgress(prev => ({ ...prev, total: users.length }));

      // Use Supabase client method for better reliability and authentication
      console.log('Starting bulk import via Supabase client...');
      
      const { data, error } = await supabase.functions.invoke('bulk-csv-import', {
        body: {
          csvData: users, // Send parsed user array
          batchSize: options.batchSize || 50,
          maxConcurrent: options.maxConcurrent || 3,
          speed: options.speed || 'medium'
        }
      });

      console.log('Import response:', { data, error });

      if (error) {
        console.error('Import failed with error:', error);
        throw new Error(`Import failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('Import unsuccessful:', data);
        throw new Error(data?.error || 'Import failed - unknown error');
      }

      const result = data;
      console.log('Import completed successfully:', result);

      // Update final progress with the response data
      const finalProgress = result.progress || {};
      setProgress(prev => ({
        ...prev,
        total: finalProgress.total || users.length,
        processed: finalProgress.processed || 0,
        successful: finalProgress.successful || 0,
        failed: finalProgress.failed || 0,
        errors: finalProgress.errors || [],
        totalTime: finalProgress.totalTime || 0,
        usersPerSecond: finalProgress.usersPerSecond || 0,
        successRate: finalProgress.successRate || 0
      }));

      toast.success(`Import completed! ${finalProgress.successful || 0} users imported successfully.`);
      
      if (finalProgress.failed > 0) {
        toast.warning(`${finalProgress.failed} users failed to import. Check console for details.`);
        console.warn('Failed users:', finalProgress.errors);
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
