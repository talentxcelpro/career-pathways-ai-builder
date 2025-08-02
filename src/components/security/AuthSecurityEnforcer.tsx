import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/secureSupabaseClient';

const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface SecurityMetrics {
  failedAttempts: number;
  lastAttempt: Date | null;
  isLocked: boolean;
  lockUntil: Date | null;
}

export const useAuthSecurity = () => {
  const checkAccountLockout = async (email: string): Promise<boolean> => {
    const stored = localStorage.getItem(`auth_attempts_${email}`);
    if (!stored) return false;

    const metrics: SecurityMetrics = JSON.parse(stored);
    
    if (metrics.isLocked && metrics.lockUntil) {
      if (new Date() < new Date(metrics.lockUntil)) {
        return true; // Still locked
      } else {
        // Lock expired, reset attempts
        localStorage.removeItem(`auth_attempts_${email}`);
        return false;
      }
    }

    return false;
  };

  const recordFailedAttempt = async (email: string) => {
    const stored = localStorage.getItem(`auth_attempts_${email}`);
    const metrics: SecurityMetrics = stored ? JSON.parse(stored) : {
      failedAttempts: 0,
      lastAttempt: null,
      isLocked: false,
      lockUntil: null
    };

    metrics.failedAttempts += 1;
    metrics.lastAttempt = new Date();

    if (metrics.failedAttempts >= MAX_ATTEMPTS) {
      metrics.isLocked = true;
      metrics.lockUntil = new Date(Date.now() + LOCK_DURATION);
      
      await logSecurityEvent(
        'account_locked',
        'Account locked due to multiple failed attempts',
        { email: email.substring(0, 3) + '***', attempts: metrics.failedAttempts }
      );
    }

    localStorage.setItem(`auth_attempts_${email}`, JSON.stringify(metrics));
    return metrics.failedAttempts;
  };

  const clearFailedAttempts = (email: string) => {
    localStorage.removeItem(`auth_attempts_${email}`);
  };

  return {
    checkAccountLockout,
    recordFailedAttempt,
    clearFailedAttempts
  };
};

// Simple session monitoring component without complex state management
export const AuthSecurityEnforcer = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    let isActive = true;
    
    const monitorSession = async () => {
      if (!isActive) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isActive) {
          // Check session age (24 hours max)
          const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000;
          
          if (sessionAge > maxSessionAge) {
            await supabase.auth.signOut();
            return;
          }

          // Check token expiry
          const tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000) : null;
          if (tokenExpiry && tokenExpiry < new Date()) {
            await supabase.auth.signOut();
            return;
          }
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    };

    // Monitor once every 10 minutes to reduce overhead
    const interval = setInterval(monitorSession, 10 * 60 * 1000);
    
    // Initial check
    monitorSession();

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [user?.id]); // Simple dependency

  return null;
};