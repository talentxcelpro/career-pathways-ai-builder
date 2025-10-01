import { useEffect, useState } from 'react';

export const AsyncGoogleOneTap = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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

    // Load immediately for instant Google One Tap
    loadGoogleOneTap();
  }, []);

  return null; // This component doesn't render anything
};
