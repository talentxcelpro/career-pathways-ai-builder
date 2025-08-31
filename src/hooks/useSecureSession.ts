import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  token: string;
  expires_at: string;
  user: any;
  isValid: boolean;
}

interface UseSecureSessionReturn {
  session: SessionData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  isAuthenticated: boolean;
}

export const useSecureSession = (): UseSecureSessionReturn => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get session from localStorage
  const getStoredSession = useCallback(() => {
    try {
      const stored = localStorage.getItem('secure_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Store session in localStorage
  const storeSession = useCallback((sessionData: SessionData | null) => {
    if (sessionData) {
      localStorage.setItem('secure_session', JSON.stringify(sessionData));
    } else {
      localStorage.removeItem('secure_session');
    }
  }, []);

  // Validate session with server
  const validateSession = useCallback(async (token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'validate', token }
      });

      if (error || !data?.valid) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'create', email, password }
      });

      if (error || !data?.success) {
        return { success: false, error: data?.error || 'Login failed' };
      }

      const sessionData: SessionData = {
        token: data.token,
        expires_at: data.expires_at,
        user: data.user,
        isValid: true
      };

      setSession(sessionData);
      storeSession(sessionData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  }, [storeSession]);

  // Logout function
  const logout = useCallback(async () => {
    const currentSession = session || getStoredSession();
    
    if (currentSession?.token) {
      try {
        await supabase.functions.invoke('session-manager', {
          body: { action: 'invalidate', token: currentSession.token }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setSession(null);
    storeSession(null);
  }, [session, getStoredSession, storeSession]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentSession = session || getStoredSession();
    
    if (!currentSession?.token) {
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'refresh', token: currentSession.token }
      });

      if (error || !data?.success) {
        await logout();
        return false;
      }

      const newSessionData: SessionData = {
        ...currentSession,
        token: data.token,
        expires_at: data.expires_at
      };

      setSession(newSessionData);
      storeSession(newSessionData);

      return true;
    } catch (error) {
      console.error('Refresh session error:', error);
      await logout();
      return false;
    }
  }, [session, getStoredSession, storeSession, logout]);

  // Check if session is expired
  const isSessionExpired = useCallback((sessionData: SessionData) => {
    return new Date(sessionData.expires_at) <= new Date();
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const storedSession = getStoredSession();
      
      if (!storedSession) {
        setIsLoading(false);
        return;
      }

      // Check if expired
      if (isSessionExpired(storedSession)) {
        await logout();
        setIsLoading(false);
        return;
      }

      // Validate with server
      const isValid = await validateSession(storedSession.token);
      
      if (isValid) {
        setSession(storedSession);
      } else {
        await logout();
      }
      
      setIsLoading(false);
    };

    initializeSession();
  }, [getStoredSession, isSessionExpired, logout, validateSession]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session) return;

    const timeUntilExpiry = new Date(session.expires_at).getTime() - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000); // 5 mins before expiry, min 1 min

    const refreshTimer = setTimeout(() => {
      refreshSession();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [session, refreshSession]);

  // Periodic session validation (every 5 minutes)
  useEffect(() => {
    if (!session) return;

    const validationInterval = setInterval(async () => {
      const isValid = await validateSession(session.token);
      if (!isValid) {
        await logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(validationInterval);
  }, [session, validateSession, logout]);

  return {
    session,
    isLoading,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!session?.isValid
  };
};