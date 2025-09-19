import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Fast auth hook with minimal overhead
export const useFastAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Cache the session in sessionStorage for instant loading
  const cacheSession = useCallback((session: Session | null) => {
    try {
      if (session) {
        sessionStorage.setItem('fast_session_cache', JSON.stringify({
          user: session.user,
          expires_at: session.expires_at,
          cached_at: Date.now()
        }));
      } else {
        sessionStorage.removeItem('fast_session_cache');
      }
    } catch (error) {
      // Ignore sessionStorage errors
    }
  }, []);

  // Get cached session for instant loading
  const getCachedSession = useCallback(() => {
    try {
      const cached = sessionStorage.getItem('fast_session_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const isExpired = parsed.expires_at && Date.now() / 1000 > parsed.expires_at;
        const isTooOld = Date.now() - parsed.cached_at > 5 * 60 * 1000; // 5 minutes
        
        if (!isExpired && !isTooOld) {
          return parsed.user;
        }
      }
    } catch (error) {
      // Ignore cache errors
    }
    return null;
  }, []);

  // Fast login function
  const fastLogin = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        cacheSession(data.session);
        return { success: true, user: data.user };
      }
    } catch (error: any) {
      toast.error('Login failed');
      return { success: false, error };
    } finally {
      setIsAuthenticating(false);
    }
  }, [cacheSession]);

  // Fast signup function
  const fastSignup = useCallback(async (email: string, password: string, fullName?: string) => {
    setIsAuthenticating(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        cacheSession(data.session);
        toast.success('Account created successfully! 🎉');
        return { success: true, user: data.user };
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to verify your account');
        return { success: true, user: data.user };
      }
    } catch (error: any) {
      toast.error('Signup failed');
      return { success: false, error };
    } finally {
      setIsAuthenticating(false);
    }
  }, [cacheSession]);

  // Logout function
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    cacheSession(null);
  }, [cacheSession]);

  useEffect(() => {
    // Load cached session first for instant UI
    const cached = getCachedSession();
    if (cached) {
      setUser(cached);
      setIsLoading(false);
    }

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        cacheSession(session);
        
        if (!cached) {
          setIsLoading(false);
        }
      }
    );

    // Get actual session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      cacheSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [getCachedSession, cacheSession]);

  return {
    user,
    session,
    isLoading,
    isAuthenticating,
    fastLogin,
    fastSignup,
    logout
  };
};