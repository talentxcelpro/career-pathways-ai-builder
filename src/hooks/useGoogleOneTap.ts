import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isAllowedAuthHostname } from '@/config/domainArchitecture';

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

async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      const rawNonce = btoa(String.fromCharCode(...array));
      const encoder = new TextEncoder();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(rawNonce));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return { rawNonce, hashedNonce };
    }
  } catch (err) {
    console.warn('[useGoogleOneTap] Nonce generation fallback:', err);
  }
  const fallback = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { rawNonce: fallback, hashedNonce: fallback };
}

export const useGoogleOneTap = ({
  clientId,
  onSuccess,
  onError,
  autoSelect = true,
  disabled = false
}: GoogleOneTapConfig) => {
  const rawNonceRef = useRef<string | null>(null);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      const rawNonce = rawNonceRef.current;
      let { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: rawNonce || undefined,
      });

      // Fallback: retry without nonce if Skip Nonce Check is toggled in Supabase
      if (error && (error.message?.toLowerCase().includes('nonce') || error.status === 400)) {
        const retryResult = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });
        if (!retryResult.error && retryResult.data) {
          data = retryResult.data;
          error = null;
        }
      }

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Google One Tap sign-in error:', error);
        }
        toast.error('Failed to sign in with Google: ' + error.message);
        onError?.(error.message);
        return;
      }

      if (data?.session) {
        toast.success('Welcome back!');
        onSuccess?.();
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google One Tap error:', error);
      }
      toast.error('Google sign in failed. Please try again.');
      onError?.(error?.message || 'Authentication error');
    }
  }, [onSuccess, onError]);

  const initializeGoogleOneTap = useCallback(async () => {
    if (!window.google || disabled) return;

    const hostname = window.location.hostname;
    if (!isAllowedAuthHostname(hostname)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Google One Tap disabled on origin:', hostname);
      }
      return;
    }

    try {
      const { rawNonce, hashedNonce } = await generateNonce();
      rawNonceRef.current = rawNonce;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        context: 'signin',
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        nonce: hashedNonce,
        ux_mode: 'popup',
        itp_support: true,
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