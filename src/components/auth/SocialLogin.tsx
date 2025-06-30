
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Chrome, Loader2 } from 'lucide-react';

interface SocialLoginProps {
  variant?: 'default' | 'prominent';
  showText?: boolean;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ 
  variant = 'default',
  showText = true 
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      console.log('Starting Google OAuth flow...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error('Failed to sign in with Google. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Google OAuth initiated successfully');
      // The redirect will handle the loading state
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Google sign in failed. Please try again.');
      setLoading(false);
    }
  };

  const buttonClass = variant === 'prominent' 
    ? "h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
    : "h-10";

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className={`w-full ${buttonClass} border-2 hover:bg-blue-50 hover:border-blue-300 group`}
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 mr-3 animate-spin" />
        ) : (
          <Chrome className="h-5 w-5 mr-3 text-blue-600 group-hover:text-blue-700" />
        )}
        {showText && (
          <span className="text-gray-700 group-hover:text-gray-900">
            {loading ? 'Signing in...' : 'Continue with Google'}
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
