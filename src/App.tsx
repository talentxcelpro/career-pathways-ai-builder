import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PageSpecificBottomNav } from '@/components/navigation/PageSpecificBottomNav';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { OptimizedAuthProvider } from "./contexts/OptimizedAuthContext";
import { VoicePlayerProvider } from "@/contexts/VoicePlayerContext";
import { VoiceMiniPlayer } from "@/components/voice/VoiceMiniPlayer";
import { TXCAutoMiner } from '@/components/txc/TXCAutoMiner';
import { FinalLaunchChecklist } from '@/components/deployment/FinalLaunchChecklist';
import { AuthErrorRecovery } from "./components/auth/AuthErrorRecovery";
import SubdomainGateway from "@/pages/SubdomainGateway";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { HealthMonitor } from '@/components/monitoring/HealthMonitor';
import { MetaTags } from '@/components/seo/MetaTags';
import { initializeProductionOptimizations } from '@/utils/productionOptimizer';
import { initializePerformanceOptimizations } from '@/utils/performanceOptimizations';
import { initializeJobsOptimizations } from '@/utils/jobsPerformanceOptimizer';
import { ReactErrorBoundary } from './components/error/ReactErrorBoundary';
import { AsyncGoogleOneTap } from '@/components/performance/AsyncGoogleOneTap';
import { InstallPrompt, InstallButton } from '@/components/pwa/InstallPrompt';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { ChromePWAPrompt } from '@/components/pwa/ChromePWAPrompt';
import { CopilotProvider } from "@/components/ai/CopilotProvider";
import { SafeRealtimeProvider } from "@/components/realtime/SafeRealtimeProvider";
import { SitemapRedirect } from "@/components/seo/SitemapRedirect";
import { SEOJobsLocation } from "@/components/seo/SEOJobsLocation";
import { SEOJobsRole } from "@/components/seo/SEOJobsRole";
import { SEOJobsRoleLocation } from "@/components/seo/SEOJobsRoleLocation";
import { SEOCompaniesLocation } from "@/components/seo/SEOCompaniesLocation";
import { SEOPosts } from "@/components/seo/SEOPosts";
import { JobUrlRedirect } from "@/components/seo/JobUrlRedirect";
import ProfileUrlRedirect from "@/components/profile/ProfileUrlRedirect";
import FastPassportRedirect from "@/components/passport/FastPassportRedirect";
import { EnhancedSEODemoWrapper } from "@/components/seo/EnhancedSEODemoWrapper";
import JobDetails from "@/pages/jobs/JobDetails";
import Blog from "@/pages/Blog";
import { BlogPost } from "@/pages/BlogPost";
import NotFound from "@/pages/NotFound";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicAccessGuard } from "./components/auth/PublicAccessGuard";
import { GoogleOneTapLogin } from "./components/auth/GoogleOneTapLogin";
import { useOptimizedAuth } from "./hooks/useOptimizedAuth";
import { SilentAuthHandler } from "./components/auth/SilentAuthHandler";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";

import ResumeNew from './pages/resume/ResumeNew';
import UnifiedResumeHub from './pages/resume/UnifiedResumeHub';
import UnifiedResumeBuilder from './pages/resume/UnifiedResumeBuilder';
import UnifiedUploadPage from './pages/resume/UnifiedUploadPage';
import MyResumes from './pages/resume/MyResumes';
import ATSChecker from './pages/resume/ATSChecker';
import ResumeAnalytics from './pages/resume/ResumeAnalytics';
import { LegacyRouteRedirect } from './components/resume/LegacyRouteRedirect';
import Tools from './pages/Tools';
import SEODashboard from './pages/SEODashboard';
import PublicResumeBuilder from './pages/tools/PublicResumeBuilder';
import PublicJobSearch from './pages/tools/PublicJobSearch';
import PublicMarketInsights from './pages/tools/PublicMarketInsights';
import PublicInterviewPrep from './pages/tools/PublicInterviewPrep';
import ResumeChecker from './pages/tools/ResumeChecker';
import CoverLetterGenerator from './pages/tools/CoverLetterGenerator';
import InterviewPrep from './pages/tools/InterviewPrep';
import { ProfileOptimizer } from './pages/tools/ProfileOptimizer';
import SalaryAnalyzer from './pages/tools/SalaryAnalyzer';
import SkillAssessor from './pages/tools/SkillAssessor';
import JobMatcher from './pages/tools/JobMatcher';
import ResumeTemplates from './pages/ResumeTemplates';
import { ResumeEditorPage as ResumeEdit } from './pages/resume/ResumeEditorPage';
import ResumeBuilderV2 from './pages/resume/ResumeBuilderV2';
import UnifiedDashboard from './pages/UnifiedDashboard';
import MobileReelsPage from './pages/MobileReelsPage';
import { MobilePassport } from './pages/mobile/MobilePassport';
import MobileJobs from './pages/mobile/MobileJobs';
import UserManagement from "@/pages/admin/UserManagement";
import TalentDatabase from "@/pages/admin/TalentDatabase";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import ProductRequirementDocument from "@/pages/admin/ProductRequirementDocument";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
import EdgeFunctionsMonitor from "@/pages/admin/EdgeFunctionsMonitor";
import NewsManagement from "@/pages/admin/NewsManagement";
import EmailAutomation from "@/pages/admin/EmailAutomation";
import PopulateCoursesAdmin from "@/pages/admin/PopulateCoursesAdmin";
import NewsPage from "@/pages/NewsPage";
import AIServicesPage from "@/pages/AIServicesPage";
import JobsByRole from "@/pages/JobsByRole";
import JobsByLocation from "@/pages/JobsByLocation";
import JobsBySkill from "@/pages/JobsBySkill";
import Platform from "./pages/Platform";
import DebugPage from "./pages/DebugPage";
import CareerPassportDashboard from "./pages/passport/CareerPassportDashboard";
import { CVDatabase } from "@/components/employer/CVDatabase";
import { VideoCall } from "@/components/realtime/VideoCall";
import { RealTimeChat } from "@/components/realtime/RealTimeChat";
import { LiveEvent } from "@/components/realtime/LiveEvent";
import UserProfile from "./pages/UserProfile";
import CompanyDetail from "./pages/companies/CompanyDetail";
import AIAgentDashboard from "./pages/ai/AIAgentDashboard";
import AICareerIntelligence from "./pages/AICareerIntelligence";
import AICareerHub from "./pages/AICareerHub";
import CareerDashboard from "./pages/CareerDashboard";
import SkillsGap from "./pages/career-map/SkillsGap";
import CareerRoadmapGenerator from "./components/career/CareerRoadmapGenerator";
import CareerGoals from "./pages/CareerGoals";
import SEOSuite from "./pages/SEOSuite";
import AIEnhancement from "./pages/resume/AIEnhancement";
import QRNetworking from "./pages/QRNetworking";
import CareerIntelligenceDashboard from "./pages/CareerIntelligenceDashboard";
import InstantNetworkingSystem from "./pages/InstantNetworkingSystem";
import { SkillsVerificationCenter } from "./pages/SkillsVerificationCenter";
import JobMatchGPTPage from "./pages/JobMatchGPTPage";
import DynamicAchievementSystem from "./pages/DynamicAchievementSystem";
import InteractiveCareerRoadmapBuilder from "./pages/InteractiveCareerRoadmapBuilder";
import Services from "./pages/Services";
import ServicesMarketplacePage from "./pages/ServicesMarketplacePage";
import ProviderDashboard from "./pages/ProviderDashboard";
import { CompletedCareerIntelligenceSystem } from "./pages/CompletedCareerIntelligenceSystem";
import { turboCore } from "@/utils/turboCore";
import { advancedPerformanceMonitor } from "@/utils/advancedPerformanceMonitor";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator";
import { MobileStatusBar } from "@/components/mobile/MobileStatusBar";
import { PhaseInitializer } from "@/components/PhaseInitializer";
import AdminVideoManager from "./pages/AdminVideoManager";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import CompanyOSLayout from "./pages/company-os/CompanyOSLayout";
import CEODashboard from "./pages/company-os/CEODashboard";
import DecisionQueue from "./pages/company-os/DecisionQueue";
import CompanyOSEngineering from "./pages/company-os/Engineering";
import CompanyOSSales from "./pages/company-os/Sales";
import CompanyOSMarketing from "./pages/company-os/Marketing";
import CompanyOSHR from "./pages/company-os/HR";
import CompanyOSFinance from "./pages/company-os/Finance";
import CourseDetail from "./pages/learning/CourseDetail";
import CoursePlayer from "./pages/learning/CoursePlayer";
import Communication from "./pages/Communication";
import { communicationRoutes } from "./navigation/communicationRoutes";

// Import Jobs Sitemap Components
import { JobsLandingPage } from "@/pages/seo/jobs/JobsLandingPage";
import { JobsByRoleCity } from "@/pages/seo/jobs/JobsByRoleCity";
import { JobsByRoleIndustryCity } from "@/pages/seo/jobs/JobsByRoleIndustryCity";
import { JobsByRoleSkillCityLevel } from "@/pages/seo/jobs/JobsByRoleSkillCityLevel";
import { JobsByRoleSalaryCity } from "@/pages/seo/jobs/JobsByRoleSalaryCity";
import { JobsByRemoteRoleCity } from "@/pages/seo/jobs/JobsByRemoteRoleCity";
import { JobsByCompanyRoleCity } from "@/pages/seo/jobs/JobsByCompanyRoleCity";
import { JobsPage } from "@/components/performance/LazyRoutes";
import JobCategoryPage from "@/pages/seo/JobCategoryPage";
import JobLocationPage from "@/pages/seo/JobLocationPage";

const CareerPlatformShowcasePage = lazy(() => import("./pages/CareerPlatformShowcase"));
const Jobs1 = lazy(() => import("./pages/Jobs1"));

// Create query client optimized for performance and SEO
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes for regular queries
      retry: 1, // Reduced retries for better performance
      refetchOnWindowFocus: false,
      gcTime: 15 * 60 * 1000, // Reduced to 15 minutes for memory efficiency
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => {
  // Minimal initialization - defer everything non-critical
  useEffect(() => {
    // Apply color scheme synchronously (critical for avoiding flash)
    try {
      const savedColorScheme = localStorage.getItem('colorScheme');
      if (savedColorScheme) {
        document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
      }
    } catch {}

    // Defer ALL optimizations to after initial paint
    setTimeout(() => {
      try {
        const startTime = performance.now();
        
        // Initialize turbo core
        if (turboCore?.init) turboCore.init();

        // Defer everything else to idle time
        const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        idleCallback(() => {
          initializePerformanceOptimizations();
          initializeJobsOptimizations(queryClient).catch(console.error);
          
          import('@/utils/routePreloader').then(({ enableRoutePreloading }) => {
            enableRoutePreloading();
          });

          import('@/hooks/usePredictivePreloading').then(() => {
            console.log('🤖 AI-powered performance features initialized');
          });

          advancedPerformanceMonitor.trackRouteChange('/', startTime);
        });
      } catch (error) {
        console.warn('App initialization error:', error);
      }
    }, 0);
  }, []);

  // Check if this is a subdomain - simplified as fallback only
  const hostname = window.location.hostname;
  const isSubdomain = hostname.includes('.talentxcel.in') && hostname !== 'talentxcel.in';
  
  // Subdomain handling as safety fallback (should be redirected by Vercel)
  if (isSubdomain) {
    console.warn('Subdomain accessed directly - should be redirected by Vercel');
    // Redirect to main domain with proper query params
    const subdomainType = hostname.split('.')[0];
    window.location.href = `https://talentxcel.in/auth/login?redirect=%2F${subdomainType}`;
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <OptimizedAuthProvider>
              <VoicePlayerProvider>
              <NotificationProvider>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                  <SafeRealtimeProvider showToasts={false}>
                     <CopilotProvider>
                       <TooltipProvider>
                         <PhaseInitializer />
                         <AsyncGoogleOneTap />
                         <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
                              <Routes>
                                {/* Final Launch Checklist Route */}
                                <Route path="/launch/final" element={
                                  <ProtectedRoute>
                                    <AdminLayout>
                                      <div className="p-6">
                                        <FinalLaunchChecklist />
                                      </div>
                                    </AdminLayout>
                                  </ProtectedRoute>
                                } />
                                
                {/* PRIORITY ROUTES - These must come BEFORE navItems.map to take precedence */}
                <Route path="/tools" element={<Tools />} />
                
                {/* Specific Job Detail Routes - UUID patterns */}
                <Route path="/jobs/:slugOrId" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <JobDetails />
                  </Suspense>
                } />
                
                {/* Job Detail Route fallback for complex slugs */}
                <Route path="/job/:slugOrId" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <JobDetails />
                  </Suspense>
                } />
                
                {/* TalentXcel SEO Blueprint Routes */}
                <Route path="/jobs" element={<Suspense fallback={<div>Loading...</div>}><JobsPage /></Suspense>} />
                
                {/* Category Pages */}
                <Route path="/jobs/it-jobs" element={<Suspense fallback={<div>Loading...</div>}><JobCategoryPage /></Suspense>} />
                <Route path="/jobs/engineering-jobs" element={<Suspense fallback={<div>Loading...</div>}><JobCategoryPage /></Suspense>} />
                <Route path="/jobs/marketing-jobs" element={<Suspense fallback={<div>Loading...</div>}><JobCategoryPage /></Suspense>} />
                
                {/* Location Pages */}
                <Route path="/jobs/bangalore" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/mumbai" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/delhi" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/hyderabad" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/chennai" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/pune" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                
                {/* Jobs Sitemap Routes - These patterns will match role/city combinations */}
                <Route path="/jobs/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleCity /></Suspense>} />
                <Route path="/jobs/:role/:industry/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleIndustryCity /></Suspense>} />
                <Route path="/jobs/:role/:skill/:city/:experienceLevel" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleSkillCityLevel /></Suspense>} />
                <Route path="/jobs/:role/:salaryRange/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleSalaryCity /></Suspense>} />
                <Route path="/jobs/remote/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRemoteRoleCity /></Suspense>} />
                <Route path="/jobs/top-companies/:company/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByCompanyRoleCity /></Suspense>} />
                                
                                {navItems.map((item: NavItem) => {
                                  console.log('🔍 Registering route:', item.to, 'Title:', item.title);
                                  return (
                                    <Route 
                                      key={item.to} 
                                      path={item.to} 
                                      element={item.page}
                                    />
                                  );
                                })}

                                {/* Legacy UUID-based profile redirects */}
                                <Route path="/profile/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/network/people/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/user/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/platform" element={<Platform />} />
                                <Route path="/career-platform" element={
                                  <Suspense fallback={
                                    <div className="flex items-center justify-center min-h-[50vh]">
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  }>
                                    <CareerPlatformShowcasePage />
                                  </Suspense>
                                } />

                                {/* AI Services Route */}
                                <Route path="/ai/services" element={
                                  <ProtectedRoute>
                                    <AIServicesPage />
                                  </ProtectedRoute>
                                } />

                {/* All other routes */}
                <Route path="/career-dashboard" element={
                  <ProtectedRoute>
                    <Suspense fallback={<div>Loading...</div>}>
                      <CareerDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/ai/advanced-hub" element={<AIAgentDashboard />} />
                <Route path="/ai-career-hub" element={<AICareerHub />} />
                <Route path="/career-intelligence" element={<AICareerIntelligence />} />
                                <Route path="/skills-assessment" element={<SkillsGap />} />
                                <Route path="/roadmap" element={<CareerRoadmapGenerator />} />
                                <Route path="/career-goals" element={<CareerGoals />} />
                                <Route path="/debug" element={<DebugPage />} />
                                <Route path="/passport" element={<CareerPassportDashboard />} />
                                <Route path="/passport/user/:userId" element={<CareerPassportDashboard />} />
                                <Route path="/passport/:userId" element={<FastPassportRedirect />} />
                                <Route path="/passport/:username" element={<CareerPassportDashboard />} />
                                <Route path="/@:username" element={<CareerPassportDashboard />} />
                                <Route path="/qr-networking" element={<QRNetworking />} />
                                <Route path="/career-intelligence-dashboard" element={<CareerIntelligenceDashboard />} />
                                <Route path="/instant-networking" element={<InstantNetworkingSystem />} />
                                <Route path="/skills-verification" element={<SkillsVerificationCenter />} />
                                <Route path="/achievements" element={<DynamicAchievementSystem />} />
                                <Route path="/roadmap-builder" element={<InteractiveCareerRoadmapBuilder />} />
                                <Route path="/complete-intelligence" element={<CompletedCareerIntelligenceSystem />} />
                                
                                {/* Services Platform Routes */}
                                <Route path="/marketplace" element={<ServicesMarketplacePage />} />
                                <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                                
                                {/* New TalentSpark Jobs Discovery */}
                                <Route path="/jobs1" element={<Suspense fallback={<div>Loading...</div>}><Jobs1 /></Suspense>} />
                                
                                <Route path="/dashboard" element={<UnifiedDashboard />} />
                                <Route path="/mobile/reels" element={<Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></Suspense>} />
                                 <Route path="/mobile/passport" element={<MobilePassport />} />
                                 
                                 {/* Unified Resume Builder - Primary Routes */}
                                  <Route path="/resume" element={<UnifiedResumeHub />} />
                                  <Route path="/resume/new" element={<LegacyRouteRedirect to="/resume/" message="Redirecting to Resume Hub..." />} />
                                  <Route path="/resume/upload" element={<UnifiedUploadPage />} />
                                  <Route path="/resume/build" element={<UnifiedResumeBuilder />} />
                                  <Route path="/resume/build/:id" element={<UnifiedResumeBuilder />} />
                                  <Route path="/resume/dashboard" element={<MyResumes />} />
                                  <Route path="/resume/ats-check" element={<ATSChecker />} />
                                  <Route path="/resume/analytics" element={<ResumeAnalytics />} />
                                  <Route path="/resume/cover-letter" element={<UnifiedResumeBuilder />} />
                                  <Route path="/resume/interview-prep" element={<UnifiedResumeBuilder />} />
                                  <Route path="/resume/portfolio" element={<UnifiedResumeBuilder />} />
                                  
                                  {/* Legacy Resume Routes - Redirects to Unified Builder */}
                                  <Route 
                                    path="/resume-builder/upload-enhanced" 
                                    element={
                                      <LegacyRouteRedirect 
                                        to="/resume/upload" 
                                        message="Upgrading to our new resume builder..."
                                      />
                                    } 
                                  />
                                  <Route 
                                    path="/resume/builder" 
                                    element={
                                      <LegacyRouteRedirect 
                                        to="/resume" 
                                        message="Taking you to the new resume hub..."
                                      />
                                    } 
                                  />
                                  <Route 
                                    path="/resume/edit/:id" 
                                    element={
                                      <LegacyRouteRedirect 
                                        to="/resume/build" 
                                        includeId={true}
                                        message="Opening your resume in the enhanced editor..."
                                      />
                                    } 
                                  />
                                  
                                  {/* Keep these for now - may integrate later */}
                                  <Route path="/resume/templates" element={<ResumeTemplates />} />
                                  <Route path="/resume/ai-enhancement" element={<AIEnhancement />} />
                                <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                                <Route path="/talent-database" element={<AdminLayout><TalentDatabase /></AdminLayout>} />
                                <Route path="/admin/security" element={<AdminLayout><SecurityCenter /></AdminLayout>} />
                                <Route path="/admin/prd" element={<AdminLayout><ProductRequirementDocument /></AdminLayout>} />
                                <Route path="/seo-suite" element={<SEOSuite />} />
                                <Route path="/admin/seo-dashboard" element={<AdminLayout><SEODashboard /></AdminLayout>} />
                                <Route path="/admin/scraped-applications" element={<AdminLayout><AdminScrapedJobApplications /></AdminLayout>} />
                                <Route path="/admin/edge-functions-monitor" element={<AdminLayout><EdgeFunctionsMonitor /></AdminLayout>} />
                                <Route path="/admin/news-management" element={<AdminLayout><NewsManagement /></AdminLayout>} />
                                <Route path="/admin/email-automation" element={<AdminLayout><EmailAutomation /></AdminLayout>} />
                                <Route path="/admin/populate-courses" element={<AdminLayout><PopulateCoursesAdmin /></AdminLayout>} />
                                <Route path="/admin/video-manager" element={<AdminLayout><AdminVideoManager /></AdminLayout>} />
                                <Route path="/admin/course-management" element={
                                  <AdminLayout>
                                    <CourseManagementPage />
                                  </AdminLayout>
                                } />
                                {/* AI Company OS — Superuser only */}
                                <Route path="/company-os" element={<CompanyOSLayout />}>
                                  <Route index element={<CEODashboard />} />
                                  <Route path="decisions" element={<DecisionQueue />} />
                                  <Route path="engineering" element={<CompanyOSEngineering />} />
                                  <Route path="sales" element={<CompanyOSSales />} />
                                  <Route path="marketing" element={<CompanyOSMarketing />} />
                                  <Route path="hr" element={<CompanyOSHR />} />
                                  <Route path="finance" element={<CompanyOSFinance />} />
                                </Route>
                                <Route path="/news" element={<NewsPage />} />
                                <Route path="/news/:slug" element={<NewsPage />} />
                                <Route path="/employer/cv-database" element={<CVDatabase />} />

                                {/* Communication Routes */}
                                <Route path="/communication" element={<Communication />} />
                                {communicationRoutes.map((route) => (
                                  <Route key={route.path} path={route.path} element={route.element} />
                                ))}

                                {/* Enhanced SEO Demo Route */}
                                <Route path="/seo-demo/:type" element={<EnhancedSEODemoWrapper />} />
                               
                                {/* Sitemap routes */}
                                <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                                <Route path="/sitemap-dynamic.xml" element={<SitemapRedirect />} />
                                
                                {/* Catchall 404 route - must be last */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </Suspense>
                          </main>
                          
                         </div>
                      </TooltipProvider>
                     </CopilotProvider>
                   </SafeRealtimeProvider>
                   
                    {/* Global Mobile Bottom Navigation */}
                    <PageSpecificBottomNav />
                  </Suspense>
                    </NotificationProvider>
                    <VoiceMiniPlayer />
                  </VoicePlayerProvider>
                  </OptimizedAuthProvider>
              </BrowserRouter>
           </HelmetProvider>
           {/* Mobile Status Bar - Shows offline/battery status */}
           <MobileStatusBar />
           {/* Real-time Connection Status */}
           <ConnectionStatusIndicator />
           {/* PWA Install Prompts */}
           <ChromePWAPrompt />
           <IOSInstallPrompt />
           {/* Performance Dashboard - Dev Mode Only */}
           {import.meta.env.DEV && <PerformanceDashboard />}
         </QueryClientProvider>
     </ErrorBoundary>
  );
};

// Initialize production optimizations
if (typeof window !== 'undefined') {
  initializeProductionOptimizations();
}

export default App;