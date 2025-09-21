import React, { useEffect } from "react";
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
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import SubdomainGateway from "@/pages/SubdomainGateway";
// import { AIProvider } from "./contexts/AIContext";
// import { SecurityProvider } from "./components/security/SecurityProvider";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { HelmetProvider } from 'react-helmet-async';
import { InstallPrompt, InstallButton } from '@/components/pwa/InstallPrompt';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { CopilotProvider } from "@/components/ai/CopilotProvider";
// import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
import { SitemapRedirect } from "@/components/seo/SitemapRedirect";
import { initializePerformanceOptimizations } from "@/utils/performanceOptimizer";
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

// Direct imports for lightweight/critical components only
import PublicResumeBuilder from './pages/tools/PublicResumeBuilder';
import PublicJobSearch from './pages/tools/PublicJobSearch';
import PublicMarketInsights from './pages/tools/PublicMarketInsights';
import PublicInterviewPrep from './pages/tools/PublicInterviewPrep';
import { ResumeEditorPage as ResumeEdit } from './pages/resume/ResumeEditorPage';
import { MobilePassport } from './pages/mobile/MobilePassport';
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
import { CVDatabase } from "@/components/employer/CVDatabase";
import { VideoCall } from "@/components/realtime/VideoCall";
import { RealTimeChat } from "@/components/realtime/RealTimeChat";
import { LiveEvent } from "@/components/realtime/LiveEvent";
import UserProfile from "./pages/UserProfile";
import CompanyDetail from "./pages/companies/CompanyDetail";
import SkillsGap from "./pages/career-map/SkillsGap";
import CareerRoadmapGenerator from "./components/career/CareerRoadmapGenerator";
import CareerGoals from "./pages/CareerGoals";
import SEOSuite from "./pages/SEOSuite";
import AIEnhancement from "./pages/resume/AIEnhancement";
import CareerIntelligenceDashboard from "./pages/CareerIntelligenceDashboard";
import { SkillsVerificationCenter } from "./pages/SkillsVerificationCenter";
import DynamicAchievementSystem from "./pages/DynamicAchievementSystem";
import InteractiveCareerRoadmapBuilder from "./pages/InteractiveCareerRoadmapBuilder";
import { CompletedCareerIntelligenceSystem } from "./pages/CompletedCareerIntelligenceSystem";
import { StableContainer } from "@/utils/layoutOptimizer";
import "@/utils/flickerFix";
import { performanceOptimizer } from "@/utils/performanceOptimizer.v2";
const CareerPlatformShowcasePage = React.lazy(() => import("./pages/CareerPlatformShowcase"));

// Lazy load heavy components for better code splitting
const EnhancedUploadResume = React.lazy(() => import('./pages/resume/EnhancedUploadResume'));
const ResumeNew = React.lazy(() => import('./pages/resume/ResumeNew'));
const ToolsHub = React.lazy(() => import('./pages/tools/ToolsHub'));
const ResumeBuilderV2 = React.lazy(() => import('./pages/resume/ResumeBuilderV2'));
const UnifiedDashboard = React.lazy(() => import('./pages/UnifiedDashboard'));
const MobileReelsPage = React.lazy(() => import('./pages/MobileReelsPage'));
const UserManagement = React.lazy(() => import("@/pages/admin/UserManagement"));
const TalentDatabase = React.lazy(() => import("@/pages/admin/TalentDatabase"));
const SecurityCenter = React.lazy(() => import("@/pages/admin/SecurityCenter"));
const AIAgentDashboard = React.lazy(() => import("./pages/ai/AIAgentDashboard"));
const AICareerIntelligence = React.lazy(() => import("./pages/AICareerIntelligence"));
const CareerPassportDashboard = React.lazy(() => import("./pages/passport/CareerPassportDashboard"));
const QRNetworking = React.lazy(() => import("./pages/QRNetworking"));
const InstantNetworkingSystem = React.lazy(() => import("./pages/InstantNetworkingSystem"));

// Optimized loading component
const LoadingFallback = ({ text = "Loading..." }: { text?: string }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="text-center space-y-2">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Create query client optimized for 2-3G networks
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // Longer stale time for slow networks
      retry: (failureCount, error) => {
        // Reduce retries on slow connections
        const connection = (navigator as any).connection;
        const isSlowConnection = connection?.effectiveType?.includes('2g');
        return failureCount < (isSlowConnection ? 1 : 2);
      },
      refetchOnWindowFocus: false,
      gcTime: 30 * 60 * 1000, // Longer cache for slow networks
      networkMode: 'online',
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
      <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AnalyticsProvider>
              <AuthErrorBoundary>
                <AuthProvider>
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
                            {/* Career Platform feature routes - lazy loaded */}
                            <Route path="/ai/advanced-hub" element={
                              <React.Suspense fallback={<LoadingFallback text="Loading AI Hub..." />}>
                                <AIAgentDashboard />
                              </React.Suspense>
                            } />
                            <Route path="/embed-test" element={<EmbedTestPage />} />
                           <Route path="/career-intelligence" element={
                             <React.Suspense fallback={<LoadingFallback text="Loading Career Intelligence..." />}>
                               <AICareerIntelligence />
                             </React.Suspense>
                           } />
                           <Route path="/skills-assessment" element={<SkillsGap />} />
                           <Route path="/roadmap" element={<CareerRoadmapGenerator />} />
                           <Route path="/career-goals" element={<CareerGoals />} />
                           <Route path="/debug" element={<DebugPage />} />
                            <Route path="/passport" element={
                              <ProtectedRoute>
                                <React.Suspense fallback={<LoadingFallback text="Loading Career Passport..." />}>
                                  <CareerPassportDashboard />
                                </React.Suspense>
                              </ProtectedRoute>
                            } />
                            <Route path="/passport/user/:userId" element={
                              <React.Suspense fallback={<LoadingFallback text="Loading Career Passport..." />}>
                                <CareerPassportDashboard />
                              </React.Suspense>
                            } />
                              {/* Legacy UUID-based passport redirect - instant redirect */}
                              <Route path="/passport/:userId" element={<FastPassportRedirect />} />
                            <Route path="/passport/:username" element={
                              <React.Suspense fallback={<LoadingFallback text="Loading Career Passport..." />}>
                                <CareerPassportDashboard />
                              </React.Suspense>
                            } />
                            <Route path="/@:username" element={
                              <React.Suspense fallback={<LoadingFallback text="Loading Career Passport..." />}>
                                <CareerPassportDashboard />
                              </React.Suspense>
                            } />
                             <Route path="/qr-networking" element={
                               <ProtectedRoute>
                                 <React.Suspense fallback={<LoadingFallback text="Loading QR Networking..." />}>
                                   <QRNetworking />
                                 </React.Suspense>
                               </ProtectedRoute>
                             } />
                             <Route path="/career-intelligence-dashboard" element={<ProtectedRoute><CareerIntelligenceDashboard /></ProtectedRoute>} />
                             <Route path="/instant-networking" element={
                               <ProtectedRoute>
                                 <React.Suspense fallback={<LoadingFallback text="Loading Networking..." />}>
                                   <InstantNetworkingSystem />
                                 </React.Suspense>
                               </ProtectedRoute>
                             } />
                               <Route path="/skills-verification" element={<ProtectedRoute><SkillsVerificationCenter /></ProtectedRoute>} />
                               <Route path="/achievements" element={<ProtectedRoute><DynamicAchievementSystem /></ProtectedRoute>} />
                               <Route path="/roadmap-builder" element={<ProtectedRoute><InteractiveCareerRoadmapBuilder /></ProtectedRoute>} />
                               <Route path="/complete-intelligence" element={<ProtectedRoute><CompletedCareerIntelligenceSystem /></ProtectedRoute>} />
                          <Route path="/dashboard" element={
                            <ProtectedRoute>
                              <React.Suspense fallback={<LoadingFallback text="Loading Dashboard..." />}>
                                <UnifiedDashboard />
                              </React.Suspense>
                            </ProtectedRoute>
                          } />
                           <Route path="/mobile/reels" element={
                             <ProtectedRoute>
                               <React.Suspense fallback={<LoadingFallback text="Loading Mobile Reels..." />}>
                                 <MobileReelsPage />
                               </React.Suspense>
                             </ProtectedRoute>
                           } />
                            <Route path="/mobile/passport" element={<ProtectedRoute><MobilePassport /></ProtectedRoute>} />
                        <Route path="/resume-builder/upload-enhanced" element={
                          <React.Suspense fallback={<LoadingFallback text="Loading Resume Upload..." />}>
                            <EnhancedUploadResume />
                          </React.Suspense>
                        } />
                        <Route path="/resume/new" element={
                          <React.Suspense fallback={<LoadingFallback text="Loading Resume Builder..." />}>
                            <ResumeNew />
                          </React.Suspense>
                        } />
                        <Route path="/resume/builder" element={
                          <React.Suspense fallback={<LoadingFallback text="Loading Resume Builder..." />}>
                            <ResumeBuilderV2 />
                          </React.Suspense>
                        } />
                         <Route path="/resume/edit/:id" element={<ResumeEdit />} />
                         <Route path="/resume/ai-enhancement" element={<ProtectedRoute><AIEnhancement /></ProtectedRoute>} />
                         <Route path="/admin/users" element={
                           <ProtectedRoute>
                             <AdminLayout>
                               <React.Suspense fallback={<LoadingFallback text="Loading User Management..." />}>
                                 <UserManagement />
                               </React.Suspense>
                             </AdminLayout>
                           </ProtectedRoute>
                         } />
                         <Route path="/talent-database" element={
                           <ProtectedRoute>
                             <AdminLayout>
                               <React.Suspense fallback={<LoadingFallback text="Loading Talent Database..." />}>
                                 <TalentDatabase />
                               </React.Suspense>
                             </AdminLayout>
                           </ProtectedRoute>
                         } />
                         <Route path="/admin/security" element={
                           <ProtectedRoute>
                             <AdminLayout>
                               <React.Suspense fallback={<LoadingFallback text="Loading Security Center..." />}>
                                 <SecurityCenter />
                               </React.Suspense>
                             </AdminLayout>
                           </ProtectedRoute>
                         } />
                         <Route path="/admin/prd" element={<ProtectedRoute><AdminLayout><ProductRequirementDocument /></AdminLayout></ProtectedRoute>} />
                         <Route path="/seo-suite" element={<SEOSuite />} />
                          <Route path="/admin/scraped-applications" element={<ProtectedRoute><AdminLayout><AdminScrapedJobApplications /></AdminLayout></ProtectedRoute>} />
                          <Route path="/admin/edge-functions-monitor" element={<ProtectedRoute><AdminLayout><EdgeFunctionsMonitor /></AdminLayout></ProtectedRoute>} />
                          <Route path="/admin/news-management" element={<ProtectedRoute><AdminLayout><NewsManagement /></AdminLayout></ProtectedRoute>} />
                          <Route path="/news" element={<NewsPage />} />
                          <Route path="/news/:slug" element={<NewsPage />} />
                          <Route path="/employer/cv-database" element={<CVDatabase />} />
                         
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
                     <FooterWrapper />
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
                </AuthProvider>
              </AuthErrorBoundary>
            </AnalyticsProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

// Initialize performance optimizations
const AppWrapper = () => {
  React.useEffect(() => {
    // Apply color scheme from localStorage
    const savedColorScheme = localStorage.getItem('colorScheme');
    if (savedColorScheme) {
      document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
    }
    
    // Initialize performance optimizations for better Core Web Vitals
    initializePerformanceOptimizations();
  }, []);

  return <App />;
};

export default AppWrapper;
