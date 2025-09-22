// Production-ready authentication context with improved session management
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
      loading: false,
      signOut: async () => {},
      refreshSession: async () => {}
    };
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authInitialized = useRef(false);
  const navigate = useNavigate();

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }

      setUser(session?.user ?? null);
      setSession(session);
    } catch (error: any) {
      console.warn('Session refresh failed:', error.message);
      setUser(null);
      setSession(null);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    try {
      // Clear any invalid stored sessions first
      const storedSession = localStorage.getItem('sb-dthlgsnakhoftinssokm-auth-token');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (!parsed || !parsed.access_token) {
            localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
          }
        } catch {
          localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
        }
      }

      // Get initial session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 10000)
      );
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;

      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }

      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    } catch (error: any) {
      console.warn('Auth initialization error:', error.message);
      
      // Clear any corrupted auth data
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Update state synchronously to avoid deadlocks
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);
        
        // Handle auth events
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
        }
      }
    );

    // Initialize auth after setting up listener
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      setUser(null);
      setSession(null);
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};