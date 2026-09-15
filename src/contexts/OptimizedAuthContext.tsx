import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldClearSessionAfterError } from '@/utils/authErrors';

interface OptimizedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  retryAuth: () => void;
}

const OptimizedAuthContext = createContext<OptimizedAuthContextType | undefined>(undefined);

export const useOptimizedAuth = () => {
  const context = useContext(OptimizedAuthContext);
  if (context === undefined) {
    throw new Error('useOptimizedAuth must be used within an OptimizedAuthProvider');
  }
  return context;
};

export const OptimizedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  const retryAuth = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Session refresh failed:', error);
      if (shouldClearSessionAfterError(error)) {
        setSession(null);
        setUser(null);
      }
      setError(error as Error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let initialCheckStarted = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log(`[Auth] State Change: ${event}`, currentSession?.user?.email ? 'SIGNED_IN' : 'SIGNED_OUT');
        
        // Skip only the duplicate initial event; token refreshes must update
        // state so native routes do not treat a refreshed session as expired.
        if (initialCheckStarted && event === 'INITIAL_SESSION') {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle redirects
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('subdomain_redirect');
          const currentPath = currentPathRef.current;
          if (currentPath !== '/' && !currentPath.startsWith('/public')) {
            navigate('/', { replace: true });
          }
          setLoading(false);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          const currentPath = currentPathRef.current;
          if (currentPath.startsWith('/auth') || currentPath === '/') {
            const redirectPath = localStorage.getItem('subdomain_redirect') || '/career-os';
            navigate(redirectPath, { replace: true });
            localStorage.removeItem('subdomain_redirect');
          }
          setLoading(false);
        }
      }
    );

    // Initial session recovery backup - THE SOURCE OF TRUTH ON MOUNT
    const initAuth = async () => {
      if (initialCheckStarted) return;
      initialCheckStarted = true;

      try {
        console.log('[Auth] initAuth: Fetching session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession) {
            console.log('[Auth] initAuth: Session recovered for', initialSession.user.email);
            const currentPath = currentPathRef.current;
            if (currentPath === '/' || currentPath.startsWith('/auth')) {
              const redirectPath = localStorage.getItem('subdomain_redirect') || '/career-os';
              navigate(redirectPath, { replace: true });
              localStorage.removeItem('subdomain_redirect');
            }
          } else {
            console.log('[Auth] initAuth: No session found');
          }
        }
      } catch (err: any) {
        console.error('[Auth] initAuth: Error', err);
        if (mounted) setError(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, retryAuth, retryCount]);

  useEffect(() => {
    let cancelled = false;

    const recoverSession = async () => {
      try {
        const { data: { session: storedSession }, error } = await supabase.auth.getSession();
        if (cancelled || error || !storedSession) return;

        setSession(storedSession);
        setUser(storedSession.user);
        refreshSession().catch((refreshError) => {
          console.warn('[Auth] Foreground refresh skipped:', refreshError);
        });
      } catch (error) {
        console.warn('[Auth] Foreground session recovery failed:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        recoverSession();
      }
    };

    window.addEventListener('online', recoverSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener('online', recoverSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    error,
    signOut,
    refreshSession,
    retryAuth
  };

  return (
    <OptimizedAuthContext.Provider value={value}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};
