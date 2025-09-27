import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

export const AuthErrorRecovery: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, refreshSession } = useOptimizedAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState(Date.now());

  useEffect(() => {
    // Improved auth error recovery - less aggressive
    const handleAuthError = async (error?: any) => {
      if (isRecovering) return;
      
      // Ignore common non-critical auth messages
      if (!error || 
          error?.message?.includes('Auth session missing') ||
          error?.message?.includes('No session') ||
          !error.message) {
        return; // Don't treat these as errors
      }
      
      setIsRecovering(true);
      
      try {
        // Only handle critical JWT issues when user actually has a session
        if (session && error?.message?.includes('JWT') && error?.message?.includes('expired')) {
          console.log('JWT expired, attempting refresh...');
          
          try {
            await refreshSession();
          } catch (refreshError) {
            console.warn('Session refresh failed, clearing auth data');
            localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
            localStorage.removeItem('secure_session');
          }
        }
      } catch (error) {
        console.warn('Auth recovery attempt failed:', error);
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