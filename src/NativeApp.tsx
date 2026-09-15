import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import { BundleErrorFallback } from '@/components/BundleErrorFallback';
import { MobileAppInitializer } from '@/components/MobileAppInitializer';
import { PageSpecificBottomNav } from '@/components/navigation/PageSpecificBottomNav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { OptimizedAuthProvider, useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import TalentXcelCore from '@/pages/TalentXcelCore';

const OAuthCallback = lazy(() => import('@/pages/auth/OAuthCallback'));
const NativeAuthPage = lazy(() => import('@/pages/auth/NativeAuthPage'));
const NativeForgotPassword = lazy(() =>
  import('@/pages/auth/NativeAuthPage').then((module) => ({ default: module.NativeForgotPassword }))
);
const NativeResetPassword = lazy(() =>
  import('@/pages/auth/NativeAuthPage').then((module) => ({ default: module.NativeResetPassword }))
);
const Network = lazy(() => import('@/pages/Network'));
const PerformanceIndex = lazy(() => import('@/pages/TalentScorePage'));
const TalentBeacon = lazy(() => import('@/pages/jobs/TalentBeacon'));
const NavigatorPage = lazy(() => import('@/pages/ai/NavigatorPage'));
const Jobs = lazy(() => import('@/pages/Jobs'));
const Profile = lazy(() => import('@/pages/Profile'));
const ResumeHub = lazy(() => import('@/pages/resume/UnifiedResumeHub'));
const Learning = lazy(() => import('@/pages/Learning'));
const CommandCenter = lazy(() => import('@/pages/CommandCenter'));
const SkillsVerificationCenter = lazy(() =>
  import('@/pages/SkillsVerificationCenter').then((module) => ({ default: module.SkillsVerificationCenter }))
);
const CareerPassport = lazy(() => import('@/pages/passport/CareerPassportDashboard'));
const Tools = lazy(() => import('@/pages/Tools'));
const PublicResumeBuilder = lazy(() => import('@/pages/tools/PublicResumeBuilder'));
const NavigatorHub = lazy(() => import('@/pages/NavigatorHub'));
const Companies = lazy(() => import('@/pages/Companies'));
const Colleges = lazy(() => import('@/pages/Colleges'));
const Communication = lazy(() => import('@/pages/Communication'));
const VideoCall = lazy(() =>
  import('@/components/realtime/VideoCall').then((module) => ({ default: module.VideoCall }))
);
const NetworkMessages = lazy(() => import('@/pages/network/Messages'));
const NetworkPeople = lazy(() => import('@/pages/network/People'));
const GamificationCenter = lazy(() => import('@/pages/GamificationCenter'));
const ReferAndEarn = lazy(() => import('@/pages/ReferAndEarn'));
const MobileReels = lazy(() => import('@/pages/MobileReelsPage'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const PublicInterviewPrep = lazy(() => import('@/pages/tools/PublicInterviewPrep'));
const SalaryAnalyzer = lazy(() => import('@/pages/tools/SalaryAnalyzer'));
const MobileQRScanner = lazy(() => import('@/pages/mobile/MobileQRScanner'));
const MobileNearby = lazy(() =>
  import('@/pages/mobile/MobileNearby').then((module) => ({ default: module.MobileNearby }))
);
const MobileHubs = lazy(() =>
  import('@/pages/mobile/MobileHubs').then((module) => ({ default: module.MobileHubs }))
);
const GrowthAcquisition = lazy(() => import('@/pages/growth/UserAcquisitionPage'));
const GrowthContent = lazy(() => import('@/pages/growth/ContentStudioPage'));
const AICareerIntelligence = lazy(() => import('@/pages/AICareerIntelligence'));

const nativeQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NativeLoading() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center px-6 text-slate-900">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading TalentXcel</p>
      </div>
    </div>
  );
}

function NativeProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, session, loading } = useOptimizedAuth();
  const location = useLocation();

  if (loading) return <NativeLoading />;
  if (!user || !session) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
}

function NativeDeepLinkHandler() {
  const navigate = useNavigate();
  const lastHandledUrl = useRef<string | null>(null);

  const routeFromUrl = useCallback((incomingUrl: string) => {
    if (!incomingUrl || lastHandledUrl.current === incomingUrl) return;
    lastHandledUrl.current = incomingUrl;

    try {
      const url = new URL(incomingUrl);
      Browser.close().catch(() => {});

      let targetPath = `${url.pathname}${url.search}${url.hash}`;

      if (url.protocol === 'in.talentxcel.app:') {
        if (url.host === 'call') {
          const callId = url.searchParams.get('callId') || url.searchParams.get('roomId') || url.pathname.replace(/^\/+/, '');
          targetPath = callId
            ? `/calls/${encodeURIComponent(callId)}?source=native_call`
            : '/communication/video';
        } else {
          const hostPath = url.host ? `/${url.host}` : '';
          targetPath = `${hostPath}${url.pathname}${url.search}${url.hash}`;
        }
      }

      if (!targetPath || targetPath === '/') {
        targetPath = '/career-os';
      }

      if (targetPath.startsWith('/')) {
        navigate(targetPath, { replace: true });
      }
    } catch (error) {
      console.error('[NativeDeepLink] Unable to parse app URL:', error);
    }
  }, [navigate]);

  useEffect(() => {
    CapacitorApp.getLaunchUrl()
      .then((launchUrl) => {
        if (launchUrl?.url) {
          routeFromUrl(launchUrl.url);
        }
      })
      .catch(() => {});

    const listener = CapacitorApp.addListener('appUrlOpen', (event) => {
      routeFromUrl(event.url);
    });

    return () => {
      listener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [routeFromUrl]);

  return null;
}

function NativeRouteUnavailable() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-6 pb-28 pt-16 text-slate-950">
      <div className="mx-auto max-w-sm rounded-[28px] border border-white/70 bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          TX
        </div>
        <h1 className="text-xl font-apple-heavy tracking-tight">Module Not Available</h1>
        <p className="mt-2 text-sm font-apple-medium leading-6 text-slate-500">
          {location.pathname} is not available in this Android build yet. The core TalentXcel components below are ready to use.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/career-os')}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-apple-bold text-white"
          >
            Home
          </button>
          <button
            onClick={() => navigate('/network')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-apple-bold text-slate-700"
          >
            Ecosystem
          </button>
        </div>
      </div>
    </div>
  );
}

function NativeRoutes() {
  return (
    <>
      <NativeDeepLinkHandler />
      <main className="min-h-screen">
        <Suspense fallback={<NativeLoading />}>
          <Routes>
            <Route path="/" element={<TalentXcelCore />} />
            <Route path="/career-os" element={<TalentXcelCore />} />
            <Route path="/home" element={<Navigate to="/career-os" replace />} />
            <Route path="/auth" element={<NativeAuthPage />} />
            <Route path="/auth/login" element={<NativeAuthPage />} />
            <Route path="/auth/register" element={<NativeAuthPage />} />
            <Route path="/auth/forgot-password" element={<NativeForgotPassword />} />
            <Route path="/auth/reset-password" element={<NativeResetPassword />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/network" element={<Network />} />
            <Route path="/network/people" element={<NetworkPeople />} />
            <Route path="/network/messages" element={<NetworkMessages />} />
            <Route path="/network/messages/*" element={<NetworkMessages />} />
            <Route path="/network/*" element={<Network />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/mobile" element={<Jobs />} />
            <Route path="/jobs/matches" element={<Jobs />} />
            <Route path="/matches" element={<Navigate to="/talent-beacon" replace />} />
            <Route path="/mobile/jobs" element={<Jobs />} />
            <Route path="/talent-score" element={<PerformanceIndex />} />
            <Route path="/score" element={<Navigate to="/talent-score" replace />} />
            <Route
              path="/talent-beacon"
              element={(
                <NativeProtectedRoute>
                  <TalentBeacon />
                </NativeProtectedRoute>
              )}
            />
            <Route
              path="/navigator"
              element={(
                <NativeProtectedRoute>
                  <NavigatorPage />
                </NativeProtectedRoute>
              )}
            />
            <Route path="/guide" element={<Navigate to="/navigator" replace />} />
            <Route path="/ai-coach" element={<Navigate to="/navigator" replace />} />
            <Route path="/ai-career-hub" element={<Navigate to="/navigator" replace />} />
            <Route path="/intelligence-navigator" element={<Navigate to="/navigator" replace />} />
            <Route
              path="/profile"
              element={(
                <NativeProtectedRoute>
                  <Profile />
                </NativeProtectedRoute>
              )}
            />
            <Route
              path="/profile/*"
              element={(
                <NativeProtectedRoute>
                  <Profile />
                </NativeProtectedRoute>
              )}
            />
            <Route
              path="/resume"
              element={(
                <NativeProtectedRoute>
                  <ResumeHub />
                </NativeProtectedRoute>
              )}
            />
            <Route
              path="/resume/*"
              element={(
                <NativeProtectedRoute>
                  <ResumeHub />
                </NativeProtectedRoute>
              )}
            />
            <Route path="/learning" element={<Learning />} />
            <Route path="/career-command-center" element={<CommandCenter />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/skills-assessment" element={<SkillsVerificationCenter />} />
            <Route path="/passport" element={<CareerPassport />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/resume-builder" element={<PublicResumeBuilder />} />
            <Route path="/tools/interview-prep" element={<PublicInterviewPrep />} />
            <Route path="/tools/salary-analyzer" element={<SalaryAnalyzer />} />
            <Route path="/tools/*" element={<Tools />} />
            <Route path="/navigator-hub" element={<NavigatorHub />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/*" element={<Companies />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/colleges/*" element={<Colleges />} />
            <Route path="/communication" element={<Communication />} />
            <Route path="/communication/messages" element={<NetworkMessages />} />
            <Route
              path="/communication/video/:roomId"
              element={(
                <NativeProtectedRoute>
                  <VideoCall />
                </NativeProtectedRoute>
              )}
            />
            <Route path="/communication/*" element={<Communication />} />
            <Route
              path="/calls/:roomId"
              element={(
                <NativeProtectedRoute>
                  <VideoCall />
                </NativeProtectedRoute>
              )}
            />
            <Route
              path="/call/:roomId"
              element={(
                <NativeProtectedRoute>
                  <VideoCall />
                </NativeProtectedRoute>
              )}
            />
            <Route path="/gamification" element={<GamificationCenter />} />
            <Route path="/refer-and-earn" element={<ReferAndEarn />} />
            <Route path="/mobile/reels" element={<MobileReels />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mobile/qr-scanner" element={<MobileQRScanner />} />
            <Route path="/mobile/nearby" element={<MobileNearby />} />
            <Route path="/mobile/hubs" element={<MobileHubs />} />
            <Route path="/growth/acquisition" element={<GrowthAcquisition />} />
            <Route path="/growth/content" element={<GrowthContent />} />
            <Route path="/growth/content-studio" element={<GrowthContent />} />
            <Route path="/ai-career-intelligence" element={<AICareerIntelligence />} />
            <Route path="/signal" element={<Navigate to="/network" replace />} />
            <Route path="*" element={<NativeRouteUnavailable />} />
          </Routes>
        </Suspense>
      </main>
      <PageSpecificBottomNav />
    </>
  );
}

export default function NativeApp() {
  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={nativeQueryClient}>
        <HelmetProvider>
          <HashRouter>
            <OptimizedAuthProvider>
              <MobileAppInitializer />
              <TooltipProvider>
                <NativeRoutes />
              </TooltipProvider>
            </OptimizedAuthProvider>
          </HashRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


