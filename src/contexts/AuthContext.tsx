// Production-ready authentication context with improved session management
import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
      loading: true,
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
  const navigate = useNavigate();
  const authStateRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            if (ENV.isDevelopment) {
              console.log('🔐 Auth state changed:', event, !!session);
            }
            
            // Defer any additional Supabase calls to prevent deadlock
            setTimeout(() => {
              if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
              }
            }, 0);
          }
        );
        
        // Store subscription for cleanup
        authStateRef.current = subscription;
        
        // THEN check for existing session with error handling
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            if (ENV.isDevelopment) {
              console.warn('⚠️ Session check error:', error);
            }
            // Don't throw - just set to null state
            if (mounted) {
              setSession(null);
              setUser(null);
              setLoading(false);
            }
          } else {
            if (mounted) {
              if (ENV.isDevelopment) {
                console.log('✅ Session initialized:', !!session);
              }
              setSession(session);
              setUser(session?.user ?? null);
              setLoading(false);
            }
          }
        } catch (sessionError) {
          // Handle auth session missing error gracefully
          if (ENV.isDevelopment) {
            console.warn('⚠️ Auth session error (handled):', sessionError);
          }
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
        
      } catch (error) {
        if (ENV.isDevelopment) {
          console.error('❌ Auth initialization failed:', error);
        }
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authStateRef.current) {
        authStateRef.current.unsubscribe();
      }
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error && ENV.isDevelopment) {
        console.error('❌ Sign out error:', error);
      }
      
      // Clear state immediately regardless of server response
      setSession(null);
      setUser(null);
      setLoading(false);
      
      // Navigate to home after logout
      navigate('/');
      
    } catch (error) {
      if (ENV.isDevelopment) {
        console.error('❌ Sign out failed:', error);
      }
      // Clear state anyway for security
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  }, [navigate]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        if (ENV.isDevelopment) {
          console.warn('⚠️ Session refresh failed:', error);
        }
        // If refresh fails, clear the session for security
        setSession(null);
        setUser(null);
        return;
      }
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }
    } catch (error) {
      if (ENV.isDevelopment) {
        console.error('❌ Session refresh error:', error);
      }
      setSession(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signOut,
    refreshSession
  }), [user, session, loading, signOut, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};