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
import UniversalProfileRouteHandler from "@/components/profile/UniversalProfileRouteHandler";
import LegacyProfileRedirect from "@/components/profile/LegacyProfileRedirect";
import FastPassportRedirect from "@/components/passport/FastPassportRedirect";
import { EnhancedSEODemoWrapper } from "@/components/seo/EnhancedSEODemoWrapper";
import JobDetails from "@/pages/jobs/JobDetails";
import Blog from "@/pages/Blog";
import { BlogPost } from "@/pages/BlogPost";
import NotFound from "@/pages/NotFound";
import ResourceDetail from "@/pages/resources/ResourceDetail";
import SlugProfile from "@/pages/SlugProfile";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicAccessGuard } from "./components/auth/PublicAccessGuard";
import { GoogleOneTapLogin } from "./components/auth/GoogleOneTapLogin";
import { useOptimizedAuth } from "./hooks/useOptimizedAuth";
import { SilentAuthHandler } from "./components/auth/SilentAuthHandler";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";

// ── Lazy-loaded page chunks ────────────────────────────────────────────────
// Each lazy() call creates a separate JS chunk that is only downloaded when
// the user actually navigates to that route. Zero impact on URLs / UI / data.
const ResumeNew                       = lazy(() => import('./pages/resume/ResumeNew'));
const UnifiedResumeHub                = lazy(() => import('./pages/resume/UnifiedResumeHub'));
const UnifiedResumeBuilder            = lazy(() => import('./pages/resume/UnifiedResumeBuilder'));
const UnifiedUploadPage               = lazy(() => import('./pages/resume/UnifiedUploadPage'));
const SharedScoreView                 = lazy(() => import('./pages/resume/SharedScoreView'));
const BatchScreening                  = lazy(() => import('./pages/colleges/BatchScreening'));
const MyResumes                       = lazy(() => import('./pages/resume/MyResumes'));
const ATSChecker                      = lazy(() => import('./pages/resume/ATSChecker'));
const CoverLetterStudio               = lazy(() => import('./pages/resume/CoverLetterStudio'));
const InterviewPrepSuite              = lazy(() => import('./pages/resume/InterviewPrepSuite'));
const ResumeAnalytics                 = lazy(() => import('./pages/resume/ResumeAnalytics'));
const LegacyRouteRedirect             = lazy(() => import('./components/resume/LegacyRouteRedirect').then(m => ({ default: m.LegacyRouteRedirect })));
const Tools                           = lazy(() => import('./pages/Tools'));
const SEODashboard                    = lazy(() => import('./pages/SEODashboard'));
const PublicResumeBuilder             = lazy(() => import('./pages/tools/PublicResumeBuilder'));
const PublicJobSearch                 = lazy(() => import('./pages/tools/PublicJobSearch'));
const PublicMarketInsights            = lazy(() => import('./pages/tools/PublicMarketInsights'));
const PublicInterviewPrep             = lazy(() => import('./pages/tools/PublicInterviewPrep'));
const ResumeChecker                   = lazy(() => import('./pages/tools/ResumeChecker'));
const CoverLetterGenerator            = lazy(() => import('./pages/tools/CoverLetterGenerator'));
const InterviewPrep                   = lazy(() => import('./pages/tools/InterviewPrep'));
const ProfileOptimizer                = lazy(() => import('./pages/tools/ProfileOptimizer').then(m => ({ default: m.ProfileOptimizer })));
const SalaryAnalyzer                  = lazy(() => import('./pages/tools/SalaryAnalyzer'));
const SkillAssessor                   = lazy(() => import('./pages/tools/SkillAssessor'));
const SkillAssessmentEngine           = lazy(() => import('./pages/tools/SkillAssessmentEngine'));
const JobMatcher                      = lazy(() => import('./pages/tools/JobMatcher'));
const ResumeTemplates                 = lazy(() => import('./pages/ResumeTemplates'));
const ResumeEdit                      = lazy(() => import('./pages/resume/ResumeEditorPage').then(m => ({ default: m.ResumeEditorPage })));
const ResumeBuilderV2                 = lazy(() => import('./pages/resume/ResumeBuilderV2'));
const UnifiedDashboard                = lazy(() => import('./pages/UnifiedDashboard'));
const MobileReelsPage                 = lazy(() => import('./pages/MobileReelsPage'));
const MobilePassport                  = lazy(() => import('./pages/mobile/MobilePassport').then(m => ({ default: m.MobilePassport })));
const MobileJobs                      = lazy(() => import('./pages/mobile/MobileJobs'));
const UserManagement                  = lazy(() => import('@/pages/admin/UserManagement'));
const TalentDatabase                  = lazy(() => import('@/pages/admin/TalentDatabase'));
const SecurityCenter                  = lazy(() => import('@/pages/admin/SecurityCenter'));
const ProductRequirementDocument      = lazy(() => import('@/pages/admin/ProductRequirementDocument'));
const AdminScrapedJobApplications     = lazy(() => import('@/components/admin/AdminScrapedJobApplications').then(m => ({ default: m.AdminScrapedJobApplications })));
const EdgeFunctionsMonitor            = lazy(() => import('@/pages/admin/EdgeFunctionsMonitor'));
const NewsManagement                  = lazy(() => import('@/pages/admin/NewsManagement'));
const EmailAutomation                 = lazy(() => import('@/pages/admin/EmailAutomation'));
const PopulateCoursesAdmin            = lazy(() => import('@/pages/admin/PopulateCoursesAdmin'));
const NewsPage                        = lazy(() => import('@/pages/NewsPage'));
const AIServicesPage                  = lazy(() => import('@/pages/AIServicesPage'));
const JobsByRole                      = lazy(() => import('@/pages/seo/JobsByRole'));
const JobsByLocation                  = lazy(() => import('@/pages/seo/JobsByLocation'));
const JobsBySkill                     = lazy(() => import('@/pages/seo/JobsBySkill'));
const IndustryJobs                    = lazy(() => import('@/pages/seo/IndustryJobs'));
const PrivacyPolicy                   = lazy(() => import('./pages/PrivacyPolicy'));
const Terms                           = lazy(() => import('./pages/auth/Terms'));
const Platform                        = lazy(() => import('./pages/Platform'));
const DebugPage                       = lazy(() => import('./pages/DebugPage'));
const SystemDiagnostics               = lazy(() => import('./pages/SystemDiagnostics'));
const AllProvidersPage                = lazy(() => import('./pages/learning/AllProvidersPage'));
const ProviderPage                    = lazy(() => import('./pages/learning/ProviderPage'));
const CareerPassportDashboard         = lazy(() => import('./pages/passport/CareerPassportDashboard'));
const PassportLayout                  = lazy(() => import('./pages/passport/PassportLayout'));
const PublicPassport                  = lazy(() => import('./pages/passport/PublicPassport'));
const ProofRedirect                   = lazy(() => import('./pages/passport/components/ProofRedirect'));
const CVDatabase                      = lazy(() => import('@/components/employer/CVDatabase').then(m => ({ default: m.CVDatabase })));
const VideoCall                       = lazy(() => import('@/components/realtime/VideoCall').then(m => ({ default: m.VideoCall })));
const RealTimeChat                    = lazy(() => import('@/components/realtime/RealTimeChat').then(m => ({ default: m.RealTimeChat })));
const LiveEvent                       = lazy(() => import('@/components/realtime/LiveEvent').then(m => ({ default: m.LiveEvent })));
const UserProfile                     = lazy(() => import('./pages/UserProfile'));
const AIAgentDashboard                = lazy(() => import('./pages/ai/AIAgentDashboard'));
const AICareerIntelligence            = lazy(() => import('./pages/AICareerIntelligence'));
const AICareerHub                     = lazy(() => import('./pages/AICareerHub'));
const CareerDashboard                 = lazy(() => import('./pages/CareerDashboard'));
const SkillsGap                       = lazy(() => import('./pages/career-map/SkillsGap'));
const CareerRoadmapGenerator          = lazy(() => import('./components/career/CareerRoadmapGenerator'));
const CareerGoals                     = lazy(() => import('./pages/CareerGoals'));
const SEOSuite                        = lazy(() => import('./pages/SEOSuite'));
const AIEnhancement                   = lazy(() => import('./pages/resume/AIEnhancement'));
const QRNetworking                    = lazy(() => import('./pages/QRNetworking'));
const CareerIntelligenceDashboard     = lazy(() => import('./pages/CareerIntelligenceDashboard'));
const InstantNetworkingSystem         = lazy(() => import('./pages/InstantNetworkingSystem'));
const SkillsVerificationCenter        = lazy(() => import('./pages/SkillsVerificationCenter').then(m => ({ default: m.SkillsVerificationCenter })));
const JobMatchGPTPage                 = lazy(() => import('./pages/JobMatchGPTPage'));
const DynamicAchievementSystem        = lazy(() => import('./pages/DynamicAchievementSystem'));
const InteractiveCareerRoadmapBuilder = lazy(() => import('./pages/InteractiveCareerRoadmapBuilder'));
const Services                        = lazy(() => import('./pages/Services'));
const ServicesMarketplacePage         = lazy(() => import('./pages/ServicesMarketplacePage'));
const ProviderDashboard               = lazy(() => import('./pages/ProviderDashboard'));
const CompletedCareerIntelligenceSystem = lazy(() => import('./pages/CompletedCareerIntelligenceSystem').then(m => ({ default: m.CompletedCareerIntelligenceSystem })));
const AdminVideoManager               = lazy(() => import('./pages/AdminVideoManager'));
const CourseManagementPage            = lazy(() => import('./pages/admin/CourseManagementPage'));
const CompanyOSLayout                 = lazy(() => import('./pages/company-os/CompanyOSLayout'));
const CEODashboard                    = lazy(() => import('./pages/company-os/CEODashboard'));
const CompanyPublicProfile            = lazy(() => import('./pages/companies/CompanyPublicProfile'));
const PublicPostPage                  = lazy(() => import('./pages/posts/PublicPostPage'));
const TopicHubPage                    = lazy(() => import('./pages/topics/TopicHubPage'));
const ServiceLandingPage              = lazy(() => import('./pages/services/ServiceLandingPage'));
const DecisionQueue                   = lazy(() => import('./pages/company-os/DecisionQueue'));
const CompanyOSEngineering            = lazy(() => import('./pages/company-os/Engineering'));
const CompanyOSSales                  = lazy(() => import('./pages/company-os/Sales'));
const CompanyOSMarketing              = lazy(() => import('./pages/company-os/Marketing'));
const CompanyOSHR                     = lazy(() => import('./pages/company-os/HR'));
const CompanyOSFinance                = lazy(() => import('./pages/company-os/Finance'));
const CourseDetail                    = lazy(() => import('./pages/learning/CourseDetail'));
const CoursePlayer                    = lazy(() => import('./pages/learning/CoursePlayer'));
const Communication                   = lazy(() => import('./pages/Communication'));
const JobsLandingPage                 = lazy(() => import('@/pages/seo/jobs/JobsLandingPage').then(m => ({ default: m.JobsLandingPage })));
const JobsByRoleCity                  = lazy(() => import('@/pages/seo/jobs/JobsByRoleCity').then(m => ({ default: m.JobsByRoleCity })));
const JobsByRoleExperienceCity        = lazy(() => import('@/pages/seo/jobs/JobsByRoleExperienceCity').then(m => ({ default: m.JobsByRoleExperienceCity })));
const JobsByRoleIndustryCity          = lazy(() => import('@/pages/seo/jobs/JobsByRoleIndustryCity').then(m => ({ default: m.JobsByRoleIndustryCity })));
const JobsByRoleSkillCityLevel        = lazy(() => import('@/pages/seo/jobs/JobsByRoleSkillCityLevel').then(m => ({ default: m.JobsByRoleSkillCityLevel })));
const JobsByRoleSalaryCity            = lazy(() => import('@/pages/seo/jobs/JobsByRoleSalaryCity').then(m => ({ default: m.JobsByRoleSalaryCity })));
const JobsByRemoteRoleCity            = lazy(() => import('@/pages/seo/jobs/JobsByRemoteRoleCity').then(m => ({ default: m.JobsByRemoteRoleCity })));
const JobsByCompanyRoleCity           = lazy(() => import('@/pages/seo/jobs/JobsByCompanyRoleCity').then(m => ({ default: m.JobsByCompanyRoleCity })));
const JobCategoryPage                 = lazy(() => import('@/pages/seo/JobCategoryPage'));
const JobLocationPage                 = lazy(() => import('@/pages/seo/JobLocationPage'));
const GlobalEmployerAcquisition       = lazy(() => import('./pages/employers/GlobalEmployerAcquisition'));
const MultiLocationJobComposer        = lazy(() => import('./components/jobs/MultiLocationJobComposer'));

const CareerPlatformShowcasePage = lazy(() => import("./pages/CareerPlatformShowcase"));
const Jobs1 = lazy(() => import("./pages/Jobs1"));
const GlobalPrograms = lazy(() => import('./pages/colleges/GlobalPrograms'));
const Scholarships = lazy(() => import('./pages/colleges/Scholarships'));
const CareerPathway = lazy(() => import('./pages/colleges/CareerPathway'));
const Colleges = lazy(() => import('./pages/Colleges'));
const CollegeDetail = lazy(() => import('./pages/colleges/CollegeDetail'));
const RankingsHub = lazy(() => import('./pages/claim1/RankingsHub'));
const LeaderboardPage = lazy(() => import('./pages/claim1/LeaderboardPage'));
const CompanyRankingProfile = lazy(() => import('./pages/claim1/CompanyRankingProfile'));
const WatchPage = lazy(() => import('./pages/claim1/WatchPage'));

// ── Infrastructure imports (kept static — tiny, needed on every page) ─────
import { turboCore } from "@/utils/turboCore";
import { advancedPerformanceMonitor } from "@/utils/advancedPerformanceMonitor";
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator";
import { MobileStatusBar } from "@/components/mobile/MobileStatusBar";
import { PhaseInitializer } from "@/components/PhaseInitializer";
import { communicationRoutes } from "./navigation/communicationRoutes";
import { claim1Routes } from "./navigation/claim1Routes";
import { JobsPage } from "@/components/performance/LazyRoutes";

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

          // Initialize Autonomous Network Posting Background Runner
          import('@/services/networkAutoPostEngine').then(({ networkAutoPostEngine }) => {
            networkAutoPostEngine.checkAndExecuteScheduledPost();
            setInterval(() => {
              networkAutoPostEngine.checkAndExecuteScheduledPost();
            }, 60000);
          });

          // Initialize TalentXcel Autonomous Business OS Kernel
          import('@/agents/shared/AgentRuntime').then(({ agentRuntime }) => {
            agentRuntime.boot();
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
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/terms-of-service" element={<Terms />} />
                <Route path="/score/:token" element={<Suspense fallback={<div>Loading...</div>}><SharedScoreView /></Suspense>} />
                <Route path="/colleges/batch" element={<Suspense fallback={<div>Loading...</div>}><BatchScreening /></Suspense>} />
                <Route path="/b/:cohortCode" element={<Suspense fallback={<div>Loading...</div>}><BatchScreening /></Suspense>} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/skill-assessment-engine" element={<SkillAssessmentEngine />} />
                <Route path="/tools/skill-assessment" element={<SkillAssessmentEngine />} />
                <Route path="/resources/:slug" element={<ResourceDetail />} />
                <Route path="/resources" element={<Blog />} />
                <Route path="/skills/:skill/:subtopic" element={<Suspense fallback={null}><JobsBySkill /></Suspense>} />
                <Route path="/skills/:p1/:p2/:subtopic" element={<Suspense fallback={null}><JobsBySkill /></Suspense>} />
                <Route path="/skills/:skill" element={<JobsBySkill />} />
                <Route path="/skills" element={<JobsBySkill />} />
                <Route path="/roles/:role/:subtopic" element={<Suspense fallback={null}><JobsByRole /></Suspense>} />
                <Route path="/roles/:role" element={<JobsByRole />} />
                <Route path="/roles" element={<JobsByRole />} />
                <Route path="/locations/:location" element={<JobsByLocation />} />
                <Route path="/locations" element={<JobsByLocation />} />
                <Route path="/industries/:industry" element={<IndustryJobs />} />
                <Route path="/industries" element={<IndustryJobs />} />
                
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
                
                {/* Global Employer Acquisition & Multi-Location Ingestion */}
                <Route path="/hire" element={<Suspense fallback={<div>Loading...</div>}><GlobalEmployerAcquisition /></Suspense>} />
                <Route path="/employers/post-job" element={<Suspense fallback={<div>Loading...</div>}><GlobalEmployerAcquisition /></Suspense>} />
                <Route path="/jobs/post/multi-location" element={<Suspense fallback={<div>Loading...</div>}><MultiLocationJobComposer /></Suspense>} />

                {/* Location Pages */}
                <Route path="/jobs/bangalore" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/mumbai" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/delhi" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/hyderabad" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/chennai" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                <Route path="/jobs/pune" element={<Suspense fallback={<div>Loading...</div>}><JobLocationPage /></Suspense>} />
                
                {/* Global & India Jobs Matrix Engine (Role x Experience x City) */}
                <Route path="/jobs/:role/:experience/:country/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleExperienceCity /></Suspense>} />
                <Route path="/jobs/:role/:experience/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleExperienceCity /></Suspense>} />

                {/* Jobs Sitemap Routes - Role, City, Subtopic Combinations */}
                <Route path="/jobs/:role/:city/:subtopic" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleCity /></Suspense>} />
                <Route path="/jobs/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleCity /></Suspense>} />
                <Route path="/jobs/:role/:industry/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleIndustryCity /></Suspense>} />
                <Route path="/jobs/:role/:skill/:city/:experienceLevel" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleSkillCityLevel /></Suspense>} />
                <Route path="/jobs/:role/:salaryRange/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRoleSalaryCity /></Suspense>} />
                <Route path="/jobs/remote/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByRemoteRoleCity /></Suspense>} />
                <Route path="/jobs/top-companies/:company/:role/:city" element={<Suspense fallback={<div>Loading...</div>}><JobsByCompanyRoleCity /></Suspense>} />
                
                {/* ── Global Education & College Routes (Explicit Precedence) ── */}
                <Route path="/colleges" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                <Route path="/colleges/compare/:comparison" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                <Route path="/colleges/state/:stateSlug" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                <Route path="/colleges/exam/:examSlug" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                <Route path="/colleges/:state/:degree/:type" element={<Suspense fallback={null}><Colleges /></Suspense>} />
                <Route path="/colleges/global-programs" element={<Suspense fallback={null}><GlobalPrograms /></Suspense>} />
                <Route path="/colleges/global-programs/:slug/:subpage" element={<Suspense fallback={null}><GlobalPrograms /></Suspense>} />
                <Route path="/colleges/global-programs/:slug" element={<Suspense fallback={null}><GlobalPrograms /></Suspense>} />
                <Route path="/colleges/scholarships" element={<Suspense fallback={null}><Scholarships /></Suspense>} />
                <Route path="/colleges/pathway" element={<Suspense fallback={null}><CareerPathway /></Suspense>} />
                <Route path="/colleges/:id" element={<Suspense fallback={null}><CollegeDetail /></Suspense>} />
                <Route path="/colleges/:id/:subTab" element={<Suspense fallback={null}><CollegeDetail /></Suspense>} />
                <Route path="/colleges/:id/:subTab/:extra" element={<Suspense fallback={null}><CollegeDetail /></Suspense>} />
                
                {/* ── Canonical Public SEO & Entity Routes (Explicit Precedence) ── */}
                <Route path="/rankings" element={<Suspense fallback={null}><RankingsHub /></Suspense>} />
                <Route path="/rankings/:categorySlug" element={<Suspense fallback={null}><LeaderboardPage /></Suspense>} />
                <Route path="/rankings/:categorySlug/:scopeSlug" element={<Suspense fallback={null}><LeaderboardPage /></Suspense>} />
                <Route path="/company/:slug" element={<Suspense fallback={null}><CompanyPublicProfile /></Suspense>} />
                <Route path="/post/:slugOrId" element={<Suspense fallback={null}><PublicPostPage /></Suspense>} />
                <Route path="/posts/:slugOrId" element={<Suspense fallback={null}><PublicPostPage /></Suspense>} />
                <Route path="/topics/:slug" element={<Suspense fallback={null}><TopicHubPage /></Suspense>} />
                <Route path="/topic/:slug" element={<Suspense fallback={null}><TopicHubPage /></Suspense>} />
                <Route path="/services/:slug" element={<Suspense fallback={null}><ServiceLandingPage /></Suspense>} />
                <Route path="/claim1/watch" element={<Suspense fallback={null}><WatchPage /></Suspense>} />
                                
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

                                {/* Legacy profile route -> redirects to canonical /:username */}
                                <Route path="/profile/:username" element={<LegacyProfileRedirect />} />

                                {/* Legacy UUID-based profile redirects */}
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
                                <Route path="/diagnostics" element={<SystemDiagnostics />} />
                                <Route path="/passport" element={<PassportLayout />} />
                                <Route path="/passport/section/:section" element={<PassportLayout />} />
                                <Route path="/passport/proof/:credentialId" element={<ProofRedirect />} />
                                <Route path="/passport/public/:identifier" element={<PublicPassport />} />
                                <Route path="/passport/legacy" element={<CareerPassportDashboard />} />
                                <Route path="/passport/user/:userId" element={<CareerPassportDashboard />} />
                                <Route path="/passport/:userId" element={<FastPassportRedirect />} />
                                <Route path="/passport/:username" element={<CareerPassportDashboard />} />
                                <Route path="/@:username" element={<UniversalProfileRouteHandler />} />
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
                                  <Route path="/resume/cover-letter" element={<CoverLetterStudio />} />
                                  <Route path="/resume/interview-prep" element={<InterviewPrepSuite />} />
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
                                 {/* Explicit Public Learning Provider Directory Routes */}
                                 <Route path="/learning/providers" element={<AllProvidersPage />} />
                                 <Route path="/learning/providers/:slug" element={<ProviderPage />} />

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
                                
                                {/* Universal Public Profile Route — /{username} */}
                                {/* Claim #1 Routes — must be before /:username catch-all */}
                                {claim1Routes
                                  .filter((r) => !r.requiresAuth && !r.requiresAdmin)
                                  .map((route) => (
                                    <Route key={route.path} path={route.path} element={route.element} />
                                  ))}
                                {claim1Routes
                                  .filter((r) => r.requiresAuth)
                                  .map((route) => (
                                    <Route key={route.path} path={route.path} element={
                                      <ProtectedRoute>{route.element}</ProtectedRoute>
                                    } />
                                  ))}

                                <Route path="/:username" element={<UniversalProfileRouteHandler />} />

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
            {/* Real-time Connection Status indicator removed per UX request */}
           {/* PWA Install Prompts */}
           <ChromePWAPrompt />
           <IOSInstallPrompt />
         </QueryClientProvider>
     </ErrorBoundary>
  );
};

// Initialize production optimizations
if (typeof window !== 'undefined') {
  initializeProductionOptimizations();
}

export default App;