import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { resolvePostAuthDestination } from '@/utils/intentRouting';
import { attributeStoredReferral } from '@/utils/referralTracker';

import { syncSessionFromCrossSubdomainCookie } from '@/lib/auth/crossSubdomainStorage';

interface OptimizedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
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

const getStoredSession = (): { user: User | null; session: Session | null } => {
  if (typeof window === 'undefined') return { user: null, session: null };
  try {
    // Eagerly sync session from cross-subdomain cookie bridge if local storage is unpopulated
    syncSessionFromCrossSubdomainCookie();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user) {
            const now = Math.floor(Date.now() / 1000);
            if (!parsed.expires_at || parsed.expires_at > now) {
              return { user: parsed.user, session: parsed };
            }
          }
        }
      }
    }
  } catch {}
  return { user: null, session: null };
};

const ensureUserProfileAndAdminConnection = async (user: User) => {
  if (!user?.id) return;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const emailBase = (user.email ? user.email.split('@')[0] : 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      const fallbackUsername = `${emailBase}_${user.id.slice(0, 6)}`;
      const fullName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       (user.email ? user.email.split('@')[0] : 'TalentXcel Member');

      await supabase.from('profiles').upsert({
        id: user.id,
        username: fallbackUsername,
        full_name: fullName,
        email: user.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completed: false,
        verification_status: 'unverified'
      }, { onConflict: 'id' });

      // Automatically trigger welcome email for any new user (Google, LinkedIn, One Tap, Email)
      if (user.email) {
        const welcomeKey = 'txc_welcomed_' + user.id;
        if (typeof window !== 'undefined' && !localStorage.getItem(welcomeKey)) {
          localStorage.setItem(welcomeKey, 'true');
          fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: user.email,
              recipientName: fullName,
              template: 'welcome',
              priority: 1,
              immediate: true,
              variables: {
                first_name: fullName.split(' ')[0],
                name: fullName,
                email: user.email
              }
            })
          }).catch(err => console.warn('[AuthContext] Welcome email trigger non-fatal:', err));
        }
      }
    }

    await supabase.rpc('create_admin_connections', { target_user_id: user.id });
  } catch (err) {
    console.warn('Auto profile & connection check handled:', err);
  }
};

export const OptimizedAuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = getStoredSession();
  const [user, setUser] = useState<User | null>(initial.user);
  const [session, setSession] = useState<Session | null>(initial.session);
  const [loading, setLoading] = useState<boolean>(!initial.user);
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
          if (session?.user?.email) console.log('Auth state:', event, session.user.email);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle auth events with minimal redirects
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('subdomain_redirect');
          if (window.location.pathname !== '/') {
            navigate('/', { replace: true });
          }
        } else if (session?.user) {
          // Guarantee real-time profile existence on ANY authenticated event
          ensureUserProfileAndAdminConnection(session.user).catch(() => {});
          if (event === 'SIGNED_IN') {
            attributeStoredReferral().catch(() => {});
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/auth')) {
              const redirectPath = resolvePostAuthDestination({
                searchParams: new URLSearchParams(window.location.search),
                userMetadata: session.user.user_metadata,
              });
              navigate(redirectPath, { replace: true });
            }
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
          
          // Auto-redirect if user is already authenticated and lands on auth pages
          if (session?.user) {
            ensureUserProfileAndAdminConnection(session.user).catch(() => {});
          }
          if (session?.user && window.location.pathname.startsWith('/auth')) {
            const redirectPath = resolvePostAuthDestination({
              searchParams: new URLSearchParams(window.location.search),
              userMetadata: session.user.user_metadata,
            });
            navigate(redirectPath, { replace: true });
          } else if (session?.user && window.location.pathname === '/') {
            const subdomainRedirect = localStorage.getItem('subdomain_redirect');
            if (subdomainRedirect && subdomainRedirect !== '/network') {
              localStorage.removeItem('subdomain_redirect');
              navigate(subdomainRedirect, { replace: true });
            }
          }
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
      try {
        localStorage.removeItem('txc_saved_ats_report');
        sessionStorage.removeItem('txc_saved_ats_report');
        localStorage.removeItem('txc_active_workspace');
      } catch {}
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
    isAuthenticated: Boolean(user && session),
    signOut,
    refreshSession
  };

  return (
    <OptimizedAuthContext.Provider value={value}>
      {children}
    </OptimizedAuthContext.Provider>
  );
};