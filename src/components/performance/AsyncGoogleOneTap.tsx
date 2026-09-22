import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AsyncGoogleOneTap = () => {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If user is already authenticated or session exists in localStorage, skip
    if (user) return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const item = localStorage.getItem(key);
          if (item && item.includes('"access_token"')) return;
        }
      }
    } catch {}

    // Load Google One Tap asynchronously after initial render
    const loadGoogleOneTap = () => {
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        setLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google One Tap loaded asynchronously');
        setLoaded(true);
      };

      script.onerror = () => {
        console.warn('⚠️ Failed to load Google One Tap');
      };

      document.head.appendChild(script);
    };

    // Load immediately for guests only
    loadGoogleOneTap();
  }, [user]);

  return null; // This component doesn't render anything
};
