import React, { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GOOGLE_CLIENT_ID } from '@/config/googleAuth';
import { isAllowedAuthHostname } from '@/config/domainArchitecture';

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

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
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
    console.warn('[GoogleOneTap] Nonce generation fallback:', err);
  }
  const fallback = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { rawNonce: fallback, hashedNonce: fallback };
}

export const GoogleOneTap: React.FC<GoogleOneTapProps> = ({ 
  onSuccess, 
  onError,
  disabled = false 
}) => {
  const rawNonceRef = useRef<string | null>(null);

  const handleCredentialResponse = useCallback(async (response: any) => {
    if (!response.credential) {
      onError?.('No credential received from Google');
      return;
    }

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
        console.error('Google sign-in error:', error);
        onError?.(error.message);
        toast.error('Sign-in failed: ' + error.message);
        return;
      }

      if (data?.user) {
        toast.success('Welcome! Signed in successfully');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      onError?.(error?.message || 'Authentication failed');
      toast.error('Authentication failed: ' + (error?.message || 'Unknown error'));
    }
  }, [onSuccess, onError]);

  const initializeGoogleOneTap = useCallback(async () => {
    if (!window.google?.accounts?.id || disabled) return;

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (!isAllowedAuthHostname(hostname)) return;

    try {
      const { rawNonce, hashedNonce } = await generateNonce();
      rawNonceRef.current = rawNonce;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: 'signin',
        nonce: hashedNonce,
        ux_mode: 'popup',
        itp_support: true,
      });

      // Show the One Tap prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log('Google One Tap not displayed:', notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.log('Google One Tap skipped:', notification.getSkippedReason());
        }
      });
    } catch (error) {
      console.error('Google One Tap initialization error:', error);
    }
  }, [handleCredentialResponse, disabled]);

  useEffect(() => {
    // Load Google One Tap script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogleOneTap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOneTap;
      script.onerror = () => {
        console.error('Failed to load Google One Tap script');
        onError?.('Failed to load Google authentication');
      };
      
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    const cleanup = loadGoogleScript();
    return cleanup;
  }, [initializeGoogleOneTap, onError]);

  // Component cleanup when unmounts
  useEffect(() => {
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return null; // One Tap is rendered automatically by Google
};