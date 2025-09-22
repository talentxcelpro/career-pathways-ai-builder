import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const GoogleOneTap: React.FC<GoogleOneTapProps> = ({ 
  onSuccess, 
  onError,
  disabled = false 
}) => {
  const handleCredentialResponse = useCallback(async (response: any) => {
    if (!response.credential) {
      onError?.('No credential received from Google');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Google sign-in error:', error);
        onError?.(error.message);
        toast.error('Sign-in failed: ' + error.message);
        return;
      }

      if (data.user) {
        toast.success('Welcome! Signed in successfully');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Google One Tap error:', error);
      onError?.('Authentication failed');
      toast.error('Authentication failed');
    }
  }, [onSuccess, onError]);

  const initializeGoogleOneTap = useCallback(() => {
    if (!window.google?.accounts?.id || disabled) return;

    try {
      window.google.accounts.id.initialize({
        client_id: '946497516392-8f4mbj0r9nbnr3rctq9c7v0gu1f5gd44.apps.googleusercontent.com', // Replace with your actual Google Client ID
        callback: handleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: 'signin',
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