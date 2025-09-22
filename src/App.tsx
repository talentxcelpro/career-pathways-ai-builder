import * as React from "react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthErrorRecovery } from "./components/auth/AuthErrorRecovery";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import SubdomainGateway from "@/pages/SubdomainGateway";
// import { AIProvider } from "./contexts/AIContext";
// import { SecurityProvider } from "./components/security/SecurityProvider";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from 'react-helmet-async';
import { ReactErrorBoundary } from './components/error/ReactErrorBoundary';
import { InstallPrompt, InstallButton } from '@/components/pwa/InstallPrompt';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { CopilotProvider } from "@/components/ai/CopilotProvider";
// import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
import { SitemapRedirect } from "@/components/seo/SitemapRedirect";
import { initializePerformanceOptimizations } from "@/utils/performanceOptimizer";
import { initBundleOptimizations } from "@/utils/bundleOptimizer";
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
import { EmbedTestPage } from "@/components/embed-test/EmbedTestPage";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicAccessGuard } from "./components/auth/PublicAccessGuard";
import { GoogleOneTapLogin } from "./components/auth/GoogleOneTapLogin";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";

import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import ResumeNew from './pages/resume/ResumeNew';
import ToolsHub from './pages/tools/ToolsHub';
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
import UserManagement from "@/pages/admin/UserManagement";
import TalentDatabase from "@/pages/admin/TalentDatabase";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import ProductRequirementDocument from "@/pages/admin/ProductRequirementDocument";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
import EdgeFunctionsMonitor from "@/pages/admin/EdgeFunctionsMonitor";
import NewsManagement from "@/pages/admin/NewsManagement";
import NewsPage from "@/pages/NewsPage";
import JobsByRole from "@/pages/JobsByRole";
import JobsByLocation from "@/pages/JobsByLocation";
import JobsBySkill from "@/pages/JobsBySkill";
import Platform from "./pages/Platform";
import DebugPage from "./pages/DebugPage";
import CareerPassportDashboard from "./pages/passport/CareerPassportDashboard";
import { CVDatabase } from "@/components/employer/CVDatabase";
// import { OutreachCampaign } from "@/components/employer/OutreachCampaign";
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
import { CompletedCareerIntelligenceSystem } from "./pages/CompletedCareerIntelligenceSystem";
import { StableContainer } from "@/utils/layoutOptimizer";
import "@/utils/flickerFix";
import { performanceOptimizer } from "@/utils/performanceOptimizer.v2";
const CareerPlatformShowcasePage = React.lazy(() => import("./pages/CareerPlatformShowcase"));

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

// Routes that don't require authentication - updated to include job viewing
const publicRoutes = [
  '/', 
  '/platform',
  '/passport',
  '/passport/:id',
  '/passport/:userId',
  '/passport/:username',
  '/passport/user/:userId',
  '/@:username',
  '/auth/login', 
  '/auth/register', 
  '/auth/forgot-password', 
  '/auth/reset-password', 
  '/auth/callback',
  '/jobs',
  '/jobs/:id',
  '/jobs/role/:role',
  '/jobs/location/:location',
  '/jobs/skill/:skill',
  '/jobs/:role/:location',
  '/companies',
  '/companies/:id',
  '/companies/:slug',
  '/:slug', // Company slug route
  '/profile/:username',
  '/user/:username',
  '/network/people/:id',
  '/mobile/network',
  '/blog',
  '/blog/:slug',
  '/news',
  '/news/:slug',
  '/employer', // Employer landing page (shows different content based on auth)
  '/employer/request-access',
  '/employer/team/accept/:token' // Invitation acceptance
];

const App = () => {
  // Initialize performance optimizations on app start
  useEffect(() => {
    try {
      // Apply color scheme from localStorage
      const savedColorScheme = localStorage.getItem('colorScheme');
      if (savedColorScheme) {
        document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
      }
      
      // Initialize performance optimizations
      initBundleOptimizations();
      initializePerformanceOptimizations();
    } catch (error) {
      console.error('Error in App initialization:', error);
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
    <ReactErrorBoundary>
      <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AnalyticsProvider>
              <AuthErrorBoundary>
                <AuthProvider>
                  <AuthErrorRecovery>
                    <NotificationProvider>
              {/* <SecurityProvider> */}
                {/* <AIProvider> */}
                {/* <RealtimeProvider showToasts={false}> */}
                <CopilotProvider>
                  {/* <ContentSecurityPolicy /> */}
                <Toaster
                  duration={10000}
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                      marginTop: '80px', // Avoid navbar overlap
                    },
                  }}
                />
                <MobileAppInitializer />
                <GoogleOneTapLogin autoSelect />
                <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
                <SearchConsoleVerification verificationCode="nTmI_33A3373kHEXPI2gE41jbDB1Xly7qKUBaAucsnM" />
                <MobileAppWrapper>
                  <div className="min-h-screen flex flex-col">
                    <OfflineIndicator />
                    <Navbar />
                    <main className="flex-1">
                        <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
                          <Routes>
                        {navItems.map((item: NavItem) => {
                           // Check if route is explicitly marked as public or in our public routes list
                           const isLegacyPublicRoute = item.requiresAuth === false || publicRoutes.some(route => {
                             // Handle dynamic routes like /companies/:id, /profile/:id, /:slug, /jobs/:id, and /employer/team/accept/:token
                             if (route.includes(':')) {
                               const routePattern = route.replace(/:[^/]+/g, '[^/]+');
                               return new RegExp(`^${routePattern}$`).test(item.to);
                             }
                             return route === item.to;
                           });
                          
                         return (
                           <Route 
                             key={item.to} 
                             path={item.to} 
                             element={
                                isLegacyPublicRoute || item.isPublic ? (
                                  <PublicAccessGuard 
                                    requiresAdminAccess={item.requiresAdminAccess}
                                    isPublic={item.isPublic || isLegacyPublicRoute}
                                  >
                                    {item.page}
                                  </PublicAccessGuard>
                                ) : item.to.startsWith('/admin') ? (
                                  <ProtectedRoute><AdminLayout>{item.page}</AdminLayout></ProtectedRoute>
                                ) : (
                                  <ProtectedRoute>{item.page}</ProtectedRoute>
                                )
                             }
                           />
                         );
                        })}
                       
                        {/* Legacy UUID-based profile redirects */}
                        <Route path="/profile/:id" element={<ProfileUrlRedirect />} />
                        <Route path="/network/people/:id" element={<ProfileUrlRedirect />} />
                        <Route path="/user/:id" element={<ProfileUrlRedirect />} />
                         <Route path="/platform" element={<Platform />} />
                          <Route path="/career-platform" element={
                            <React.Suspense fallback={
                              <StableContainer minHeight="100vh" className="flex items-center justify-center">
                                <div className="text-center space-y-4">
                                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                  <p className="text-muted-foreground">Loading Career Platform...</p>
                                </div>
                              </StableContainer>
                            }>
                              <CareerPlatformShowcasePage />
                            </React.Suspense>
                          } />
                           {/* Career Platform feature routes */}
                           <Route path="/ai/advanced-hub" element={<AIAgentDashboard />} />
                           <Route path="/embed-test" element={<EmbedTestPage />} />
                          <Route path="/career-intelligence" element={<AICareerIntelligence />} />
                          <Route path="/skills-assessment" element={<SkillsGap />} />
                          <Route path="/roadmap" element={<CareerRoadmapGenerator />} />
                          <Route path="/career-goals" element={<CareerGoals />} />
                          <Route path="/debug" element={<DebugPage />} />
                           <Route path="/passport" element={<ProtectedRoute><CareerPassportDashboard /></ProtectedRoute>} />
                           <Route path="/passport/user/:userId" element={<CareerPassportDashboard />} />
                             {/* Legacy UUID-based passport redirect - instant redirect */}
                             <Route path="/passport/:userId" element={<FastPassportRedirect />} />
                           <Route path="/passport/:username" element={<CareerPassportDashboard />} />
                           <Route path="/@:username" element={<CareerPassportDashboard />} />
                            <Route path="/qr-networking" element={<ProtectedRoute><QRNetworking /></ProtectedRoute>} />
                            <Route path="/career-intelligence-dashboard" element={<ProtectedRoute><CareerIntelligenceDashboard /></ProtectedRoute>} />
                            <Route path="/instant-networking" element={<ProtectedRoute><InstantNetworkingSystem /></ProtectedRoute>} />
                              <Route path="/skills-verification" element={<ProtectedRoute><SkillsVerificationCenter /></ProtectedRoute>} />
                              <Route path="/achievements" element={<ProtectedRoute><DynamicAchievementSystem /></ProtectedRoute>} />
                              <Route path="/roadmap-builder" element={<ProtectedRoute><InteractiveCareerRoadmapBuilder /></ProtectedRoute>} />
                              <Route path="/complete-intelligence" element={<ProtectedRoute><CompletedCareerIntelligenceSystem /></ProtectedRoute>} />
                         <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                          <Route path="/mobile/reels" element={<ProtectedRoute><React.Suspense fallback={<div>Loading...</div>}><MobileReelsPage /></React.Suspense></ProtectedRoute>} />
                           <Route path="/mobile/passport" element={<ProtectedRoute><MobilePassport /></ProtectedRoute>} />
                       <Route path="/resume-builder/upload-enhanced" element={<EnhancedUploadResume />} />
                       <Route path="/resume/new" element={<ResumeNew />} />
                        <Route path="/resume/builder" element={<ResumeBuilderV2 />} />
                        <Route path="/resume/templates" element={<ResumeTemplates />} />
                        <Route path="/resume/edit/:id" element={<ResumeEdit />} />
                        <Route path="/resume/ai-enhancement" element={<ProtectedRoute><AIEnhancement /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                        <Route path="/talent-database" element={<ProtectedRoute><AdminLayout><TalentDatabase /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/security" element={<ProtectedRoute><AdminLayout><SecurityCenter /></AdminLayout></ProtectedRoute>} />
                        <Route path="/admin/prd" element={<ProtectedRoute><AdminLayout><ProductRequirementDocument /></AdminLayout></ProtectedRoute>} />
                        <Route path="/seo-suite" element={<SEOSuite />} />
                         <Route path="/admin/scraped-applications" element={<ProtectedRoute><AdminLayout><AdminScrapedJobApplications /></AdminLayout></ProtectedRoute>} />
                         <Route path="/admin/edge-functions-monitor" element={<ProtectedRoute><AdminLayout><EdgeFunctionsMonitor /></AdminLayout></ProtectedRoute>} />
                         <Route path="/admin/news-management" element={<ProtectedRoute><AdminLayout><NewsManagement /></AdminLayout></ProtectedRoute>} />
                         <Route path="/news" element={<NewsPage />} />
                         <Route path="/news/:slug" element={<NewsPage />} />
                         <Route path="/employer/cv-database" element={<CVDatabase />} />
                         {/* <Route path="/employer/outreach" element={<OutreachCampaign />} /> */}
                        
                        {/* Real-time Features */}
                        <Route path="/video-call/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
                        <Route path="/chat/:chatId" element={<ProtectedRoute><RealTimeChat /></ProtectedRoute>} />
                        <Route path="/live-event/:eventId" element={<ProtectedRoute><LiveEvent /></ProtectedRoute>} />
                      
                      {/* Legacy resume builder redirects */}
                       <Route path="/resume" element={<Navigate to="/resume/new" replace />} />
                       <Route path="/resume/create" element={<Navigate to="/resume/new" replace />} />
                       <Route path="/resume-builder" element={<Navigate to="/resume/new" replace />} />
                        <Route path="/resume-builder/*" element={<Navigate to="/resume/new" replace />} />
                        <Route path="/resume-builder/edit/:id" element={<Navigate to="/resume/edit/:id" replace />} />
                        
                        {/* Tools Routes */}
                        <Route path="/tools" element={<ToolsHub />} />
                        <Route path="/tools/resume-check" element={<ResumeChecker />} />
                        <Route path="/tools/cover-letter" element={<CoverLetterGenerator />} />
                        <Route path="/tools/interview-prep" element={<InterviewPrep />} />
                        <Route path="/tools/profile-optimizer" element={<ProfileOptimizer />} />
                        <Route path="/tools/salary-analyzer" element={<SalaryAnalyzer />} />
                        <Route path="/tools/skill-assessor" element={<SkillAssessor />} />
                        <Route path="/tools/job-matcher" element={<JobMatcher />} />
                        <Route path="/public/resume-builder" element={<PublicResumeBuilder />} />
                        <Route path="/public/jobs" element={<PublicJobSearch />} />
                        <Route path="/public/market-insights" element={<PublicMarketInsights />} />
                        <Route path="/public/interview-prep" element={<PublicInterviewPrep />} />
                      
                       {/* Privacy policy redirect for consistency */}
                       <Route path="/privacy" element={<Navigate to="/privacypolicy" replace />} />
                       
                       {/* Onboarding redirect */}
                       <Route path="/onboarding" element={<Navigate to="/auth/register" replace />} />
                      
       {/* SEO Routes - Dynamic categories */}
                      <Route path="/jobs/role/:role" element={<JobsByRole />} />
                      <Route path="/jobs/location/:location" element={<JobsByLocation />} />
                      <Route path="/jobs/skill/:skill" element={<JobsBySkill />} />
                      <Route path="/jobs/:role/:location" element={<SEOJobsRoleLocation />} />
                      <Route path="/companies/location/:location" element={<SEOCompaniesLocation />} />
                       <Route path="/posts/:id" element={<SEOPosts />} />
                       
                       {/* Blog Routes */}
                       <Route path="/blog" element={<Blog />} />
                       <Route path="/blog/:slug" element={<BlogPost />} />
                       
                       {/* Enhanced Hierarchical SEO Routes for 2M Pages */}
                      <Route path="/jobs/:type/:location" element={<JobsByLocation />} />
                      <Route path="/jobs/:type/:location/:role" element={<JobsByRole />} />
                      <Route path="/jobs/remote/:role" element={<JobsByRole />} />
                      <Route path="/jobs/skill/:skill/:location" element={<JobsBySkill />} />
                      <Route path="/network/:category" element={<SEOPosts />} />
                      <Route path="/network/:category/:topic" element={<SEOPosts />} />
                      <Route path="/tools/:category" element={<JobsByRole />} />
                      <Route path="/tools/:category/:toolName" element={<JobsByRole />} />
                      <Route path="/tools/resume-builder/:template" element={<JobsByRole />} />
                      <Route path="/services/:type" element={<JobsByRole />} />
                      <Route path="/services/:type/:serviceName" element={<JobsByRole />} />
                      <Route path="/services/resume-writing/:template" element={<JobsByRole />} />
                      <Route path="/learning/:category" element={<JobsByRole />} />
                      <Route path="/learning/:category/:courseName" element={<JobsByRole />} />
                      <Route path="/learning/paths/:skill" element={<JobsByRole />} />
                      <Route path="/colleges/:location" element={<SEOCompaniesLocation />} />
                      <Route path="/colleges/:location/:collegeName" element={<SEOCompaniesLocation />} />
                      <Route path="/colleges/:location/:field" element={<SEOCompaniesLocation />} />
                      <Route path="/career-map/:industry" element={<JobsByRole />} />
                      <Route path="/career-map/:industry/:path" element={<JobsByRole />} />
                      <Route path="/career-map/progression/:role" element={<JobsByRole />} />
                      <Route path="/companies/:location/:industry" element={<SEOCompaniesLocation />} />
                      <Route path="/companies/size/:size/:location" element={<SEOCompaniesLocation />} />
                       <Route path="/employer/resources/:topic" element={<JobsByRole />} />
                       
                        {/* Company Profile Routes */}
                        <Route path="/company/:slug" element={<CompanyDetail />} />
                        <Route path="/companies/:id" element={<CompanyDetail />} />
                       
                       {/* Enhanced SEO Demo Route */}
                       <Route path="/seo-demo/:type" element={<EnhancedSEODemoWrapper />} />
                      
                      {/* Sitemap routes */}
                      <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                      <Route path="/sitemap-dynamic.xml" element={<SitemapRedirect />} />
                      
       {/* SEO Routes - Note: These should be handled by server/CDN level redirects in production */}
                        </Routes>
                        </React.Suspense>
                     </main>
                     
                     <InstallPrompt />
                     <InstallButton />
                     <IOSInstallPrompt />
                   </div>
                 </MobileAppWrapper>
                  <Analytics />
                </CopilotProvider>
                {/* </RealtimeProvider> */}
                {/* </AIProvider> */}
              {/* </SecurityProvider> */}
                    </NotificationProvider>
                  </AuthErrorRecovery>
                </AuthProvider>
              </AuthErrorBoundary>
            </AnalyticsProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </ReactErrorBoundary>
  );
};

export default App;
