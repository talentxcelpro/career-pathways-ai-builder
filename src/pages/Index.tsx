
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { FastIndex } from './FastIndex';
import { GoogleOneTapLogin } from '@/components/auth/GoogleOneTapLogin';
import TestEmailSender from '@/components/dev/TestEmailSender';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [disableOneTap, setDisableOneTap] = useState(false);
  const enableTestSend = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('send_emails') === '1';

  // Immediate auth check - no loading states for instant page load
  useEffect(() => {
    // Detect iOS Safari to avoid potential One Tap issues
    try {
      const ua = navigator.userAgent || '';
      const isIOS = /iP(hone|od|ad)/.test(ua);
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
      setDisableOneTap(isIOS && isSafari);
    } catch {
      setDisableOneTap(false);
    }

    // Ultra-fast auth check with immediate rendering
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          // Auto-redirect immediately - no loading state
          window.location.replace('/network');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      setAuthChecked(true);
    };

    checkAuth();

    // Listen for auth changes for auto-login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Immediate redirect on login
        window.location.replace('/network');
      } else {
        setIsLoggedIn(false);
        setAuthChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't show anything until auth check is complete to avoid flash
  if (!authChecked) {
    return null; // Instant load - no loading spinner
  }

  return (
    <>
      {enableTestSend && <TestEmailSender />}
      {!disableOneTap && <GoogleOneTapLogin autoSelect />}
      <FastIndex />
    </>
  );
};

export default Index;
