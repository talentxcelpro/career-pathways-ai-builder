import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface OptimizedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
  const navigate = useNavigate();

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Session refresh failed:', error);
      // Only clear session if it's a real auth error, not network issues
      if (!error.message?.includes('network') && !error.message?.includes('timeout')) {
        setSession(null);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener - simplified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Minimal logging in production
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth state:', event, session?.user?.email);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle auth events with minimal redirects
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('subdomain_redirect');
          if (window.location.pathname !== '/') {
            navigate('/', { replace: true });
          }
        } else if (event === 'SIGNED_IN' && session?.user) {
          const currentPath = window.location.pathname;
          
          // Only redirect if on auth pages
          if (currentPath.startsWith('/auth') || currentPath === '/') {
            const redirectPath = localStorage.getItem('subdomain_redirect') || '/network';
            navigate(redirectPath, { replace: true });
            localStorage.removeItem('subdomain_redirect');
          }
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
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
  }, [navigate]);

  const signOut = async () => {
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
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };

  return (
    <OptimizedAuthContext.Provider value={value}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};