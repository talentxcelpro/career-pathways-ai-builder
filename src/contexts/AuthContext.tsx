
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  signInWithIdToken: (provider: string, token: string) => Promise<{ user: User; session: Session; } | { user: null; session: null; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshSession = async (): Promise<Session | null> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
      console.log('Session refreshed successfully');
      return session;
    } catch (error) {
      console.error('Session refresh error:', error);
      // If refresh fails, clear the session
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  // Check if session is expired or about to expire
  const isSessionExpired = (session: Session | null): boolean => {
    if (!session?.expires_at) return true;
    const expirationTime = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expirationTime.getTime() - now.getTime();
    return timeUntilExpiry <= 0;
  };

  const isSessionExpiringSoon = (session: Session | null): boolean => {
    if (!session?.expires_at) return true;
    const expirationTime = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expirationTime.getTime() - now.getTime();
    // Refresh if expiring within 5 minutes
    return timeUntilExpiry <= 5 * 60 * 1000;
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          localStorage.removeItem('supabase.auth.token');
          // Force redirect to index page after logout
          navigate('/', { replace: true });
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Fast redirect for successful login
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath.startsWith('/auth')) {
            navigate('/network', { replace: true });
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session immediately
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (mounted) {
          // Check if session is expired
          if (session && isSessionExpired(session)) {
            console.log('Session expired, attempting refresh...');
            try {
              const refreshedSession = await refreshSession();
              if (refreshedSession && window.location.pathname === '/') {
                navigate('/network', { replace: true });
              }
            } catch (refreshError) {
              console.error('Failed to refresh expired session:', refreshError);
              setSession(null);
              setUser(null);
            }
          } else {
            setSession(session);
            setUser(session?.user ?? null);
            
            // Auto-redirect to network if user is already logged in and on index page
            if (session?.user && window.location.pathname === '/') {
              navigate('/network', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up session monitoring for expiry
    const sessionMonitor = setInterval(() => {
      if (session && isSessionExpiringSoon(session)) {
        console.log('Session expiring soon, refreshing...');
        refreshSession().catch((error) => {
          console.error('Failed to refresh session:', error);
        });
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(sessionMonitor);
    };
  }, [navigate, session]);

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
