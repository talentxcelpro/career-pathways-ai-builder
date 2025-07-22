
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
  processedBatches?: number;
  totalBatches?: number;
  processingTimeMs?: number;
  usersPerSecond?: number;
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: string[];
  processedBatches?: number;
  totalBatches?: number;
  processingTimeMs?: number;
  usersPerSecond?: number;
}

interface UserImportData {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
}

interface BatchConfig {
  batchSize: number;
  maxConcurrency: number;
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
    console.log('=== Starting Connectivity Test ===');
    
    setProgress(prev => ({ 
      ...prev, 
      connectionStatus: 'testing' 
    }));

    try {
      // Test 1: Check authentication session
      console.log('Testing authentication session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Authentication test failed:', sessionError);
        throw new Error('Authentication session invalid');
      }
      console.log('✓ Authentication session valid, user:', session.user?.email);

      // Test 2: Test database connectivity
      console.log('Testing database connectivity...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profileError) {
        console.error('Database connectivity test failed:', profileError);
        throw new Error('Database connection failed');
      }
      console.log('✓ Database connectivity confirmed');

      // Test 3: Try to reach the edge function
      console.log('Testing edge function connectivity...');
      const { error: functionError } = await supabase.functions.invoke('import-users', {
        body: { users: [] } // Empty test call
      });

      // Log the function test result
      if (functionError) {
        console.warn('Edge function test returned error:', functionError);
        // Don't fail here as this might be expected for empty users array
      } else {
        console.log('✓ Edge function accessible');
      }

      setProgress(prev => ({ 
        ...prev, 
        connectionStatus: 'healthy' 
      }));

      console.log('✓ All connectivity tests passed');
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

  const createUsersBatch = async (
    users: UserImportData[], 
    batchConfig?: BatchConfig
  ): Promise<ImportResult> => {
    try {
      console.log(`=== Calling Enhanced Batch Edge Function ===`);
      console.log(`Sending ${users.length} users to edge function for batch import`);
      console.log('Batch config:', batchConfig);
      
      // Get current session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current user:', session?.user?.email);
      console.log('Session valid:', !!session?.access_token);
      
      const requestBody = {
        users,
        ...batchConfig
      };

      const { data, error } = await supabase.functions.invoke('import-users', {
        body: requestBody
      });

      console.log('Edge function call completed');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Edge function error details:', {
          message: error.message,
          context: error.context,
          details: error.details
        });
        
        // Provide more specific error messages based on the error
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
        } else if (error.message?.includes('403') || error.message?.includes('Admin privileges required')) {
          throw new Error('Permission denied: You need admin privileges to import users.');
        } else if (error.message?.includes('401') || error.message?.includes('authentication')) {
          throw new Error('Authentication error: Please log out and log back in, then try again.');
        } else {
          throw new Error(error.message || 'Edge function call failed');
        }
      }

      if (!data) {
        throw new Error('No data returned from edge function');
      }

      console.log('✓ Enhanced batch edge function response received:', data);
      return data as ImportResult;

    } catch (error) {
      console.error('Error calling enhanced import-users edge function:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      throw error;
    }
  };

  const importUsers = async (
    users: UserImportData[],
    speed: 'fast' | 'medium' | 'slow' = 'medium'
  ): Promise<ImportResult> => {
    console.log(`=== Starting Enhanced Batch Import Process ===`);
    console.log(`Importing ${users.length} users with ${speed} speed`);
    
    // Test connectivity first
    const isConnected = await testConnectivity();
    if (!isConnected) {
      throw new Error('Connection test failed. Please check your internet connection and authentication.');
    }

    // Configure batch processing based on speed and scale
    const batchConfig: BatchConfig = {
      batchSize: getBatchSize(speed, users.length),
      maxConcurrency: getConcurrency(speed, users.length)
    };

    console.log('Batch configuration:', batchConfig);

    let errors: string[] = [];
    let successful = 0;
    let failed = 0;

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

    // Process users via enhanced batch edge function
    try {
      const result = await createUsersBatch(users, batchConfig);
      successful = result.successful;
      failed = result.failed;
      errors = result.errors;

      // Update progress to show completion with batch info
      setProgress(prev => ({
        ...prev,
        completed: users.length,
        successful,
        failed,
        processedBatches: result.processedBatches,
        totalBatches: result.totalBatches,
        processingTimeMs: result.processingTimeMs,
        usersPerSecond: result.usersPerSecond
      }));

      // Show performance summary
      if (result.processingTimeMs && result.usersPerSecond) {
        const timeInSeconds = Math.round(result.processingTimeMs / 1000);
        toast.success(
          `Batch import completed in ${timeInSeconds}s (${result.usersPerSecond} users/sec)`
        );
      }

    } catch (error) {
      console.error('Enhanced batch import failed:', error);
      failed = users.length;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors = [`Enhanced batch import failed: ${errorMessage}`];
      
      setProgress(prev => ({
        ...prev,
        completed: users.length,
        successful: 0,
        failed: users.length
      }));
      
      // Show user-friendly error message
      toast.error(`Enhanced batch import failed: ${errorMessage}`);
    }

    setProgress(prev => ({
      ...prev,
      isRunning: false,
      currentUser: undefined
    }));

    const result = { successful, failed, errors };
    console.log('=== Enhanced Batch Import Process Complete ===', result);
    
    return result;
  };

  const getBatchSize = (speed: string, totalUsers: number): number => {
    // Optimize batch size based on total volume and speed
    if (totalUsers >= 10000) {
      switch (speed) {
        case 'fast': return 200;
        case 'medium': return 150;
        case 'slow': return 100;
        default: return 100;
      }
    } else if (totalUsers >= 1000) {
      switch (speed) {
        case 'fast': return 100;
        case 'medium': return 75;
        case 'slow': return 50;
        default: return 50;
      }
    } else {
      switch (speed) {
        case 'fast': return 50;
        case 'medium': return 25;
        case 'slow': return 10;
        default: return 25;
      }
    }
  };

  const getConcurrency = (speed: string, totalUsers: number): number => {
    // Optimize concurrency based on total volume and speed
    if (totalUsers >= 10000) {
      switch (speed) {
        case 'fast': return 10;
        case 'medium': return 7;
        case 'slow': return 5;
        default: return 5;
      }
    } else if (totalUsers >= 1000) {
      switch (speed) {
        case 'fast': return 8;
        case 'medium': return 5;
        case 'slow': return 3;
        default: return 3;
      }
    } else {
      switch (speed) {
        case 'fast': return 5;
        case 'medium': return 3;
        case 'slow': return 2;
        default: return 3;
      }
    }
  };

  const pauseImport = () => {
    console.log('Note: Pausing is not supported in batch mode - operation will complete current batches');
    setIsPaused(true);
  };

  const resumeImport = () => {
    console.log('Note: Resume is not needed in batch mode');
    setIsPaused(false);
  };

  const cancelImport = () => {
    console.log('Note: Cancelling is not supported in batch mode - operation will complete current batches');
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
