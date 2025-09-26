import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { AuthProvider } from "./contexts/AuthContext";
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
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';
import { ReactErrorBoundary } from './components/error/ReactErrorBoundary';
import { InstallPrompt, InstallButton } from '@/components/pwa/InstallPrompt';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { CopilotProvider } from "@/components/ai/CopilotProvider";
import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
import { ReactContextErrorBoundary } from "@/components/auth/ReactContextErrorBoundary";
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
import Blog from "@/pages/Blog";
import { BlogPost } from "@/pages/BlogPost";
import NotFound from "@/pages/NotFound";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicAccessGuard } from "./components/auth/PublicAccessGuard";
import { GoogleOneTapLogin } from "./components/auth/GoogleOneTapLogin";
import { SilentAuthHandler } from "./components/auth/SilentAuthHandler";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";

import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import ResumeNew from './pages/resume/ResumeNew';
import Tools from './pages/Tools';
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
import SkillsGap from "./pages/career-map/SkillsGap";
import CareerRoadmapGenerator from "./components/career/CareerRoadmapGenerator";
import CareerGoals from "./pages/CareerGoals";
import SEOSuite from "./pages/SEOSuite";
import AIEnhancement from "./pages/resume/AIEnhancement";
import QRNetworking from "./pages/QRNetworking";
import CareerIntelligenceDashboard from "./pages/CareerIntelligenceDashboard";
import InstantNetworkingSystem from "./pages/InstantNetworkingSystem";
import { SkillsVerificationCenter } from "./pages/SkillsVerificationCenter";
import DynamicAchievementSystem from "./pages/DynamicAchievementSystem";
import InteractiveCareerRoadmapBuilder from "./pages/InteractiveCareerRoadmapBuilder";
import Services from "./pages/Services";
import ServicesMarketplacePage from "./pages/ServicesMarketplacePage";
import ProviderDashboard from "./pages/ProviderDashboard";
import { CompletedCareerIntelligenceSystem } from "./pages/CompletedCareerIntelligenceSystem";
import { turboCore } from "@/utils/turboCore";
import AdminVideoManager from "./pages/AdminVideoManager";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import CourseDetail from "./pages/learning/CourseDetail";
import CoursePlayer from "./pages/learning/CoursePlayer";
import Communication from "./pages/Communication";
import NetworkingHub from "./pages/NetworkingHub";
import { communicationRoutes } from "./navigation/communicationRoutes";
import { ChatPage } from "./pages/ChatPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AdminPage } from "./pages/AdminPage";

const CareerPlatformShowcasePage = React.lazy(() => import("./pages/CareerPlatformShowcase"));
const Jobs1 = React.lazy(() => import("./pages/Jobs1"));

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
  // Initialize turbo optimizations
  useEffect(() => {
    try {
      // Apply color scheme
      const savedColorScheme = localStorage.getItem('colorScheme');
      if (savedColorScheme) {
        document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
      }
      
      // Initialize turbo core only if not already initialized
      if (turboCore && typeof turboCore.init === 'function') {
        turboCore.init();
      }

      // Initialize performance optimizations
      initializePerformanceOptimizations();
      
      // Initialize jobs-specific optimizations
      initializeJobsOptimizations(queryClient).catch(console.error);
    } catch (error) {
      console.warn('App initialization error:', error);
    }
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
      <ReactContextErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <NotificationProvider>
                <RealtimeProvider showToasts={false}>
                  <CopilotProvider>
                    <TooltipProvider>
                      <Toaster
                        duration={10000}
                        position="top-right"
                        toastOptions={{
                          style: {
                            background: 'hsl(var(--background))',
                            color: 'hsl(var(--foreground))',
                            border: '1px solid hsl(var(--border))',
                            marginTop: '80px',
                          },
                        }}
                      />
                      <MobileAppWrapper>
                        <div className="min-h-screen flex flex-col">
                          <Navbar />
                          <main className="flex-1">
                            <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
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
                                
                                {navItems.map((item: NavItem) => (
                                  <Route 
                                    key={item.to} 
                                    path={item.to} 
                                    element={item.page}
                                  />
                                ))}

                                {/* Legacy UUID-based profile redirects */}
                                <Route path="/profile/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/network/people/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/user/:id" element={<ProfileUrlRedirect />} />
                                <Route path="/platform" element={<Platform />} />
                                <Route path="/career-platform" element={
                                  <React.Suspense fallback={
                                    <div className="flex items-center justify-center min-h-[50vh]">
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  }>
                                    <CareerPlatformShowcasePage />
                                  </React.Suspense>
                                } />

                                {/* AI Services Route */}
                                <Route path="/ai/services" element={
                                  <ProtectedRoute>
                                    <AIServicesPage />
                                  </ProtectedRoute>
                                } />

                                {/* All other routes */}
                                <Route path="/ai/advanced-hub" element={<AIAgentDashboard />} />
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
                                <Route path="/jobs1" element={<React.Suspense fallback={<div>Loading...</div>}><Jobs1 /></React.Suspense>} />
                                
                                <Route path="/dashboard" element={<UnifiedDashboard />} />
                                <Route path="/mobile/reels" element={<React.Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></React.Suspense>} />
                                <Route path="/mobile/passport" element={<MobilePassport />} />
                                <Route path="/resume-builder/upload-enhanced" element={<EnhancedUploadResume />} />
                                <Route path="/resume/new" element={<ResumeNew />} />
                                <Route path="/resume/builder" element={<ResumeBuilderV2 />} />
                                <Route path="/resume/templates" element={<ResumeTemplates />} />
                                <Route path="/resume/edit/:id" element={<ResumeEdit />} />
                                <Route path="/resume/ai-enhancement" element={<AIEnhancement />} />
                                <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                                <Route path="/talent-database" element={<AdminLayout><TalentDatabase /></AdminLayout>} />
                                <Route path="/admin/security" element={<AdminLayout><SecurityCenter /></AdminLayout>} />
                                <Route path="/admin/prd" element={<AdminLayout><ProductRequirementDocument /></AdminLayout>} />
                                <Route path="/seo-suite" element={<SEOSuite />} />
                                <Route path="/admin/scraped-applications" element={<AdminLayout><AdminScrapedJobApplications /></AdminLayout>} />
                                <Route path="/admin/edge-functions-monitor" element={<AdminLayout><EdgeFunctionsMonitor /></AdminLayout>} />
                                <Route path="/admin/news-management" element={<AdminLayout><NewsManagement /></AdminLayout>} />
                                <Route path="/admin/video-manager" element={<AdminLayout><AdminVideoManager /></AdminLayout>} />
                                <Route path="/admin/course-management" element={
                                  <AdminLayout>
                                    <CourseManagementPage />
                                  </AdminLayout>
                                } />
                                <Route path="/news" element={<NewsPage />} />
                                <Route path="/news/:slug" element={<NewsPage />} />
                                <Route path="/employer/cv-database" element={<CVDatabase />} />

                                {/* Communication Routes */}
                                <Route path="/communication" element={<Communication />} />
                                {communicationRoutes.map((route) => (
                                  <Route key={route.path} path={route.path} element={route.element} />
                                ))}

                {/* Networking Hub Routes */}
                <Route path="/networking" element={<NetworkingHub />} />

                {/* Phase 4: Enhanced Analytics & Real-time Communication Routes */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/admin" element={<AdminPage />} />

                                {/* Enhanced SEO Demo Route */}
                                <Route path="/seo-demo/:type" element={<EnhancedSEODemoWrapper />} />
                               
                                {/* Sitemap routes */}
                                <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                                <Route path="/sitemap-dynamic.xml" element={<SitemapRedirect />} />
                                
                                {/* Catchall 404 route - must be last */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </React.Suspense>
                          </main>
                          
                          <InstallPrompt />
                          <InstallButton />
                          <IOSInstallPrompt />
                        </div>
                      </MobileAppWrapper>

                      <TXCAutoMiner />
                      <HealthMonitor />
                      <MetaTags />
                      <GoogleAnalytics />
                      <SearchConsoleVerification />
                      <SilentAuthHandler>
                        <div />
                      </SilentAuthHandler>
                      <GoogleOneTapLogin />
                      <MobileAppInitializer />
                    </TooltipProvider>
                  </CopilotProvider>
                </RealtimeProvider>
              </NotificationProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ReactContextErrorBoundary>
    </ErrorBoundary>
  );
};

// Initialize production optimizations
if (typeof window !== 'undefined') {
  initializeProductionOptimizations();
}

export default App;