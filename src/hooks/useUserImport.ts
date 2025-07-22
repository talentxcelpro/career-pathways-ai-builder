
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
}

interface ImportProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  currentUser?: string;
  isRunning: boolean;
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

  const createUserWithRetry = async (
    user: ImportUser,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<ImportResult> => {
    let lastError = '';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for user: ${user.email}`);
        
        const requestBody = {
          userEmail: user.email?.toString().trim(),
          userName: user.name?.toString().trim(),
          userRole: user.role || 'job_seeker',
          ...(user.temporaryPassword && { temporaryPassword: user.temporaryPassword.toString().trim() })
        };

        // Validate required fields
        if (!requestBody.userEmail || !requestBody.userName) {
          throw new Error(`Missing required fields: email=${!!requestBody.userEmail}, name=${!!requestBody.userName}`);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No authentication session found');
        }

        // Add request timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });

        const requestPromise = supabase.functions.invoke('admin-create-user', {
          body: requestBody,
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const { data, error } = await Promise.race([requestPromise, timeoutPromise]) as any;

        if (error) {
          throw new Error(error.message || 'Edge Function call failed');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Unknown error from Edge Function');
        }

        console.log(`✅ User ${user.email} created successfully`);
        return { email: user.email, success: true, retryCount: attempt };

      } catch (error: any) {
        lastError = error.message || 'Unknown error';
        console.error(`❌ Attempt ${attempt} failed for ${user.email}:`, lastError);

        // Don't retry for validation errors
        if (lastError.includes('Missing required fields') || 
            lastError.includes('email_exists') ||
            lastError.includes('Invalid request body')) {
          break;
        }

        // If not the last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
        }
      }
    }

    return { email: user.email, success: false, error: lastError, retryCount: maxRetries };
  };

  const importUsers = useCallback(async (
    users: ImportUser[],
    options: {
      speed: 'slow' | 'medium' | 'fast';
      maxRetries: number;
    } = { speed: 'medium', maxRetries: 3 }
  ) => {
    if (users.length === 0) {
      toast.error('No users to import');
      return;
    }

    // Reset state
    setResults([]);
    setIsPaused(false);
    setProgress({
      total: users.length,
      completed: 0,
      successful: 0,
      failed: 0,
      isRunning: true
    });

    const delayMap = {
      slow: 3000,
      medium: 1500,
      fast: 800
    };
    const baseDelay = delayMap[options.speed];

    console.log(`🚀 Starting import of ${users.length} users with ${options.speed} speed`);
    toast.info(`Starting import of ${users.length} users...`);

    const importResults: ImportResult[] = [];

    for (let i = 0; i < users.length; i++) {
      // Check if paused
      while (isPaused) {
        await sleep(500);
      }

      const user = users[i];
      
      setProgress(prev => ({
        ...prev,
        currentUser: user.email,
        completed: i
      }));

      const result = await createUserWithRetry(user, options.maxRetries, baseDelay);
      importResults.push(result);

      setProgress(prev => ({
        ...prev,
        completed: i + 1,
        successful: prev.successful + (result.success ? 1 : 0),
        failed: prev.failed + (result.success ? 0 : 1)
      }));

      setResults([...importResults]);

      // Add delay between requests (except for the last one)
      if (i < users.length - 1) {
        await sleep(baseDelay);
      }
    }

    setProgress(prev => ({ ...prev, isRunning: false, currentUser: undefined }));

    const successful = importResults.filter(r => r.success).length;
    const failed = importResults.filter(r => !r.success).length;

    if (successful > 0 && failed === 0) {
      toast.success(`✅ All ${successful} users imported successfully!`);
    } else if (successful > 0 && failed > 0) {
      toast.warning(`⚠️ Import complete: ${successful} successful, ${failed} failed`);
    } else {
      toast.error(`❌ Import failed: ${failed} users could not be imported`);
    }

    console.log(`📊 Import completed: ${successful} successful, ${failed} failed`);
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
