import React, { useEffect } from 'react';
import { FastGoogleOneTap } from './FastGoogleOneTap';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface GoogleOneTapLoginProps {
  disabled?: boolean;
  autoSelect?: boolean;
}

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

// Internal routes where Google One Tap must NEVER appear
const APP_ROUTE_PREFIXES = [
  '/career-map',
  '/dashboard',
  '/command-center',
  '/employer',
  '/passport',
  '/profile',
  '/settings',
  '/admin',
  '/jobs/manage',
  '/jobs/post',
  '/network',
  '/learning/my-',
  '/resume/editor',
  '/resume/wizard',
  '/launch',
  '/diagnostics',
  '/debug'
];

export const GoogleOneTapLogin: React.FC<GoogleOneTapLoginProps> = ({ 
  disabled = false,
  autoSelect = false 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cancel immediately if user is already authenticated
  useEffect(() => {
    if (user && window.google?.accounts?.id?.cancel) {
      window.google.accounts.id.cancel();
    }
  }, [user]);

  // If user is authenticated in React state, localStorage session exists, or auth is still resolving, DO NOT SHOW
  if (disabled || user || loading || hasActiveAuthSession()) {
    return null;
  }

  // If on an internal application route, DO NOT SHOW
  const isInternalRoute = APP_ROUTE_PREFIXES.some(prefix => location.pathname.startsWith(prefix));
  if (isInternalRoute) {
    return null;
  }

  // If user dismissed One Tap during this browser session, respect their dismissal
  if (typeof window !== 'undefined' && sessionStorage.getItem('txc_onetap_dismissed') === 'true') {
    return null;
  }

  const handleSuccess = () => {
    console.log('🎉 Google One Tap login successful!');
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect') || urlParams.get('returnUrl');
    const storedRedirect = localStorage.getItem('subdomain_redirect');
    
    // If user signed in while on an auth/login page, route them to target or /network
    if (window.location.pathname.startsWith('/auth') || window.location.pathname === '/') {
      const redirectPath = redirectParam || storedRedirect || '/network';
      localStorage.removeItem('subdomain_redirect');
      navigate(redirectPath, { replace: true });
    } else {
      // Content page (job, college, tool): preserve page and clear transient storage
      localStorage.removeItem('subdomain_redirect');
    }
  };

  return (
    <FastGoogleOneTap
      onSuccess={handleSuccess}
      autoSelect={autoSelect}
      disabled={false}
    />
  );
};