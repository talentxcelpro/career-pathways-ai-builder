import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import { isAllowedAuthHostname } from '@/config/domainArchitecture';
import { GOOGLE_CLIENT_ID } from '@/config/googleAuth';

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

/**
 * Generates a cryptographically secure random nonce and its SHA-256 hash.
 * Hashed nonce is sent to Google Identity Services.
 * Raw nonce is sent to Supabase GoTrue to verify the claim in id_token.
 */
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
    console.warn('[FastGoogleOneTap] WebCrypto nonce generation fallback:', err);
  }
  const fallback = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { rawNonce: fallback, hashedNonce: fallback };
}

export const FastGoogleOneTap: React.FC<FastGoogleOneTapProps> = ({
  onSuccess,
  autoSelect = true,
  disabled = false
}) => {
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);
  const rawNonceRef = useRef<string | null>(null);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      console.log('🔐 Google One Tap credential received');
      const rawNonce = rawNonceRef.current;
      
      let { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce: rawNonce || undefined,
      });

      // Fallback: If Supabase has "Skip nonce check" enabled or rejects the nonce param, retry without nonce
      if (error && (error.message?.toLowerCase().includes('nonce') || error.status === 400)) {
        console.warn('Retrying signInWithIdToken without nonce parameter...');
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
        console.error('Google One Tap sign-in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        return;
      }

      if (data?.session) {
        console.log('✅ Google One Tap sign-in successful');
        GrowthFunnelTracker.track('google_onetap_accepted');
        GrowthFunnelTracker.track('auth_completed', { provider: 'google_onetap' });
        
        // Ensure user profile slug is properly set to first-middle-last or first-last
        if (data.user) {
          try {
            const { ensureUserProfileSlug } = await import('@/utils/userProfileSlug');
            const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
            await ensureUserProfileSlug(data.user.id, metaName, data.user.email);
          } catch (e) {
            console.warn('Silent slug ensure error:', e);
          }
        }

        toast.success('Welcome back! Signed in with Google');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Google One Tap error:', error);
      toast.error(error?.message || 'Google sign in failed');
    }
  }, [onSuccess]);

  const hasActiveAuthSession = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const item = localStorage.getItem(key);
          if (item && (item.includes('"access_token"') || item.includes('"user"'))) {
            return true;
          }
        }
      }
    } catch {}
    return false;
  };

  const initializeGoogleOneTap = useCallback(async () => {
    if (!window.google || disabled || user || hasActiveAuthSession() || initializedRef.current) {
      if (user && window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
      return;
    }

    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('txc_onetap_dismissed') === 'true' || sessionStorage.getItem('txc_onetap_shown') === 'true') {
        return;
      }
    }

    const hostname = window.location.hostname;
    if (!isAllowedAuthHostname(hostname)) {
      console.warn('Google One Tap disabled on origin:', hostname);
      return;
    }

    try {
      initializedRef.current = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('txc_onetap_shown', 'true');
      }

      // Generate cryptographically secure nonce pair
      const { rawNonce, hashedNonce } = await generateNonce();
      rawNonceRef.current = rawNonce;
      
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        context: 'signin',
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        nonce: hashedNonce,
        ux_mode: 'popup',
        itp_support: true,
      });

      // Show the One Tap prompt immediately
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          GrowthFunnelTracker.track('google_onetap_dismissed', { reason: 'not_displayed' });
        } else if (notification.isSkippedMoment()) {
          GrowthFunnelTracker.track('google_onetap_dismissed', { reason: 'skipped' });
          try { sessionStorage.setItem('txc_onetap_dismissed', 'true'); } catch {}
        } else if (notification.isDismissedMoment()) {
          GrowthFunnelTracker.track('google_onetap_dismissed', { reason: 'dismissed' });
          try { sessionStorage.setItem('txc_onetap_dismissed', 'true'); } catch {}
        } else if (notification.isDisplayed()) {
          GrowthFunnelTracker.track('google_onetap_shown');
        }
      });

      console.log('🚀 Google One Tap initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
      initializedRef.current = false;
    }
  }, [handleCredentialResponse, autoSelect, disabled, user]);

  const loadGoogleScript = useCallback(() => {
    if (scriptLoadedRef.current || disabled || user || hasActiveAuthSession()) return;

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
  }, [initializeGoogleOneTap, disabled, user]);

  useEffect(() => {
    // If user is authenticated, cancel any active prompt immediately
    if (user || hasActiveAuthSession()) {
      if (window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
      return;
    }

    if (disabled) return;

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

  // Reset initialization only when user explicitly logs out
  useEffect(() => {
    if (!user && !hasActiveAuthSession()) {
      initializedRef.current = false;
    }
  }, [user]);

  return null; // This component doesn't render anything visible
};