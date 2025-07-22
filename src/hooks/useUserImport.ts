
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

      // Test 2: Test Supabase Admin API access by attempting to get current user
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(session.user.id);
      if (userError) {
        console.error('Supabase Admin API test failed:', userError);
        throw new Error('Supabase Admin API access denied');
      }
      console.log('✓ Supabase Admin API accessible');

      // Test 3: Test database connectivity by querying profiles table
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

      console.log('All connectivity tests passed successfully');
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

  const createUserWithProfile = async (userData: UserImportData): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log(`Creating user: ${userData.email}`);

      // Create user with Supabase Auth Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.temporaryPassword || 'TempPass123!',
        email_confirm: true // Auto-confirm email to avoid verification step
      });

      if (authError || !authData.user) {
        console.error('User creation failed:', authError);
        return { 
          success: false, 
          error: authError?.message || 'Failed to create user account' 
        };
      }

      console.log(`✓ User account created: ${userData.email}`);

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userData.name,
          user_role: userData.role as any,
          is_employer: userData.role === 'employer',
          employer_status: userData.role === 'employer' ? 'approved' : null,
          profile_completed: true,
          onboarding_completed: true,
          first_login: false
        });

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        
        // Cleanup: Delete the auth user since profile creation failed
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('Cleaned up auth user after profile creation failure');
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        
        return { 
          success: false, 
          error: `Profile creation failed: ${profileError.message}` 
        };
      }

      console.log(`✓ User profile created: ${userData.email}`);
      return { success: true };

    } catch (error) {
      console.error('Unexpected error during user creation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error' 
      };
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

    const errors: string[] = [];
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

    for (let i = 0; i < users.length; i++) {
      // Check for cancellation
      if (shouldCancel) {
        console.log('Import cancelled by user');
        break;
      }

      // Handle pause
      while (isPaused && !shouldCancel) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const user = users[i];
      
      setProgress(prev => ({
        ...prev,
        currentUser: user.email,
        completed: i
      }));

      const result = await createUserWithProfile(user);
      
      if (result.success) {
        successful++;
        console.log(`✓ Successfully imported: ${user.email}`);
      } else {
        failed++;
        const errorMsg = `${user.email}: ${result.error}`;
        errors.push(errorMsg);
        console.error(`✗ Failed to import: ${errorMsg}`);
      }

      setProgress(prev => ({
        ...prev,
        completed: i + 1,
        successful,
        failed
      }));

      // Add delay between requests (except for the last one)
      if (i < users.length - 1 && !shouldCancel) {
        await new Promise(resolve => setTimeout(resolve, delays[speed]));
      }
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
