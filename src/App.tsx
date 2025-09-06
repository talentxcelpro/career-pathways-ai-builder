import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { UnifiedHeader } from "@/components/navigation/UnifiedHeader";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
// import { AIProvider } from "./contexts/AIContext";
// import { SecurityProvider } from "./components/security/SecurityProvider";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import { InstallPrompt, InstallButton } from '@/components/pwa/InstallPrompt';
import { IOSInstallPrompt } from '@/components/pwa/IOSInstallPrompt';
import { CopilotProvider } from "@/components/ai/CopilotProvider";
// import { RealtimeProvider } from "@/components/realtime/RealtimeProvider";
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

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { PublicAccessGuard } from "./components/auth/PublicAccessGuard";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import ResumeNew from './pages/resume/ResumeNew';
import ToolsHub from './pages/tools/ToolsHub';
import PublicResumeBuilder from './pages/tools/PublicResumeBuilder';
import PublicJobSearch from './pages/tools/PublicJobSearch';
import PublicMarketInsights from './pages/tools/PublicMarketInsights';
import PublicInterviewPrep from './pages/tools/PublicInterviewPrep';
import { ResumeEditorPage as ResumeEdit } from './pages/resume/ResumeEditorPage';
import UnifiedDashboard from './pages/UnifiedDashboard';
import MobileReelsPage from './pages/MobileReelsPage';
import { MobilePassport } from './pages/mobile/MobilePassport';
import UserManagement from "@/pages/admin/UserManagement";
import TalentDatabase from "@/pages/admin/TalentDatabase";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
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

// Create query client optimized for SEO content caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes for regular queries
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
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
  '/network/people/:id',
  '/mobile/network',
  '/employer', // Employer landing page (shows different content based on auth)
  '/employer/request-access',
  '/employer/team/accept/:token' // Invitation acceptance
];

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
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
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
                <MobileAppInitializer />
                <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
                <SearchConsoleVerification verificationCode="nTmI_33A3373kHEXPI2gE41jbDB1Xly7qKUBaAucsnM" />
                <MobileAppWrapper>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <OfflineIndicator />
                      <AppSidebar />
                      <SidebarInset>
                        <main className="flex-1 p-4">
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
                         <Route path="/platform" element={<Platform />} />
                         <Route path="/debug" element={<DebugPage />} />
                          <Route path="/passport" element={<ProtectedRoute><CareerPassportDashboard /></ProtectedRoute>} />
                          <Route path="/passport/user/:userId" element={<CareerPassportDashboard />} />
                            {/* Legacy UUID-based passport redirect - instant redirect */}
                            <Route path="/passport/:userId" element={<FastPassportRedirect />} />
                          <Route path="/passport/:username" element={<CareerPassportDashboard />} />
                          <Route path="/@:username" element={<CareerPassportDashboard />} />
                         <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                          <Route path="/mobile/reels" element={<ProtectedRoute><MobileReelsPage /></ProtectedRoute>} />
                           <Route path="/mobile/passport" element={<ProtectedRoute><MobilePassport /></ProtectedRoute>} />
                      <Route path="/resume-builder/upload-enhanced" element={<EnhancedUploadResume />} />
                      <Route path="/resume/new" element={<ResumeNew />} />
                      <Route path="/resume/edit/:id" element={<ResumeEdit />} />
                       <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                       <Route path="/talent-database" element={<ProtectedRoute><AdminLayout><TalentDatabase /></AdminLayout></ProtectedRoute>} />
                       <Route path="/admin/security" element={<ProtectedRoute><AdminLayout><SecurityCenter /></AdminLayout></ProtectedRoute>} />
                       <Route path="/admin/scraped-applications" element={<ProtectedRoute><AdminLayout><AdminScrapedJobApplications /></AdminLayout></ProtectedRoute>} />
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
                        <OnboardingFlow />
                        <InstallPrompt />
                        <InstallButton />
                        <IOSInstallPrompt />
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
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
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
