// Production-ready authentication hook with improved session management
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ENV } from '@/lib/environment';
import { productionConsole, validateProductionData } from '@/utils/productionCleanup';

export interface ProductionAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useProductionAuth = () => {
  const [authState, setAuthState] = useState<ProductionAuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Enhanced session refresh with retry logic
  const refreshSession = useCallback(async (retryCount = 0) => {
    try {
      productionConsole.log('Refreshing auth session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        loading: false,
        error: null,
      }));
      
      return session;
    } catch (error: any) {
      productionConsole.error('Session refresh failed:', error);
      
      // Retry logic for production stability
      if (retryCount < 2 && error.message !== 'Auth session missing!') {
        productionConsole.log(`Retrying session refresh (attempt ${retryCount + 1})`);
        setTimeout(() => refreshSession(retryCount + 1), 1000);
        return;
      }
      
      // Clear invalid session
      setAuthState(prev => ({
        ...prev,
        session: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error.message,
      }));
      
      return null;
    }
  }, []);

  // Initialize authentication
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Get initial session
        const session = await refreshSession();
        
        if (!mounted) return;
        
        // Set up auth state listener with error handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            productionConsole.log('Auth state changed:', event);
            
            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user || null,
              isAuthenticated: !!session?.user,
              loading: false,
              error: null,
            }));
            
            // Handle session events
            if (event === 'SIGNED_OUT') {
              // Clear any cached data
              localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
            }
            
            if (event === 'TOKEN_REFRESHED') {
              productionConsole.log('Token refreshed successfully');
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        productionConsole.error('Auth initialization failed:', error);
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to initialize authentication',
          }));
        }
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  // Production-safe sign out
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('sb-dthlgsnakhoftinssokm-auth-token');
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      
      productionConsole.log('User signed out successfully');
    } catch (error: any) {
      productionConsole.error('Sign out failed:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  return {
    ...authState,
    refreshSession,
    signOut,
  };
};