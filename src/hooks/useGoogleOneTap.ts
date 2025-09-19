import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleOneTapConfig {
  clientId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoSelect?: boolean;
  disabled?: boolean;
}

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

export const useGoogleOneTap = ({
  clientId,
  onSuccess,
  onError,
  autoSelect = true,
  disabled = false
}: GoogleOneTapConfig) => {
  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Google One Tap sign-in error:', error);
        }
        toast.error('Failed to sign in with Google. Please try again.');
        onError?.(error.message);
        return;
      }

      if (data.session) {
        toast.success('Welcome back!');
        onSuccess?.();
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google One Tap error:', error);
      }
      toast.error('Google sign in failed. Please try again.');
      onError?.(error.message);
    }
  }, [onSuccess, onError]);

  const initializeGoogleOneTap = useCallback(() => {
    if (!window.google || disabled) return;

    const hostname = window.location.hostname;
    const isProduction = hostname.includes('talentxcel.in');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLovablePreview = hostname.includes('lovableproject.com');
    
    if (!isProduction && !isLocalhost && !isLovablePreview) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Google One Tap disabled on origin:', hostname);
      }
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        context: 'signin',
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup',
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (process.env.NODE_ENV === 'development' && 
            (notification.isNotDisplayed() || notification.isSkippedMoment())) {
          console.log('Google One Tap not displayed or skipped');
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to initialize Google One Tap:', error);
      }
    }
  }, [clientId, handleCredentialResponse, autoSelect, disabled]);

  useEffect(() => {
    if (disabled) return;

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogleOneTap();
    } else {
      // Wait for the script to load with retry limit
      let retryCount = 0;
      const maxRetries = 50; // 5 seconds max
      const checkGoogleLoaded = () => {
        if (window.google) {
          initializeGoogleOneTap();
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkGoogleLoaded, 100);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Google One Tap script failed to load after 5 seconds');
          }
        }
      };
      checkGoogleLoaded();
    }
  }, [initializeGoogleOneTap, disabled]);

  const cancelPrompt = useCallback(() => {
    if (window.google?.accounts?.id?.cancel) {
      window.google.accounts.id.cancel();
    }
  }, []);

  return { cancelPrompt };
};