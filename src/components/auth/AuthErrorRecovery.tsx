import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AuthErrorRecovery: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, refreshSession } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Monitor for auth errors and attempt recovery
    const handleAuthError = async () => {
      if (session && !isRecovering) {
        try {
          setIsRecovering(true);
          
          // Check if session is still valid
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error && error.message?.includes('JWT')) {
            console.warn('JWT expired, attempting refresh...');
            await refreshSession();
          }
        } catch (error) {
          console.error('Auth recovery failed:', error);
          // Clear corrupted data
          localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
          localStorage.removeItem('secure_session');
          sessionStorage.clear();
          
          toast.error('Session expired. Please sign in again.');
          window.location.href = '/auth/login';
        } finally {
          setIsRecovering(false);
        }
      }
    };

    // Listen for network errors that might indicate auth issues
    const handleNetworkError = (event: ErrorEvent) => {
      if (event.message?.includes('401') || event.message?.includes('JWT')) {
        handleAuthError();
      }
    };

    window.addEventListener('error', handleNetworkError);
    
    // Periodic session health check
    const healthCheckInterval = setInterval(() => {
      if (session && !isRecovering) {
        handleAuthError();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      window.removeEventListener('error', handleNetworkError);
      clearInterval(healthCheckInterval);
    };
  }, [session, refreshSession, isRecovering]);

  return <>{children}</>;
};