
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ENV } from '@/lib/environment';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signInWithIdToken: (provider: string, token: string) => Promise<{ user: User; session: Session; } | { user: null; session: null; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fail-safe: provide a non-throwing fallback to avoid crashing before provider mounts
    if (ENV.isDevelopment) {
      console.warn('useAuth called outside AuthProvider - returning safe fallback');
    }
    return {
      user: null,
      session: null,
      loading: true,
      signOut: async () => {},
      refreshSession: async () => {},
      signInWithIdToken: async () => ({ user: null, session: null })
    } as any;
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        // Handle session refresh failure gracefully
        if (error.message?.includes('refresh_token_not_found') || error.message?.includes('invalid_refresh_token')) {
          console.warn('Refresh token invalid, clearing session');
          await signOut();
          return;
        }
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Session refresh error:', error);
      // Clear potentially corrupted session data
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      sessionStorage.clear();
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;
    let initTimeout: NodeJS.Timeout;

    // Initialize auth session and listener
    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;

            // Synchronous state updates only
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );
        
        authSubscription = subscription;

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
          sessionStorage.clear();
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, setting loading to false');
        setLoading(false);
      }
    }, 5000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [navigate, loading]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      // Clear state immediately
      setUser(null);
      setSession(null);
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithIdToken = async (provider: string, token: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: provider as any,
        token,
      });

      if (error) {
        console.error('Error signing in with ID token:', error);
        throw error;
      }

      // Session will be updated via auth state change
      return data;
    } catch (error) {
      console.error('Error signing in with ID token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
    signInWithIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
