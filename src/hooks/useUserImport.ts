
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportUser {
  email: string;
  name: string;
  role?: string;
  temporaryPassword?: string;
}

interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  retryCount?: number;
  errorType?: 'network' | 'validation' | 'server' | 'unknown';
}

interface ImportProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentUser?: string;
  isRunning: boolean;
  connectionStatus?: 'testing' | 'healthy' | 'unhealthy';
}

export const useUserImport = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    isRunning: false
  });

  const [results, setResults] = useState<ImportResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Test Edge Function connectivity before starting import
  const testConnectivity = async (): Promise<boolean> => {
    try {
      setProgress(prev => ({ ...prev, connectionStatus: 'testing' }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session found');
      }

      // Test with a simple health check
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { healthCheck: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (error || !data?.success) {
        setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
        return false;
      }

      setProgress(prev => ({ ...prev, connectionStatus: 'healthy' }));
      return true;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
      return false;
    }
  };

  // Validate user data before processing
  const validateUserData = (users: ImportUser[]): { valid: ImportUser[], invalid: ImportResult[] } => {
    const valid: ImportUser[] = [];
    const invalid: ImportResult[] = [];

    users.forEach(user => {
      const errors: string[] = [];
      
      if (!user.email || !user.email.includes('@')) {
        errors.push('Invalid email format');
      }
      
      if (!user.name || user.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
      }

      if (user.role && !['job_seeker', 'employer', 'admin'].includes(user.role)) {
        errors.push('Invalid role. Must be: job_seeker, employer, or admin');
      }

      if (errors.length > 0) {
        invalid.push({
          email: user.email || 'Unknown',
          success: false,
          error: errors.join('; '),
          errorType: 'validation',
          retryCount: 0
        });
      } else {
        valid.push({
          ...user,
          role: user.role || 'job_seeker'
        });
      }
    });

    return { valid, invalid };
  };

  const categorizeError = (error: any): 'network' | 'validation' | 'server' | 'unknown' => {
    const errorMessage = error.message || error.toString().toLowerCase();
    
    if (errorMessage.includes('failed to fetch') || 
        errorMessage.includes('network error') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection')) {
      return 'network';
    }
    
    if (errorMessage.includes('missing required fields') || 
        errorMessage.includes('invalid') ||
        errorMessage.includes('email_exists')) {
      return 'validation';
    }
    
    if (errorMessage.includes('internal server error') || 
        errorMessage.includes('500')) {
      return 'server';
    }
    
    return 'unknown';
  };

  const createUserWithRetry = async (
    user: ImportUser,
    maxRetries: number = 3,
    baseDelay: number = 5000 // Increased to 5 seconds
  ): Promise<ImportResult> => {
    let lastError = '';
    let lastErrorType: 'network' | 'validation' | 'server' | 'unknown' = 'unknown';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for user: ${user.email}`);
        
        const requestBody = {
          userEmail: user.email?.toString().trim(),
          userName: user.name?.toString().trim(),
          userRole: user.role || 'job_seeker',
          ...(user.temporaryPassword && { temporaryPassword: user.temporaryPassword.toString().trim() })
        };

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authentication session found');
        }

        // Add longer timeout and proper error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const { data, error } = await supabase.functions.invoke('admin-create-user', {
            body: requestBody,
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (error) {
            throw new Error(error.message || 'Edge Function call failed');
          }

          if (!data?.success) {
            throw new Error(data?.error || 'Unknown error from Edge Function');
          }

          console.log(`✅ User ${user.email} created successfully`);
          return { 
            email: user.email, 
            success: true, 
            retryCount: attempt,
            errorType: undefined
          };

        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          throw fetchError;
        }

      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        lastErrorType = categorizeError(error);
        console.error(`❌ Attempt ${attempt} failed for ${user.email}:`, lastError, `(${lastErrorType})`);

        // Don't retry for validation errors
        if (lastErrorType === 'validation') {
          break;
        }

        // If not the last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 2000;
          console.log(`⏳ Waiting ${Math.round(delay/1000)}s before retry...`);
          await sleep(delay);
        }
      }
    }

    return { 
      email: user.email, 
      success: false, 
      error: lastError, 
      errorType: lastErrorType,
      retryCount: maxRetries 
    };
  };

  const importUsers = useCallback(async (
    users: ImportUser[],
    options: {
      speed: 'slow' | 'medium' | 'fast';
      maxRetries: number;
    } = { speed: 'slow', maxRetries: 3 }
  ) => {
    if (users.length === 0) {
      toast.error('No users to import');
      return;
    }

    console.log(`🚀 Starting import process for ${users.length} users`);

    // Step 1: Test connectivity
    toast.info('Testing connection to server...');
    const isConnected = await testConnectivity();
    if (!isConnected) {
      toast.error('❌ Connection test failed. Please check your internet connection and try again.');
      return;
    }
    toast.success('✅ Connection test passed');

    // Step 2: Validate user data
    const { valid: validUsers, invalid: invalidUsers } = validateUserData(users);
    
    if (invalidUsers.length > 0) {
      console.log(`⚠️ Found ${invalidUsers.length} invalid users`);
      setResults(invalidUsers);
    }

    if (validUsers.length === 0) {
      toast.error('No valid users to import after validation');
      setProgress({
        total: users.length,
        completed: users.length,
        successful: 0,
        failed: invalidUsers.length,
        isRunning: false
      });
      return;
    }

    // Reset state for valid users
    setIsPaused(false);
    setProgress({
      total: users.length,
      completed: invalidUsers.length,
      successful: 0,
      failed: invalidUsers.length,
      isRunning: true,
      connectionStatus: 'healthy'
    });

    // Much more conservative delays to prevent overwhelming the system
    const delayMap = {
      slow: 8000,    // 8 seconds - recommended for large imports
      medium: 5000,  // 5 seconds 
      fast: 3000     // 3 seconds - minimum recommended
    };
    const baseDelay = delayMap[options.speed];

    console.log(`📊 Processing ${validUsers.length} valid users with ${options.speed} speed (${baseDelay}ms delay)`);
    toast.info(`Starting import of ${validUsers.length} valid users with ${options.speed} speed...`);

    const allResults: ImportResult[] = [...invalidUsers];

    // Process users sequentially (no concurrency to avoid rate limits)
    for (let i = 0; i < validUsers.length; i++) {
      // Check if paused
      while (isPaused) {
        await sleep(500);
      }

      const user = validUsers[i];
      
      setProgress(prev => ({
        ...prev,
        currentUser: user.email,
        completed: invalidUsers.length + i
      }));

      console.log(`👤 Processing user ${i + 1}/${validUsers.length}: ${user.email}`);

      const result = await createUserWithRetry(user, options.maxRetries, baseDelay);
      allResults.push(result);

      setProgress(prev => ({
        ...prev,
        completed: invalidUsers.length + i + 1,
        successful: prev.successful + (result.success ? 1 : 0),
        failed: prev.failed + (result.success ? 0 : 1)
      }));

      setResults([...allResults]);

      // Add delay between requests (except for the last one)
      if (i < validUsers.length - 1) {
        console.log(`⏸️ Waiting ${baseDelay/1000}s before next user...`);
        await sleep(baseDelay);
      }
    }

    setProgress(prev => ({ ...prev, isRunning: false, currentUser: undefined }));

    const successful = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;

    console.log(`📊 Import completed: ${successful} successful, ${failed} failed`);

    if (successful > 0 && failed === 0) {
      toast.success(`✅ All ${successful} users imported successfully!`);
    } else if (successful > 0 && failed > 0) {
      toast.warning(`⚠️ Import complete: ${successful} successful, ${failed} failed. Check results for details.`);
    } else {
      toast.error(`❌ Import failed: ${failed} users could not be imported. Check results for details.`);
    }
  }, [isPaused]);

  const pauseImport = useCallback(() => {
    setIsPaused(true);
    toast.info('Import paused');
  }, []);

  const resumeImport = useCallback(() => {
    setIsPaused(false);
    toast.info('Import resumed');
  }, []);

  const cancelImport = useCallback(() => {
    setProgress(prev => ({ ...prev, isRunning: false, currentUser: undefined }));
    setIsPaused(false);
    toast.info('Import cancelled');
  }, []);

  return {
    progress,
    results,
    isPaused,
    importUsers,
    pauseImport,
    resumeImport,
    cancelImport
  };
};
