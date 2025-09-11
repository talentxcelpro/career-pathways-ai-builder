
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from 'react-error-boundary';
import TestEmailSender from '@/components/dev/TestEmailSender';
import { LandingPage } from '@/components/landing/LandingPage';
import { GoogleOneTapLogin } from '@/components/auth/GoogleOneTapLogin';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [disableOneTap, setDisableOneTap] = useState(false);
  const enableTestSend = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('send_emails') === '1';

  // Detect iOS Safari to avoid potential One Tap issues
  useEffect(() => {
    try {
      const ua = navigator.userAgent || '';
      const isIOS = /iP(hone|od|ad)/.test(ua);
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
      setDisableOneTap(isIOS && isSafari);
    } catch {
      setDisableOneTap(false);
    }
  }, []);
  // Fast auth check - optimized for instant loading
  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

    // Then check existing session
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    };
    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  // Redirect logged-in users after auth check completes
  if (authChecked && isLoggedIn) {
    return <Navigate to="/network" replace />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading home...</div>
        </div>
      )}
    >
      {enableTestSend && <TestEmailSender />}
      {!disableOneTap && !authChecked && (
        <div className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm text-muted-foreground">
          Looking for your Google account...
        </div>
      )}
      {!disableOneTap && <GoogleOneTapLogin autoSelect />}
      <LandingPage />
    </ErrorBoundary>
  );
};

export default Index;
