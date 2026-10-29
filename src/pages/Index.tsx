
import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from 'react-error-boundary';
import { LandingPage } from '@/components/landing/LandingPage';
import { FinalLaunchRunner } from '@/components/deployment/FinalLaunchRunner';
import { LaunchStatusSummary } from '@/components/admin/LaunchStatusSummary';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUniverse } from '@/config/domainArchitecture';

const SubdomainLandingPage = lazy(() => import('@/components/landing/SubdomainLandingPage'));
const Jobs = lazy(() => import('@/pages/Jobs'));

const Index = () => {
  const [disableOneTap, setDisableOneTap] = useState(false);
  const { user, loading } = useAuth();
  const universe = getCurrentUniverse();
  
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

  if (loading) {
    return null; // Let auth load first
  }

  const renderContent = () => {
    if (showFinalLaunch) return <FinalLaunchRunner />;
    if (showLaunchStatus) return <LaunchStatusSummary />;

    if (universe === 'JOBS') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">Loading Jobs...</div>}>
          <Jobs />
        </Suspense>
      );
    }

    if (universe !== 'CORE') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">Loading...</div>}>
          <SubdomainLandingPage universe={universe} />
        </Suspense>
      );
    }

    return <LandingPage />;
  };

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="min-h-screen flex items-center justify-center bg-background mobile-optimized">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
    >
      {renderContent()}
    </ErrorBoundary>
  );
};

export default Index;
