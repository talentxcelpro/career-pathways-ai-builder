
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Papa from 'papaparse';

export interface ImportUser {
  email: string;
  name: string;
  role: string;
  password?: string;
}

export interface ImportResult {
  email: string;
  success: boolean;
  error?: string;
  retryCount?: number;
  errorType?: 'network' | 'validation' | 'server' | 'auth' | 'unknown';
}

export interface ImportProgress {
  phase: 'idle' | 'validating' | 'connecting' | 'importing' | 'complete';
  currentUser: number;
  totalUsers: number;
  successful: number;
  failed: number;
  connectionStatus: 'checking' | 'healthy' | 'unhealthy';
  results: ImportResult[];
  // Add compatibility properties for ImportUsersModal
  total: number;
  completed: number;
  isRunning: boolean;
  currentUserEmail?: string;
}

const VALID_ROLES = ['job_seeker', 'employer', 'admin', 'candidate'];

export const useUserImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    phase: 'idle',
    currentUser: 0,
    totalUsers: 0,
    successful: 0,
    failed: 0,
    connectionStatus: 'checking',
    results: [],
    // Compatibility properties
    total: 0,
    completed: 0,
    isRunning: false,
    currentUserEmail: undefined
  });

  const resetProgress = () => {
    setProgress({
      phase: 'idle',
      currentUser: 0,
      totalUsers: 0,
      successful: 0,
      failed: 0,
      connectionStatus: 'checking',
      results: [],
      total: 0,
      completed: 0,
      isRunning: false,
      currentUserEmail: undefined
    });
  };

  const testConnectivity = async (): Promise<boolean> => {
    console.log('🔍 Starting connectivity test...');
    
    try {
      // First check authentication - this is critical
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
        toast.error('Authentication error. Please refresh and try again.');
        return false;
      }

      if (!session?.access_token) {
        console.error('❌ No valid session or access token found');
        setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
        toast.error('No valid authentication session. Please log out and log back in.');
        return false;
      }

      console.log('✅ Authentication session verified');

      // Test the Edge Function with proper logging
      console.log('🔗 Testing Edge Function connectivity...');
      
      const healthCheckStart = Date.now();
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { healthCheck: true },
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const healthCheckTime = Date.now() - healthCheckStart;
      console.log(`⏱️ Health check completed in ${healthCheckTime}ms`);

      if (error) {
        console.error('❌ Edge Function error:', error);
        setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
        toast.error(`Edge Function error: ${error.message}`);
        return false;
      }

      if (!data?.success && !data?.healthCheck) {
        console.error('❌ Edge Function health check failed:', data);
        setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
        toast.error('Edge Function health check failed');
        return false;
      }

      console.log('✅ Edge Function connectivity verified:', data);
      setProgress(prev => ({ ...prev, connectionStatus: 'healthy' }));
      return true;

    } catch (error) {
      console.error('❌ Connectivity test failed:', error);
      setProgress(prev => ({ ...prev, connectionStatus: 'unhealthy' }));
      toast.error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const validateUser = (user: ImportUser, index: number): { isValid: boolean; error?: string; errorType?: ImportResult['errorType'] } => {
    console.log(`🔍 Validating user ${index + 1}:`, { email: user.email, name: user.name, role: user.role });

    // Email validation
    if (!user.email || typeof user.email !== 'string') {
      return { isValid: false, error: 'Email is required', errorType: 'validation' };
    }
    
    if (!user.email.includes('@') || user.email.length < 5) {
      return { isValid: false, error: 'Invalid email format', errorType: 'validation' };
    }

    // Name validation
    if (!user.name || typeof user.name !== 'string') {
      return { isValid: false, error: 'Name is required', errorType: 'validation' };
    }
    
    if (user.name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters', errorType: 'validation' };
    }

    // Role validation
    if (!user.role || typeof user.role !== 'string') {
      return { isValid: false, error: 'Role is required', errorType: 'validation' };
    }
    
    if (!VALID_ROLES.includes(user.role)) {
      return { isValid: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, errorType: 'validation' };
    }

    return { isValid: true };
  };

  const createSingleUser = async (user: ImportUser, retryCount: number = 0): Promise<ImportResult> => {
    const maxRetries = 3;
    console.log(`👤 Creating user: ${user.email} (attempt ${retryCount + 1}/${maxRetries})`);

    try {
      // Get fresh session for each request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return {
          email: user.email,
          success: false,
          error: 'Authentication session expired',
          retryCount: retryCount + 1,
          errorType: 'auth'
        };
      }

      const requestStart = Date.now();
      
      // Log the exact payload being sent
      const payload = {
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        temporaryPassword: user.password || 'TempPass123!'
      };
      
      console.log('📤 Sending payload to Edge Function:', payload);

      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: payload,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const requestTime = Date.now() - requestStart;
      console.log(`⏱️ Request completed in ${requestTime}ms for ${user.email}`);

      if (error) {
        console.error(`❌ Supabase function error for ${user.email}:`, error);
        
        // Determine error type based on error message
        let errorType: ImportResult['errorType'] = 'unknown';
        if (error.message?.includes('network') || error.message?.includes('timeout')) {
          errorType = 'network';
        } else if (error.message?.includes('auth') || error.message?.includes('token')) {
          errorType = 'auth';
        } else if (error.message?.includes('validation') || error.message?.includes('invalid')) {
          errorType = 'validation';
        } else {
          errorType = 'server';
        }

        // Retry for network and server errors
        if ((errorType === 'network' || errorType === 'server') && retryCount < maxRetries - 1) {
          console.log(`🔄 Retrying ${user.email} due to ${errorType} error...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
          return createSingleUser(user, retryCount + 1);
        }

        return {
          email: user.email,
          success: false,
          error: error.message || 'Unknown Supabase function error',
          retryCount: retryCount + 1,
          errorType
        };
      }

      if (!data) {
        console.error(`❌ No data returned for ${user.email}`);
        return {
          email: user.email,
          success: false,
          error: 'No data returned from Edge Function',
          retryCount: retryCount + 1,
          errorType: 'server'
        };
      }

      console.log(`📥 Response data for ${user.email}:`, data);

      if (!data.success) {
        console.error(`❌ Edge Function reported failure for ${user.email}:`, data.error);
        
        // Determine error type from Edge Function response
        let errorType: ImportResult['errorType'] = 'unknown';
        if (data.error?.includes('already exists') || data.error?.includes('already registered')) {
          errorType = 'validation';
        } else if (data.error?.includes('validation') || data.error?.includes('invalid')) {
          errorType = 'validation';
        } else {
          errorType = 'server';
        }

        return {
          email: user.email,
          success: false,
          error: data.error || 'Edge Function reported failure',
          retryCount: retryCount + 1,
          errorType
        };
      }

      console.log(`✅ Successfully created user: ${user.email}`);
      return {
        email: user.email,
        success: true,
        retryCount: retryCount + 1
      };

    } catch (error) {
      console.error(`❌ Unexpected error creating user ${user.email}:`, error);
      
      // Retry for unexpected errors
      if (retryCount < maxRetries - 1) {
        console.log(`🔄 Retrying ${user.email} due to unexpected error...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return createSingleUser(user, retryCount + 1);
      }

      return {
        email: user.email,
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
        retryCount: retryCount + 1,
        errorType: 'unknown'
      };
    }
  };

  const parseCSV = (csvContent: string): Promise<ImportUser[]> => {
    return new Promise((resolve, reject) => {
      console.log('📋 Parsing CSV content...');
      
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
        complete: (results) => {
          console.log('📊 CSV parse results:', {
            data: results.data,
            errors: results.errors,
            meta: results.meta
          });

          if (results.errors.length > 0) {
            console.error('❌ CSV parsing errors:', results.errors);
            reject(new Error(`CSV parsing failed: ${results.errors[0].message}`));
            return;
          }

          const users = results.data as ImportUser[];
          console.log(`✅ Parsed ${users.length} users from CSV`);
          resolve(users);
        },
        error: (error) => {
          console.error('❌ CSV parsing error:', error);
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  };

  const importUsers = async (usersOrCsv: ImportUser[] | string, options?: { speed?: 'fast' | 'normal' | 'slow'; maxRetries?: number }) => {
    console.log('🚀 Starting user import process...');
    
    setIsImporting(true);
    resetProgress();
    
    const importSpeed = options?.speed || 'normal';
    
    try {
      let users: ImportUser[];
      
      // Handle both array of users and CSV string
      if (typeof usersOrCsv === 'string') {
        // Phase 1: Validate CSV
        setProgress(prev => ({ ...prev, phase: 'validating', isRunning: true }));
        console.log('📋 Phase 1: Validating CSV...');
        
        users = await parseCSV(usersOrCsv);
      } else {
        // Direct array of users
        users = usersOrCsv;
        setProgress(prev => ({ ...prev, phase: 'validating', isRunning: true }));
      }
      
      if (users.length === 0) {
        throw new Error('No valid users found in CSV file');
      }

      console.log(`📊 Found ${users.length} users to import`);
      setProgress(prev => ({ ...prev, totalUsers: users.length, total: users.length }));

      // Phase 2: Test connectivity
      setProgress(prev => ({ ...prev, phase: 'connecting' }));
      console.log('🔗 Phase 2: Testing connectivity...');
      
      const isConnected = await testConnectivity();
      if (!isConnected) {
        throw new Error('Connection test failed. Please check your internet connection and authentication.');
      }

      // Phase 3: Import users
      setProgress(prev => ({ ...prev, phase: 'importing' }));
      console.log('👥 Phase 3: Importing users...');

      const results: ImportResult[] = [];
      const delays = { fast: 100, normal: 500, slow: 1000 };
      const delay = delays[importSpeed];

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`\n--- Processing user ${i + 1}/${users.length}: ${user.email} ---`);

        // Update progress
        setProgress(prev => ({ 
          ...prev, 
          currentUser: i + 1,
          completed: i + 1,
          currentUserEmail: user.email,
          results: [...results]
        }));

        // Validate user data
        const validation = validateUser(user, i);
        if (!validation.isValid) {
          console.error(`❌ Validation failed for ${user.email}:`, validation.error);
          results.push({
            email: user.email,
            success: false,
            error: validation.error,
            retryCount: 1,
            errorType: validation.errorType
          });
          continue;
        }

        // Create user
        const result = await createSingleUser(user);
        results.push(result);

        // Update counters
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        setProgress(prev => ({ 
          ...prev, 
          successful,
          failed,
          results: [...results]
        }));

        // Add delay between requests to avoid overwhelming the server
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Phase 4: Complete
      setProgress(prev => ({ ...prev, phase: 'complete', isRunning: false }));
      
      const finalSuccessful = results.filter(r => r.success).length;
      const finalFailed = results.filter(r => !r.success).length;

      console.log(`\n🎉 Import completed! ${finalSuccessful} successful, ${finalFailed} failed`);

      if (finalSuccessful > 0) {
        toast.success(`Successfully imported ${finalSuccessful} users!`);
      }
      
      if (finalFailed > 0) {
        toast.error(`❌ Import failed: ${finalFailed} users could not be imported. Check results for details.`);
      }

    } catch (error) {
      console.error('❌ Import process failed:', error);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(prev => ({ ...prev, phase: 'idle', isRunning: false }));
    } finally {
      setIsImporting(false);
    }
  };

  const retryFailedUsers = async (failedResults: ImportResult[]) => {
    console.log(`🔄 Retrying ${failedResults.length} failed users...`);
    
    setIsImporting(true);
    
    try {
      // Test connectivity first
      const isConnected = await testConnectivity();
      if (!isConnected) {
        throw new Error('Connection test failed');
      }

      const retryResults: ImportResult[] = [];
      
      for (const failedResult of failedResults) {
        const user: ImportUser = {
          email: failedResult.email,
          name: 'Retry User', // We don't have the original name, but Edge Function might not need it for retry
          role: 'job_seeker', // Default role for retry
          password: 'TempPass123!'
        };

        const result = await createSingleUser(user);
        retryResults.push(result);

        // Update progress
        const currentResults = progress.results.map(r => 
          r.email === failedResult.email ? result : r
        );
        
        const successful = currentResults.filter(r => r.success).length;
        const failed = currentResults.filter(r => !r.success).length;

        setProgress(prev => ({
          ...prev,
          successful,
          failed,
          results: currentResults
        }));
      }

      const retrySuccessful = retryResults.filter(r => r.success).length;
      
      if (retrySuccessful > 0) {
        toast.success(`Successfully imported ${retrySuccessful} users on retry!`);
      } else {
        toast.error('All retry attempts failed');
      }

    } catch (error) {
      console.error('❌ Retry failed:', error);
      toast.error(`Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const pauseImport = () => {
    setIsPaused(true);
    // Note: Actual pause functionality would need to be implemented
  };

  const resumeImport = () => {
    setIsPaused(false);
    // Note: Actual resume functionality would need to be implemented
  };

  const cancelImport = () => {
    setIsPaused(false);
    setIsImporting(false);
    setProgress(prev => ({ ...prev, phase: 'idle', isRunning: false }));
  };

  return {
    importUsers,
    retryFailedUsers,
    testConnectivity,
    progress,
    isImporting,
    resetProgress,
    // Additional properties expected by ImportUsersModal
    results: progress.results,
    isPaused,
    pauseImport,
    resumeImport,
    cancelImport
  };
};
