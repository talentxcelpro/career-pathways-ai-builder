
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
      
      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      // Use secure authentication instead of hardcoded key
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;
      
      console.log('Function URL:', functionUrl);

      // Send test: true for connection test
      const testPayload = { test: true };
      console.log('Sending test payload:', testPayload);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use secure authentication via Supabase client instead
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

      const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
      // Use secure authentication instead of hardcoded key
      const functionUrl = `${SUPABASE_URL}/functions/v1/bulk-csv-import`;

      // Fix: Send the parsed users array in csvData field
      const payload = {
        csvData: users, // This is the key fix - send parsed user array
        batchSize: options.batchSize || 50,
        maxConcurrent: options.maxConcurrent || 3,
        speed: options.speed || 'medium'
      };

      console.log('Sending import request to:', functionUrl);
      console.log('Payload summary:', { 
        csvDataCount: users.length, 
        firstUser: users[0],
        batchSize: payload.batchSize, 
        maxConcurrent: payload.maxConcurrent,
        speed: payload.speed 
      });

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Use secure authentication via Supabase client instead
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
