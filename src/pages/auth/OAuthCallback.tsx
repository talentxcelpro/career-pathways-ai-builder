
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'retrying'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // ── Parse both search params and hash fragment ──────────────────────
        const requestUrl = new URL(window.location.href);

        // Supabase can put error in hash OR search params
        const hashParams   = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const errorCode    = requestUrl.searchParams.get('error')    || hashParams.get('error');
        const errorDesc    = requestUrl.searchParams.get('error_description') || hashParams.get('error_description');

        // ── Detect the GoTrue NULL column bug and auto-retry ─────────────
        const isNullBug = errorCode === 'server_error' &&
          (errorDesc?.includes('Scan error') || errorDesc?.includes('NULL') || errorDesc?.includes('converting NULL'));

        if (isNullBug) {
          console.warn('[OAuthCallback] GoTrue NULL column bug detected, auto-retrying LinkedIn OAuth…');
          setStatus('retrying');
          // Small delay so the user sees the retrying state, then re-initiate
          await new Promise(r => setTimeout(r, 800));
          const { error: retryError } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: 'openid profile email',
            },
          });
          if (retryError) {
            setStatus('error');
            toast.error('LinkedIn sign in failed. Please try again.');
            setTimeout(() => window.location.replace('/auth/login'), 2500);
          }
          // browser will redirect to LinkedIn — nothing more to do
          return;
        }

        // ── Normal error (not the NULL bug) ──────────────────────────────
        if (errorCode) {
          console.error('[OAuthCallback] Auth error:', errorCode, errorDesc);
          setStatus('error');
          toast.error(errorDesc ? decodeURIComponent(errorDesc) : 'Sign in failed. Please try again.');
          setTimeout(() => window.location.replace('/auth/login'), 2500);
          return;
        }

        // ── PKCE code exchange ────────────────────────────────────────────
        const code = requestUrl.searchParams.get('code');
        if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && exchangeData?.session) {
            setStatus('success');
            toast.success('Signed in successfully!');
            window.location.replace('/network');
            return;
          }
          if (exchangeError) {
            console.error('[OAuthCallback] Code exchange error:', exchangeError);
          }
        }

        // ── Fallback: check existing session ─────────────────────────────
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[OAuthCallback] getSession error:', error);
          setStatus('error');
          toast.error('Sign in failed. Please try again.');
          setTimeout(() => window.location.replace('/auth/login'), 2500);
          return;
        }

        if (data.session?.user) {
          setStatus('success');
          window.location.replace('/network');
        } else {
          setStatus('error');
          toast.error('Sign in failed. Please try again.');
          setTimeout(() => window.location.replace('/auth/login'), 2500);
        }
      } catch (err) {
        console.error('[OAuthCallback] Unexpected error:', err);
        setStatus('error');
        toast.error('Sign in failed. Please try again.');
        setTimeout(() => navigate('/auth/login'), 2500);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {(status === 'processing' || status === 'retrying') && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {status === 'retrying' ? 'Reconnecting…' : 'Signing you in...'}
            </h2>
            <p className="text-gray-600">
              {status === 'retrying' ? 'One moment, retrying your LinkedIn sign in' : 'Please wait while we complete your sign in'}
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Welcome!</h2>
            <p className="text-gray-600">Redirecting to your network...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Sign In Failed</h2>
            <p className="text-gray-600">Redirecting to sign in page...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
