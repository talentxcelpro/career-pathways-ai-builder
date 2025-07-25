import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LinkedInLoginProps {
  variant?: 'default' | 'prominent';
  showText?: boolean;
}

export const LinkedInLogin: React.FC<LinkedInLoginProps> = ({ 
  variant = 'default',
  showText = true 
}) => {
  const [loading, setLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    setLoading(true);

    try {
      console.log('Starting LinkedIn OAuth flow...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            scope: 'openid profile email',
          },
        },
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast.error('Failed to sign in with LinkedIn. Please try again.');
        setLoading(false);
        return;
      }

      console.log('LinkedIn OAuth initiated successfully');
      // The redirect will handle the loading state
    } catch (error: any) {
      console.error('LinkedIn login error:', error);
      toast.error('LinkedIn sign in failed. Please try again.');
      setLoading(false);
    }
  };

  const buttonClass = variant === 'prominent' 
    ? "h-9 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
    : "h-8";

  return (
    <Button
      variant="outline"
      className={`w-full ${buttonClass} border border-blue-300 hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-3 py-2.5`}
      onClick={handleLinkedInLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#0077B5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )}
      {showText && (
        <span className="text-blue-700 font-medium">
          {loading ? 'Signing in...' : 'Sign in with LinkedIn'}
        </span>
      )}
    </Button>
  );
};