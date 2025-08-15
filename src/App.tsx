import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { Footer } from "./components/layout/Footer";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
// import { AIProvider } from "./contexts/AIContext";
// import { SecurityProvider } from "./components/security/SecurityProvider";
import { ContentSecurityPolicy } from "./components/security/ContentSecurityPolicy";
import { CopilotProvider } from "@/components/ai/CopilotProvider";
import { SitemapRedirect } from "@/components/seo/SitemapRedirect";
import { SEOJobsLocation } from "@/components/seo/SEOJobsLocation";
import { SEOJobsRole } from "@/components/seo/SEOJobsRole";
import { SEOJobsRoleLocation } from "@/components/seo/SEOJobsRoleLocation";
import { SEOCompaniesLocation } from "@/components/seo/SEOCompaniesLocation";
import { SEOPosts } from "@/components/seo/SEOPosts";
import { JobUrlRedirect } from "@/components/seo/JobUrlRedirect";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import ResumeNew from './pages/resume/ResumeNew';
import { ResumeEditorPage as ResumeEdit } from './pages/resume/ResumeEditorPage';
import UnifiedDashboard from './pages/UnifiedDashboard';
import UserManagement from "@/pages/admin/UserManagement";
import TalentDatabase from "@/pages/admin/TalentDatabase";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
import JobsByRole from "@/pages/JobsByRole";
import JobsByLocation from "@/pages/JobsByLocation";
import JobsBySkill from "@/pages/JobsBySkill";
import Platform from "./pages/Platform";
import CareerPassportDashboard from "./pages/passport/CareerPassportDashboard";
// import { CVDatabase } from "@/components/employer/CVDatabase";
// import { OutreachCampaign } from "@/components/employer/OutreachCampaign";

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
  '/passport/:userId',
  '/auth/login', 
  '/auth/register', 
  '/auth/forgot-password', 
  '/auth/reset-password', 
  '/auth/callback',
  '/jobs',
  '/jobs/:id',
  '/companies',
  '/companies/:id',
  '/:slug', // Company slug route
  '/profile/:id',
  '/employer', // Employer landing page (shows different content based on auth)
  '/employer/request-access',
  '/employer/team/accept/:token' // Invitation acceptance
];

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AnalyticsProvider>
            <AuthProvider>
              {/* <SecurityProvider> */}
                {/* <AIProvider> */}
                <CopilotProvider>
                  <ContentSecurityPolicy />
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
                  <div className="min-h-screen flex flex-col">
                    <OfflineIndicator />
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                      {navItems.map((item: NavItem) => {
                         // Check if route is explicitly marked as public or in our public routes list
                         const isPublicRoute = item.requiresAuth === false || publicRoutes.some(route => {
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
                               isPublicRoute ? (
                                 item.page
                               ) : item.to.startsWith('/admin') ? (
                                 <ProtectedRoute><AdminLayout>{item.page}</AdminLayout></ProtectedRoute>
                               ) : (
                                 <ProtectedRoute>{item.page}</ProtectedRoute>
                               )
                            }
                          />
                        );
                       })}
                       <Route path="/platform" element={<Platform />} />
                       <Route path="/passport" element={<ProtectedRoute><CareerPassportDashboard /></ProtectedRoute>} />
                       <Route path="/passport/:userId" element={<CareerPassportDashboard />} />
                       <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                      <Route path="/resume-builder/upload-enhanced" element={<EnhancedUploadResume />} />
                      <Route path="/resume/new" element={<ResumeNew />} />
                      <Route path="/resume/edit/:id" element={<ResumeEdit />} />
                       <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
                       <Route path="/admin/talent-database" element={<ProtectedRoute><AdminLayout><TalentDatabase /></AdminLayout></ProtectedRoute>} />
                       <Route path="/admin/security" element={<ProtectedRoute><AdminLayout><SecurityCenter /></AdminLayout></ProtectedRoute>} />
                       <Route path="/admin/scraped-applications" element={<ProtectedRoute><AdminLayout><AdminScrapedJobApplications /></AdminLayout></ProtectedRoute>} />
                      {/* <Route path="/employer/cv-database" element={<CVDatabase />} />
                      <Route path="/employer/outreach" element={<OutreachCampaign />} /> */}
                      
                      {/* Legacy resume builder redirects */}
                      <Route path="/resume" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder/*" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder/edit/:id" element={<Navigate to="/resume/edit/:id" replace />} />
                      
                      {/* Privacy policy redirect for consistency */}
                      <Route path="/privacy" element={<Navigate to="/privacypolicy" replace />} />
                      
{/* SEO Routes - Dynamic categories */}
                      <Route path="/jobs/role/:role" element={<JobsByRole />} />
                      <Route path="/jobs/location/:location" element={<JobsByLocation />} />
                      <Route path="/jobs/skill/:skill" element={<JobsBySkill />} />
                      <Route path="/jobs/:role/:location" element={<SEOJobsRoleLocation />} />
                      <Route path="/companies/location/:location" element={<SEOCompaniesLocation />} />
                      <Route path="/posts/:id" element={<SEOPosts />} />
                      
                      {/* Sitemap route */}
                      <Route path="/sitemap.xml" element={<SitemapRedirect />} />
                      <Route path="/sitemap-dynamic.xml" element={<SitemapRedirect />} />
                      
{/* SEO Routes - Note: These should be handled by server/CDN level redirects in production */}
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </MobileAppWrapper>
                  <Analytics />
                </CopilotProvider>
                {/* </AIProvider> */}
              {/* </SecurityProvider> */}
            </AuthProvider>
          </AnalyticsProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
