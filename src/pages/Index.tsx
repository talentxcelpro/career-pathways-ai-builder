
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from 'react-error-boundary';
import { LandingPage } from '@/components/landing/LandingPage';
import { GoogleOneTapIndicator } from '@/components/auth/GoogleOneTapIndicator';
import { FinalLaunchRunner } from '@/components/deployment/FinalLaunchRunner';
import { LaunchStatusSummary } from '@/components/admin/LaunchStatusSummary';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [disableOneTap, setDisableOneTap] = useState(false);
  const { user, loading } = useAuth();
  
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
  // Redirect logged-in users immediately
  if (user) {
    console.log('🚀 Redirecting logged-in user to /network');
    return <Navigate to="/network" replace />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mobile-optimized">
        <div className="text-center space-y-4 px-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading TalentXcel...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="min-h-screen flex items-center justify-center bg-background mobile-optimized">
          <div className="text-sm text-muted-foreground">Loading home...</div>
        </div>
      )}
    >
      {!disableOneTap && !user && (
        <GoogleOneTapIndicator isActive={!user} />
      )}
      {showFinalLaunch ? <FinalLaunchRunner /> : showLaunchStatus ? <LaunchStatusSummary /> : <LandingPage />}
    </ErrorBoundary>
  );
};

export default Index;
