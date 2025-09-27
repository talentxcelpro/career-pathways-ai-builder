import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthWithRLSReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Enhanced authentication hook that integrates with RLS policies
 * Provides secure authentication state management and session handling
 */
export const useAuthWithRLS = (): UseAuthWithRLSReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔐 Auth state changed:', event, !!session);

            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session?.user,
              loading: false,
            }));

            // Handle specific auth events
            if (event === 'SIGNED_IN' && session?.user) {
              // Create or update user profile to ensure RLS compatibility
              await ensureUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
              // Clear any cached data
              localStorage.removeItem('subdomain_redirect');
            }
          }
        );

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.warn('Session check error:', error);
            setAuthState(prev => ({ ...prev, loading: false }));
          } else {
            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session?.user,
              loading: false,
            }));

            // Ensure user profile exists for RLS
            if (session?.user) {
              await ensureUserProfile(session.user);
            }
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Ensure user profile exists for RLS policies
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      // Ensure user role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!existingRole) {
        // Create default user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'user',
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (roleError) {
          console.error('Error creating user role:', roleError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait before trying again.';
        }

        return { success: false, error: errorMessage };
      }

      if (data.user) {
        await ensureUserProfile(data.user);
        return { success: true };
      }

      return { success: false, error: 'Unexpected error during login.' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Sign up method
  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata || {},
        },
      });

      if (error) {
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password should be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        }

        return { success: false, error: errorMessage };
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          toast.success('Please check your email to confirm your account.');
        }
        return { success: true };
      }

      return { success: false, error: 'Unexpected error during registration.' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error signing out. Please try again.');
      }
      
      // Clear local storage
      localStorage.removeItem('subdomain_redirect');
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out.');
    }
  }, []);

  // Refresh session method
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('Session refresh failed:', error);
        setAuthState(prev => ({
          ...prev,
          session: null,
          user: null,
          isAuthenticated: false,
        }));
        return;
      }
      
      if (session) {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session.user,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
};