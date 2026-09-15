import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PageSpecificBottomNav } from '@/components/navigation/PageSpecificBottomNav';
import { PushNotificationInit } from "./components/mobile/PushNotificationInit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { OptimizedAuthProvider } from "./contexts/OptimizedAuthContext";
import { TXCAutoMiner } from '@/components/txc/TXCAutoMiner';
import { FooterWrapper } from '@/components/layout/FooterWrapper';
import { FinalLaunchChecklist } from '@/components/deployment/FinalLaunchChecklist';
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { initializeProductionOptimizations } from '@/utils/productionOptimizer';
import { initializePerformanceOptimizations } from '@/utils/performanceOptimizations';
import { initializeJobsOptimizations } from '@/utils/jobsPerformanceOptimizer';
import { AsyncGoogleOneTap } from '@/components/performance/AsyncGoogleOneTap';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { ChromePWAPrompt } from '@/components/pwa/ChromePWAPrompt';
import { NavigatorProvider } from "@/components/ai/NavigatorProvider";
import { SafeRealtimeProvider } from "@/components/realtime/SafeRealtimeProvider";
import { SitemapRedirect } from "@/components/seo/SitemapRedirect";
import { MobileStatusBar } from "@/components/mobile/MobileStatusBar";
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { turboCore } from "@/utils/turboCore";
import { advancedPerformanceMonitor } from "@/utils/advancedPerformanceMonitor";
import { PhaseInitializer } from "@/components/PhaseInitializer";
import { ReferralCapture } from './components/growth/ReferralCapture';

// Page Imports
import JobDetails from "@/pages/jobs/JobDetails";
import NotFound from "@/pages/NotFound";
import UnifiedResumeHub from './pages/resume/UnifiedResumeHub';
import UnifiedResumeBuilder from './pages/resume/UnifiedResumeBuilder';
import UnifiedUploadPage from './pages/resume/UnifiedUploadPage';
import MyResumes from './pages/resume/MyResumes';
import ATSChecker from './pages/resume/ATSChecker';
import ResumeAnalytics from './pages/resume/ResumeAnalytics';
import { LegacyRouteRedirect } from './components/resume/LegacyRouteRedirect';
import Tools from './pages/Tools';
import UserManagement from "@/pages/admin/UserManagement";
import TalentDatabase from "@/pages/admin/TalentDatabase";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import ProductRequirementDocument from "@/pages/admin/ProductRequirementDocument";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
import EdgeFunctionsMonitor from "@/pages/admin/EdgeFunctionsMonitor";
import NewsManagement from "@/pages/admin/NewsManagement";
import EmailAutomation from "@/pages/admin/EmailAutomation";
import PopulateCoursesAdmin from "@/pages/admin/PopulateCoursesAdmin";
import AdminVideoManager from "./pages/AdminVideoManager";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import NewsPage from "@/pages/NewsPage";
import CareerPassportDashboard from "./pages/passport/CareerPassportDashboard";
import { CVDatabase } from "@/components/employer/CVDatabase";
import { VideoCall } from "@/components/realtime/VideoCall";
import AIAgentDashboard from "./pages/ai/AIAgentDashboard";
import AICareerIntelligence from "./pages/AICareerIntelligence";
import NavigatorHub from "./pages/NavigatorHub";
import CareerDashboard from "./pages/CareerDashboard";
import SkillsGap from "./pages/career-map/SkillsGap";
import CareerRoadmapGenerator from "./components/career/CareerRoadmapGenerator";
import CareerGoals from "./pages/CareerGoals";
import SEOSuite from "./pages/SEOSuite";
import QRNetworking from "./pages/QRNetworking";
import CareerIntelligenceDashboard from "./pages/CareerIntelligenceDashboard";
import InstantNetworkingSystem from "./pages/InstantNetworkingSystem";
import { SkillsVerificationCenter } from "./pages/SkillsVerificationCenter";
import DynamicAchievementSystem from "./pages/DynamicAchievementSystem";
import InteractiveCareerRoadmapBuilder from "./pages/InteractiveCareerRoadmapBuilder";
import ServicesMarketplacePage from "./pages/ServicesMarketplacePage";
import ProviderDashboard from "./pages/ProviderDashboard";
import { CompletedCareerIntelligenceSystem } from "./pages/CompletedCareerIntelligenceSystem";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import MobileReelsPage from './pages/MobileReelsPage';
import { MobilePassport } from './pages/mobile/MobilePassport';
import Communication from "./pages/Communication";
import { communicationRoutes } from "./navigation/communicationRoutes";
import { JobsPage } from "@/components/performance/LazyRoutes";
import JobCategoryPage from "@/pages/seo/JobCategoryPage";
import JobLocationPage from "@/pages/seo/JobLocationPage";
import { JobsByRoleCity } from "@/pages/seo/jobs/JobsByRoleCity";
import { JobsByRoleIndustryCity } from "@/pages/seo/jobs/JobsByRoleIndustryCity";
import { JobsByRoleSkillCityLevel } from "@/pages/seo/jobs/JobsByRoleSkillCityLevel";
import { JobsByRoleSalaryCity } from "@/pages/seo/jobs/JobsByRoleSalaryCity";
import { JobsByRemoteRoleCity } from "@/pages/seo/jobs/JobsByRemoteRoleCity";
import { JobsByCompanyRoleCity } from "@/pages/seo/jobs/JobsByCompanyRoleCity";
import BenchmarkResultsPage from "@/pages/BenchmarkResultsPage";

const CareerPlatformShowcasePage = lazy(() => import("./pages/CareerPlatformShowcase"));
const TalentBeacon = lazy(() => import("./pages/jobs/TalentBeacon"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 15 * 60 * 1000,
      networkMode: 'online',
    },
  },
});

const App = () => {
  useEffect(() => {
    try {
      const savedColorScheme = localStorage.getItem('colorScheme');
      if (savedColorScheme) {
        document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
      }
    } catch {}

    setTimeout(() => {
      try {
        const startTime = performance.now();
        if (turboCore?.init) turboCore.init();
        const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        idleCallback(() => {
          initializePerformanceOptimizations();
          initializeJobsOptimizations(queryClient).catch(console.error);
          import('@/utils/routePreloader').then(({ enableRoutePreloading }) => enableRoutePreloading());
        });
      } catch (error) {
        console.warn('App initialization error:', error);
      }
    }, 0);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <OptimizedAuthProvider>
              <PushNotificationInit />
              <NotificationProvider>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                  <SafeRealtimeProvider showToasts={false}>
                    <NavigatorProvider>
                      <TooltipProvider>
                        <PhaseInitializer />
                        <TXCAutoMiner />
                        <AsyncGoogleOneTap />
                        <div className="min-h-screen flex flex-col pt-0">
                          <Navbar />
                          <main className="flex-1">
                            <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Synchronizing TalentXcel...</div>}>
                              <Routes>
                                <Route path="/ref/:referrerId" element={<ReferralCapture />} />
                                {/* Core Priority Routes */}
                                <Route path="/home" element={<Navigate to="/career-os" replace />} />
                                <Route path="/jobs" element={<JobsPage />} />
                                <Route path="/matches" element={<Navigate to="/talent-beacon" replace />} />
                                <Route path="/score" element={<Navigate to="/talent-score" replace />} />
                                <Route path="/signal" element={<Navigate to="/network" replace />} />
                                <Route path="/guide" element={<Navigate to="/navigator" replace />} />
                                <Route path="/ai-coach" element={<Navigate to="/navigator" replace />} />
                                <Route path="/tools" element={<Tools />} />
                                <Route path="/dashboard" element={<UnifiedDashboard />} />
                                
                                {/* UDX Benchmark */}
                                <Route path="/discovery/benchmark" element={<BenchmarkResultsPage />} />

                                {/* Job Details */}
                                <Route path="/jobs/:slugOrId" element={<JobDetails />} />
                                <Route path="/job/:slugOrId" element={<JobDetails />} />
                                
                                {/* Admin Routes */}
                                <Route path="/launch/final" element={<ProtectedRoute><AdminLayout><div className="p-6"><FinalLaunchChecklist /></div></AdminLayout></ProtectedRoute>} />
                                <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                                <Route path="/talent-database" element={<AdminLayout><TalentDatabase /></AdminLayout>} />
                                <Route path="/admin/security" element={<AdminLayout><SecurityCenter /></AdminLayout>} />
                                <Route path="/admin/prd" element={<AdminLayout><ProductRequirementDocument /></AdminLayout>} />
                                <Route path="/admin/scraped-applications" element={<AdminLayout><AdminScrapedJobApplications /></AdminLayout>} />
                                <Route path="/admin/edge-functions-monitor" element={<AdminLayout><EdgeFunctionsMonitor /></AdminLayout>} />
                                <Route path="/admin/news-management" element={<AdminLayout><NewsManagement /></AdminLayout>} />
                                <Route path="/admin/email-automation" element={<AdminLayout><EmailAutomation /></AdminLayout>} />
                                <Route path="/admin/populate-courses" element={<AdminLayout><PopulateCoursesAdmin /></AdminLayout>} />
                                <Route path="/admin/video-manager" element={<AdminLayout><AdminVideoManager /></AdminLayout>} />
                                <Route path="/admin/course-management" element={<AdminLayout><CourseManagementPage /></AdminLayout>} />

                                {/* SEO & Location Routes */}
                                <Route path="/jobs/:role/:city" element={<JobsByRoleCity />} />
                                <Route path="/jobs/bangalore" element={<JobLocationPage />} />
                                <Route path="/jobs/mumbai" element={<JobLocationPage />} />
                                <Route path="/jobs/delhi" element={<JobLocationPage />} />
                                
                                {/* Resume Hub */}
                                <Route path="/resume" element={<UnifiedResumeHub />} />
                                <Route path="/resume/upload" element={<UnifiedUploadPage />} />
                                <Route path="/resume/build" element={<UnifiedResumeBuilder />} />
                                <Route path="/resume/ats-check" element={<ATSChecker />} />
                                <Route path="/resume/analytics" element={<ResumeAnalytics />} />
                                
                                {/* AI & Intelligence */}
                                <Route path="/ai-career-hub" element={<NavigatorHub />} />
                                <Route path="/career-intelligence" element={<AICareerIntelligence />} />
                                <Route path="/navigator-hub" element={<NavigatorHub />} />
                                <Route path="/talent-beacon" element={<TalentBeacon />} />
                                
                                {/* Profile & Social */}
                                <Route path="/passport" element={<CareerPassportDashboard />} />
                                <Route path="/@:username" element={<CareerPassportDashboard />} />
                                <Route path="/mobile/reels" element={<MobileReelsPage />} />
                                <Route path="/mobile/passport" element={<MobilePassport />} />
                                
                                {/* Communication */}
                                <Route path="/communication" element={<Communication />} />
                                {communicationRoutes.map((route) => (
                                  <Route key={route.path} path={route.path} element={route.element} />
                                ))}
                                <Route path="/calls/:roomId" element={<VideoCall />} />
                                <Route path="/call/:roomId" element={<VideoCall />} />

                                {/* Dynamic Navigation Items */}
                                {navItems.map((item: NavItem) => (
                                  <Route key={item.to} path={item.to} element={item.page} />
                                ))}

                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
                          </main>
                          <FooterWrapper />
                        </div>
                      </TooltipProvider>
                    </NavigatorProvider>
                  </SafeRealtimeProvider>
                  <PageSpecificBottomNav />
                </Suspense>
              </NotificationProvider>
            </OptimizedAuthProvider>
          </BrowserRouter>
        </HelmetProvider>
        <MobileStatusBar />
        <ConnectionStatusIndicator />
        <ChromePWAPrompt />
        <IOSInstallPrompt />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

if (typeof window !== 'undefined') {
  initializeProductionOptimizations();
}

export default App;
