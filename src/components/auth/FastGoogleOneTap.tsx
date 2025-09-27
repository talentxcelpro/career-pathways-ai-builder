import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface FastGoogleOneTapProps {
  onSuccess?: () => void;
  autoSelect?: boolean;
  disabled?: boolean;
}

export const FastGoogleOneTap: React.FC<FastGoogleOneTapProps> = ({
  onSuccess,
  autoSelect = true,
  disabled = false
}) => {
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  // Using the existing Google OAuth Client ID
  const GOOGLE_CLIENT_ID = "888146676949-fl3fn4ijhgduneqmmpbbpamlio30lm8g.apps.googleusercontent.com";

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      console.log('🔐 Google One Tap credential received');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Google One Tap sign-in error:', error);
        toast.error('Failed to sign in with Google');
        return;
      }

      if (data.session) {
        console.log('✅ Google One Tap sign-in successful');
        toast.success('Welcome back! Signed in with Google');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      toast.error('Google sign in failed');
    }
  }, [onSuccess]);

  const initializeGoogleOneTap = useCallback(() => {
    if (!window.google || disabled || user || initializedRef.current) return;

    const hostname = window.location.hostname;
    const isAllowedOrigin = 
      hostname === 'talentxcel.in' || 
      hostname === 'www.talentxcel.in' ||
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.includes('lovableproject.com');
    
    if (!isAllowedOrigin) {
      console.warn('Google One Tap disabled on origin:', hostname);
      return;
    }

    try {
      initializedRef.current = true;
      
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        context: 'signin',
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
        ux_mode: 'popup',
        itp_support: true,
      });

      // Show the One Tap prompt immediately
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log('Google One Tap not displayed - user may have dismissed it previously');
        } else if (notification.isSkippedMoment()) {
          console.log('Google One Tap skipped');
        }
      });

      console.log('🚀 Google One Tap initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
      initializedRef.current = false;
    }
  }, [handleCredentialResponse, autoSelect, disabled, user]);

  const loadGoogleScript = useCallback(() => {
    if (scriptLoadedRef.current || disabled) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      // Small delay to ensure Google SDK is fully loaded
      setTimeout(initializeGoogleOneTap, 50);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google authentication script');
    };

    document.head.appendChild(script);
  }, [initializeGoogleOneTap, disabled]);

  useEffect(() => {
    // Don't show if user is already logged in
    if (disabled || user) return;

    if (window.google) {
      initializeGoogleOneTap();
    } else {
      loadGoogleScript();
    }

    return () => {
      // Cleanup on unmount
      if (window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
    };
  }, [initializeGoogleOneTap, loadGoogleScript, disabled, user]);

  // Reset initialization when user logs out
  useEffect(() => {
    if (!user) {
      initializedRef.current = false;
    }
  }, [user]);

  return null; // This component doesn't render anything visible
};