
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const getSafeNextPath = (nextPath: string | null) => {
      if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
        return '/career-os';
      }

      return nextPath;
    };

    const handleAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback...');
        setStatus('processing');

        const url = new URL(window.location.href);
        console.log('[AuthCallback] Current URL:', url.href);
        
        const nextPath = getSafeNextPath(url.searchParams.get('next'));
        const code = url.searchParams.get('code');
        const errorDescription = url.searchParams.get('error_description') || url.searchParams.get('error');

        if (errorDescription) {
          console.error('[AuthCallback] OAuth provider error:', errorDescription);
          setStatus('error');
          toast.error('Sign in failed: ' + errorDescription);
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        if (code) {
          console.log('[AuthCallback] Exchanging code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('[AuthCallback] Exchange error:', exchangeError);
            // Don't return yet, session might be recovered anyway
          }
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setStatus('error');
          toast.error('Sign in failed. Please try again.');
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        if (session && session.user) {
          console.log('[AuthCallback] Authentication successful for:', session.user.email);
          setStatus('success');
          // Add a small delay to ensure session is fully persisted
          setTimeout(() => navigate(nextPath, { replace: true }), 500);
        } else {
          console.log('[AuthCallback] No session established');
          setStatus('error');
          toast.error('Sign in failed. Please try again.');
          setTimeout(() => navigate('/auth/login'), 2000);
        }
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setStatus('error');
        toast.error('Sign in failed. Please try again.');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl text-center max-w-md w-full p-10 transform transition-all">
        {status === 'processing' && (
          <div className="space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating</h2>
              <p className="text-gray-500 font-medium">Finalizing your secure login...</p>
            </div>
            <div className="pt-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto scale-110">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Success!</h2>
              <p className="text-green-700 font-medium">Authentication complete. Redirecting...</p>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">Login Issue</h2>
              <p className="text-red-700 font-medium">We couldn't synchronize your session.</p>
            </div>
            <button 
              onClick={() => navigate('/auth/login')}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-mono break-all opacity-50">
            {window.location.href}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
