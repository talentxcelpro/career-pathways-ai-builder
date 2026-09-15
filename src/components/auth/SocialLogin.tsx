
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { GOOGLE_CLIENT_ID, loadGoogleIdentityServices } from '@/config/googleAuth';

interface SocialLoginProps {
  variant?: 'default' | 'prominent';
  showText?: boolean;
}

const isDev = import.meta.env?.DEV ?? false;

export const SocialLogin: React.FC<SocialLoginProps> = ({
  variant = 'default',
  showText = true
}) => {
  const [loading, setLoading] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const gsiButtonRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleCredentialResponse = useCallback(async (response: { credential?: string }) => {
    if (loadingRef.current) return; // prevent duplicate submissions
    const credential = response?.credential;

    if (!credential) {
      toast.error('Google did not return a sign-in token. Please try again.');
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) {
        if (isDev) console.error('signInWithIdToken error:', error);
        toast.error('Failed to sign in with Google. Please try again.');
        return;
      }

      if (!data.session) {
        toast.error('Google sign in did not create a session. Please try again.');
        return;
      }

      toast.success('Welcome to TalentXcel!');

      // Ensure user profile slug is properly set to first-middle-last or first-last
      if (data.user) {
        try {
          const { ensureUserProfileSlug } = await import('@/utils/userProfileSlug');
          const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
          await ensureUserProfileSlug(data.user.id, metaName, data.user.email);
        } catch (e) {
          console.warn('Silent slug ensure error:', e);
        }
      }

      window.location.replace(targetUrl);
    } catch (error: any) {
      if (isDev) console.error('Google sign in error:', error);
      toast.error('Google sign in failed. Please try again.');
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleFallbackClick = useCallback(async () => {
    if (loadingRef.current) return;
    try {
      await loadGoogleIdentityServices();
      const google = (window as any).google;
      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          context: 'signin',
          itp_support: true,
        });
        google.accounts.id.prompt();
      }
    } catch (e) {
      if (isDev) console.error('Fallback Google sign in error:', e);
    }
  }, [handleCredentialResponse]);

  const handleLinkedInSignIn = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      // Don't use skipBrowserRedirect — let Supabase manage PKCE verifier storage naturally
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid profile email',
        },
      });

      if (error) {
        toast.error(error.message || 'LinkedIn sign in failed.');
        loadingRef.current = false;
        setLoading(false);
      }
      // If no error, browser will redirect to LinkedIn automatically
    } catch (err: any) {
      toast.error('LinkedIn sign in error.');
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Initialize Google Identity Services and render the real (transparent) Google
  // button on top of the existing TalentXcel-styled button so the click goes
  // straight to Google — never to Supabase's /auth/v1/authorize endpoint.
  useEffect(() => {
    let cancelled = false;

    loadGoogleIdentityServices()
      .then(() => {
        if (cancelled) return;
        const google = (window as any).google;
        if (!google?.accounts?.id || !gsiButtonRef.current) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
          context: 'signin',
          auto_select: false,
          itp_support: true,
        });

        gsiButtonRef.current.innerHTML = '';
        google.accounts.id.renderButton(gsiButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 380,
          logo_alignment: 'center',
        });

        setGsiReady(true);
      })
      .catch((error) => {
        if (isDev) console.error('Google Identity Services failed to load:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [handleCredentialResponse]);

  const buttonClass = variant === 'prominent'
    ? "h-12 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
    : "h-10 text-xs font-semibold shadow-sm hover:shadow transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg";

  return (
    <div className="space-y-3">
      {variant === 'prominent' && (
        <div className="text-center mb-3">
          <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ⚡ Fast Login
          </p>
          <p className="text-xs text-muted-foreground font-medium">Sign up with one click</p>
        </div>
      )}

      <div className="relative group">
        <Button
          type="button"
          disabled={loading}
          onClick={handleFallbackClick}
          aria-label="Continue with Google"
          className={`w-full ${buttonClass} transition-all duration-200 flex items-center justify-center gap-3 py-3 cursor-pointer`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {showText && (
            <span className="font-semibold text-slate-800">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          )}
        </Button>

        {/* Real Google Identity Services button, transparent and stretched over
            the styled button above. Hidden while a sign-in is in flight. */}
        <div
          ref={gsiButtonRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-0 [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full cursor-pointer"
          style={{
            pointerEvents: loading ? 'none' : 'auto',
            colorScheme: 'light',
          }}
        />
      </div>

      {/* LinkedIn OIDC Sign-In */}
      <Button
        type="button"
        disabled={loading}
        onClick={handleLinkedInSignIn}
        aria-label="Continue with LinkedIn"
        className={`w-full ${buttonClass} bg-[#0A66C2] hover:bg-[#004182] text-white border-none transition-all duration-200 flex items-center justify-center gap-3 py-3 cursor-pointer`}
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
        </svg>
        {showText && (
          <span className="font-semibold text-white">
            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
          </span>
        )}
      </Button>

      {variant === 'prominent' && (
        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      )}
    </div>
  );
};

