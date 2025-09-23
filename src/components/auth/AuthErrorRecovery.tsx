import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AuthErrorRecovery: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, refreshSession } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState(Date.now());

  useEffect(() => {
    // Improved auth error recovery
    const handleAuthError = async (error?: any) => {
      if (isRecovering) return;
      
      setIsRecovering(true);
      
      try {
        // Don't treat missing session as an error - it's normal
        if (error?.message?.includes('Auth session missing')) {
          console.log('No active session - this is normal for logged out users');
          setIsRecovering(false);
          return;
        }

        // Only handle actual JWT expiration/corruption
        if (session && (error?.message?.includes('JWT') || error?.message?.includes('expired'))) {
          console.log('JWT expired, attempting refresh...');
          
          try {
            await refreshSession();
            toast.success('Session refreshed successfully');
          } catch (refreshError) {
            console.warn('Session refresh failed:', refreshError);
            // Only show error for genuine refresh failures
            toast.error('Session expired. Please sign in again.');
            
            // Clear corrupted auth data
            localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
            localStorage.removeItem('secure_session');
            
            // Redirect to login only if user was actually logged in
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Auth recovery failed:', error);
      } finally {
        setIsRecovering(false);
      }
    };

    // Listen for unhandled promise rejections (common source of auth errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error?.message?.includes('Auth') || error?.message?.includes('JWT')) {
        // Prevent the error from being shown to user
        event.preventDefault();
        handleAuthError(error);
      }
    };

    // Listen for general errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Auth') || event.error?.message?.includes('JWT')) {
        // Prevent the error from being shown to user
        event.preventDefault();
        handleAuthError(event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    // Less aggressive session health check - only when user is actively using the app
    let healthCheckInterval: NodeJS.Timeout;
    
    const startHealthCheck = () => {
      // Only check if user has been active and has a session
      if (session && Date.now() - lastSessionCheck > 10 * 60 * 1000) { // 10 minutes
        handleAuthError();
        setLastSessionCheck(Date.now());
      }
    };

    // Update last activity time on user interaction
    const updateActivity = () => {
      setLastSessionCheck(Date.now());
    };

    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    
    // Check every 15 minutes instead of 5
    healthCheckInterval = setInterval(startHealthCheck, 15 * 60 * 1000);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      clearInterval(healthCheckInterval);
    };
  }, [session, refreshSession, isRecovering, lastSessionCheck]);

  return <>{children}</>;
};