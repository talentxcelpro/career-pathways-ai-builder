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
import AuthPage from "./pages/AuthPage";

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
import GamificationCenter from "./pages/GamificationCenter";
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
  '/auth',
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
  // Initialize performance optimizations once on startup
  useEffect(() => {
    initializePerformanceOptimizations();
    // performanceOptimizer.initialize();
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
                            {/* Auth Route */}
                            <Route path="/auth" element={
                              <ProtectedRoute requireAuth={false}>
                                <AuthPage />
                              </ProtectedRoute>
                            } />
                            
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

                        {/* Additional protected routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                        <Route path="/passport" element={<ProtectedRoute><CareerPassportDashboard /></ProtectedRoute>} />
                       
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
                          </Routes>
                        </React.Suspense>
                    </main>
                    <FooterWrapper />
                    <InstallPrompt />
                    <IOSInstallPrompt />
                  </div>
                </MobileAppWrapper>
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

const AppWrapper = () => {
  return (
    <HelmetProvider>
      <App />
      <Analytics />
    </HelmetProvider>
  );
};

export default AppWrapper;