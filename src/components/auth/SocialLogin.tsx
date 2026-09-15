import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/utils/authRedirect';

interface SocialLoginProps {
  variant?: 'default' | 'prominent';
  showText?: boolean;
  mode?: 'sign-in' | 'sign-up';
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  variant = 'default',
  showText = true,
  mode = 'sign-in',
}) => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const helperText = mode === 'sign-up' ? 'Sign up with one click' : 'Sign in with one click';
  const loadingLabel = isNative ? 'Opening Google...' : mode === 'sign-up' ? 'Signing up...' : 'Signing in...';

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthCallbackUrl('/career-os'),
          skipBrowserRedirect: isNative,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Failed to sign in with Google. Please use email login or try again.');
        setLoading(false);
        return;
      }

      if (isNative) {
        if (!data?.url) {
          toast.error('Google sign in could not start. Please use email login.');
          setLoading(false);
          return;
        }

        await Browser.open({
          url: data.url,
          windowName: '_self',
        });

        toast.info('Complete Google sign in in the browser.');
        setTimeout(() => setLoading(false), 1000);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google sign in failed. Please use email login or try again.');
      setLoading(false);
    }
  };

  const buttonClass = variant === 'prominent'
    ? 'h-9 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]'
    : 'h-8';

  return (
    <div className="space-y-3">
      {variant === 'prominent' && (
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
            Fast Login
          </p>
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-full ${buttonClass} ${
          variant === 'prominent'
            ? 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-md'
            : 'border border-gray-300 hover:bg-gray-50'
        } transition-colors duration-200 flex items-center justify-center gap-3 py-3`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
          <span className="font-semibold">
            {loading ? loadingLabel : 'Continue with Google'}
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
