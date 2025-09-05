
import { useState, useEffect, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { LandingPage } from "@/components/landing/LandingPage";
import { GoogleOneTapLogin } from "@/components/auth/GoogleOneTapLogin";
import { ErrorBoundary } from 'react-error-boundary';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [disableOneTap, setDisableOneTap] = useState(false);

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
  // Check authentication status in background
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

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
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      }>
        {!disableOneTap && <GoogleOneTapLogin autoSelect />}
        <LandingPage />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Index;
