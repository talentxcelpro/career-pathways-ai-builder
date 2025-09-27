
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from 'react-error-boundary';
import { LandingPage } from '@/components/landing/LandingPage';
import { GoogleOneTapLogin } from '@/components/auth/GoogleOneTapLogin';
import { FinalLaunchRunner } from '@/components/deployment/FinalLaunchRunner';
import { LaunchStatusSummary } from '@/components/admin/LaunchStatusSummary';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [disableOneTap, setDisableOneTap] = useState(false);
  
  const showFinalLaunch = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('final_launch') === '1';
  const showLaunchStatus = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('launch_status') === '1';

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
    console.log('🔍 INDEX: Starting auth check...');
    
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 INDEX: Auth state changed:', event, !!session);
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

    // Then check existing session
    const checkUser = async () => {
      try {
        console.log('👤 INDEX: Checking existing user session...');
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.warn('⚠️ INDEX: Auth check error:', error);
        }
        console.log('✅ INDEX: Auth check complete:', !!user);
        setIsLoggedIn(!!user);
        setAuthChecked(true);
      } catch (err) {
        console.error('❌ INDEX: Auth check failed:', err);
        setAuthChecked(true); // Still mark as checked to prevent infinite loading
      }
    };
    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  // Debug logging for render states
  console.log('🎯 INDEX: Render state - authChecked:', authChecked, 'isLoggedIn:', isLoggedIn);

  // Redirect logged-in users after auth check completes
  if (authChecked && isLoggedIn) {
    console.log('🚀 Redirecting logged-in user to /network');
    return <Navigate to="/network" replace />;
  }

  // Show loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading TalentXcel...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading home...</div>
        </div>
      )}
    >
      {!disableOneTap && !authChecked && (
        <div className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm text-muted-foreground">
          Looking for your Google account...
        </div>
      )}
      {!disableOneTap && <GoogleOneTapLogin autoSelect />}
      {showFinalLaunch ? <FinalLaunchRunner /> : showLaunchStatus ? <LaunchStatusSummary /> : <LandingPage />}
    </ErrorBoundary>
  );
};

export default Index;
