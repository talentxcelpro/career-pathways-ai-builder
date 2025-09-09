
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
    throw new Error('useAuth must be used within an AuthProvider');
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
      if (error) throw error;
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Current URL:', window.location.href);
        
        // Synchronous state updates only
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing data');
          // Clear any cached data immediately
          localStorage.clear();
          sessionStorage.clear();
          // Force redirect to index page after logout
          setTimeout(() => {
            if (mounted && window.location.pathname !== '/') {
              console.log('Redirecting to home after signout');
              navigate('/', { replace: true });
            }
          }, 0);
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, session:', session);
          // Check if we're on auth pages or home and redirect appropriately
          setTimeout(() => {
            if (mounted) {
              const currentPath = window.location.pathname;
              console.log('Current path after signin:', currentPath);
              
              // If on auth pages, redirect to onboarding first, then dashboard
              if (currentPath.startsWith('/auth')) {
                navigate('/onboarding?flow=resume&type=candidate', { replace: true });
              } else if (currentPath === '/') {
                const redirectPath = window.location.hostname === 'employer.talentxcel.in' ? '/employer' : '/network';
                navigate(redirectPath, { replace: true });
              }
            }
          }, 100); // Slightly longer delay to ensure navigation works
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't clear session on network errors
          if (!error.message.includes('network') && !error.message.includes('timeout')) {
            localStorage.clear();
            sessionStorage.clear();
          }
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else if (mounted) {
          console.log('Session found:', !!session, session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Validate session if it exists
          if (session) {
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at;
            
            if (expiresAt && now >= expiresAt) {
              console.log('Session expired, clearing...');
              await supabase.auth.signOut();
              return;
            }
          }
          
          // Auto-redirect logic with timeout to prevent blocking
          if (session?.user) {
            const currentPath = window.location.pathname;
            console.log('Auto-redirect check:', currentPath);
            
            if (currentPath === '/') {
              setTimeout(() => {
                if (mounted) {
                  const redirectPath = window.location.hostname === 'employer.talentxcel.in' ? '/employer' : '/network';
                  console.log('Auto-redirecting to', redirectPath);
                  navigate(redirectPath, { replace: true });
                }
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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
