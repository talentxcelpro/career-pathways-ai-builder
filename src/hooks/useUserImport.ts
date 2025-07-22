
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImportProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentUser?: string;
  isRunning: boolean;
  connectionStatus?: 'testing' | 'healthy' | 'unhealthy';
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
}

interface UserImportData {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
}

export const useUserImport = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  });

  const [isPaused, setIsPaused] = useState(false);
  const [shouldCancel, setShouldCancel] = useState(false);

  const testConnectivity = async (): Promise<boolean> => {
    console.log('Testing connectivity for user import...');
    
    setProgress(prev => ({ 
      ...prev, 
      connectionStatus: 'testing' 
    }));

    try {
      // Test 1: Check authentication session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Authentication test failed:', sessionError);
        throw new Error('Authentication session invalid');
      }
      console.log('✓ Authentication session valid');

      // Test 2: Test database connectivity by querying profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profileError) {
        console.error('Database connectivity test failed:', profileError);
        throw new Error('Database connection failed');
      }
      console.log('✓ Database connectivity confirmed');

      setProgress(prev => ({ 
        ...prev, 
        connectionStatus: 'healthy' 
      }));

      console.log('Connectivity tests passed - admin operations will be tested during actual import');
      return true;

    } catch (error) {
      console.error('Connectivity test failed:', error);
      setProgress(prev => ({ 
        ...prev, 
        connectionStatus: 'unhealthy' 
      }));
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown connectivity error';
      toast.error(`Connectivity test failed: ${errorMessage}`);
      return false;
    }
  };

  const createUsersBatch = async (users: UserImportData[]): Promise<ImportResult> => {
    try {
      console.log(`Sending ${users.length} users to edge function for import`);
      
      const { data, error } = await supabase.functions.invoke('import-users', {
        body: { users }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Edge function call failed');
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('Edge function response:', data);
      return data as ImportResult;

    } catch (error) {
      console.error('Error calling import-users edge function:', error);
      throw error;
    }
  };

  const importUsers = async (
    users: UserImportData[],
    speed: 'fast' | 'medium' | 'slow' = 'medium'
  ): Promise<ImportResult> => {
    console.log(`Starting import of ${users.length} users with ${speed} speed`);
    
    // Test connectivity first
    const isConnected = await testConnectivity();
    if (!isConnected) {
      throw new Error('Connection test failed. Please check your internet connection and authentication.');
    }

    let errors: string[] = [];
    let successful = 0;
    let failed = 0;

    // Speed settings (delays between requests)
    const delays = {
      fast: 1000,   // 1 second
      medium: 3000, // 3 seconds  
      slow: 5000    // 5 seconds
    };

    setProgress({
      total: users.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true,
      connectionStatus: 'healthy'
    });

    setShouldCancel(false);
    setIsPaused(false);

    // Process users in batches via edge function
    try {
      const result = await createUsersBatch(users);
      successful = result.successful;
      failed = result.failed;
      errors = result.errors;

      // Update progress to show completion
      setProgress(prev => ({
        ...prev,
        completed: users.length,
        successful,
        failed
      }));

    } catch (error) {
      console.error('Import failed:', error);
      failed = users.length;
      errors = [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`];
      
      setProgress(prev => ({
        ...prev,
        completed: users.length,
        successful: 0,
        failed: users.length
      }));
    }

    setProgress(prev => ({
      ...prev,
      isRunning: false,
      currentUser: undefined
    }));

    const result = { successful, failed, errors };
    console.log('Import completed:', result);
    
    return result;
  };

  const pauseImport = () => {
    console.log('Pausing import...');
    setIsPaused(true);
  };

  const resumeImport = () => {
    console.log('Resuming import...');
    setIsPaused(false);
  };

  const cancelImport = () => {
    console.log('Cancelling import...');
    setShouldCancel(true);
    setIsPaused(false);
  };

  return {
    progress,
    isPaused,
    importUsers,
    testConnectivity,
    pauseImport,
    resumeImport,
    cancelImport
  };
};
