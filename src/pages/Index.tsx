
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

  // Detect iOS Safari asynchronously
  useEffect(() => {
    setTimeout(() => {
      try {
        const ua = navigator.userAgent || '';
        const isIOS = /iP(hone|od|ad)/.test(ua);
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
        setDisableOneTap(isIOS && isSafari);
      } catch {
        setDisableOneTap(false);
      }
    }, 100);
  }, []);

  // Handle redirect after render for logged-in users
  useEffect(() => {
    if (user && !loading) {
      console.log('🚀 Redirecting logged-in user to /network');
      window.location.href = '/network';
    }
  }, [user, loading]);

  // Render immediately - no loading state blocking
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
