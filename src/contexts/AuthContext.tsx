// Production-ready authentication context with improved session management
import React, { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext } from 'react';
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
    throw new Error('useAuth must be used within an AuthProvider');
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
      if (!mounted) return;
      
      try {
        console.log('🔍 Starting auth check...');
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('🔐 Auth state changed:', event, !!session);
            
            // Only update state synchronously to prevent deadlock
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            // Handle auth events
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in successfully');
              localStorage.removeItem('auth_redirect');
              // Ensure user profile exists for RLS compatibility
              ensureUserProfile(session.user).catch(console.error);
            } else if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              setUser(null);
              setSession(null);
            }
          }
        );

        // THEN check for existing session
        console.log('👤 Checking existing user session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Auth check error:', error);
          // Silently handle session errors - don't throw or show error UI
          // This is normal when no session exists or session is expired
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log('✅ Auth check complete:', !!session);
          
          // Ensure user profile exists for RLS compatibility
          if (session?.user) {
            ensureUserProfile(session.user).catch(console.error);
          }
        }

        authStateRef.current = subscription;
        
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setUser(null);
          setSession(null);
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

  // Ensure user profile exists for RLS policies
  const ensureUserProfile = useCallback(async (user: User) => {
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

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
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

        if (roleError && roleError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user role:', roleError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
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