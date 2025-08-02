import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/secureSupabaseClient';

interface SecurityMetrics {
  failedAttempts: number;
  lastAttempt: Date | null;
  isLocked: boolean;
  lockUntil: Date | null;
}

const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export const AuthSecurityEnforcer = () => {
  const { user } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedAttempts: 0,
    lastAttempt: null,
    isLocked: false,
    lockUntil: null
  });

  useEffect(() => {
    if (!user) return;

    // Monitor session security
    const monitorSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check session age
          const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > maxSessionAge) {
            await logSecurityEvent(
              'session_expired',
              'Session exceeded maximum allowed duration',
              { userId: user.id, sessionAge, maxSessionAge }
            );
            
            await supabase.auth.signOut();
            return;
          }

          // Validate session integrity
          const tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000) : null;
          if (tokenExpiry && tokenExpiry < new Date()) {
            await logSecurityEvent(
              'token_expired',
              'Authentication token expired',
              { userId: user.id }
            );
            
            await supabase.auth.signOut();
            return;
          }
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
        await logSecurityEvent(
          'session_monitoring_error',
          'Error during session security monitoring',
          { userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    };

    // Monitor every 5 minutes
    const interval = setInterval(monitorSession, 5 * 60 * 1000);
    monitorSession(); // Run immediately

    return () => clearInterval(interval);
  }, [user]);

  // Account lockout management
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
  };

  const clearFailedAttempts = (email: string) => {
    localStorage.removeItem(`auth_attempts_${email}`);
  };

  return null; // This is a utility component with no UI
};

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