
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        setStatus('processing');
        
        // Check for auth code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          console.error('OAuth error from URL:', error);
          setStatus('error');
          toast.error(`Sign in failed: ${error}`);
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }
        
        if (code) {
          console.log('Found auth code, exchanging for session...');
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            toast.error('Sign in failed. Please try again.');
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
          }

          if (data.session && data.session.user) {
            console.log('OAuth authentication successful:', data.user);
            setStatus('success');
            toast.success('Successfully signed in!');
            navigate('/network', { replace: true });
          } else {
            console.log('No session after code exchange');
            setStatus('error');
            toast.error('Sign in failed. Please try again.');
            setTimeout(() => navigate('/auth/login'), 2000);
          }
        } else {
          // Fallback to getting current session
          console.log('No auth code found, checking current session...');
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            toast.error('Sign in failed. Please try again.');
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
          }

          if (data.session && data.session.user) {
            console.log('Found existing session');
            setStatus('success');
            toast.success('Successfully signed in!');
            navigate('/network', { replace: true });
          } else {
            console.log('No session found');
            setStatus('error');
            toast.error('Sign in failed. Please try again.');
            setTimeout(() => navigate('/auth/login'), 2000);
          }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Signing you in...</h2>
            <p className="text-gray-600">Please wait while we complete your sign in</p>
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
