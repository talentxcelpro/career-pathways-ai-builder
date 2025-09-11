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
      console.log('Google One Tap credential received');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Google One Tap sign-in error:', error);
        toast.error('Failed to sign in with Google. Please try again.');
        onError?.(error.message);
        return;
      }

      if (data.session) {
        console.log('Google One Tap sign-in successful');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      toast.error('Google sign in failed. Please try again.');
      onError?.(error.message);
    }
  }, [onSuccess, onError]);

  const initializeGoogleOneTap = useCallback(() => {
    if (!window.google || disabled) return;

    // Enable One Tap for production domain and localhost for testing
    const hostname = window.location.hostname;
    const isProduction = hostname === 'talentxcel.in' || hostname === 'www.talentxcel.in';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (!isProduction && !isLocalhost) {
      console.warn('Google One Tap disabled on this origin:', hostname);
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        context: 'signin',
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true, // Enable FedCM as required by Google
        ux_mode: 'popup', // Use popup mode for better reliability
      });

      // Show the One Tap prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google One Tap not displayed or skipped');
        }
      });
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
    }
  }, [clientId, handleCredentialResponse, autoSelect, disabled]);

  useEffect(() => {
    if (disabled) return;

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogleOneTap();
    } else {
      // Wait for the script to load
      const checkGoogleLoaded = () => {
        if (window.google) {
          initializeGoogleOneTap();
        } else {
          setTimeout(checkGoogleLoaded, 100);
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