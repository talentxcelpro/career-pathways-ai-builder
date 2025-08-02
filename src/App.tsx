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

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';
import UserManagement from "@/pages/admin/UserManagement";
import SecurityCenter from "@/pages/admin/SecurityCenter";
import { AdminScrapedJobApplications } from "@/components/admin/AdminScrapedJobApplications";
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
                <SearchConsoleVerification verificationCode="your-search-console-verification-code" />
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
                              ) : (
                                <ProtectedRoute>{item.page}</ProtectedRoute>
                              )
                            }
                          />
                        );
                      })}
                      <Route path="/resume-builder/upload-enhanced" element={<EnhancedUploadResume />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/security" element={<SecurityCenter />} />
                      <Route path="/admin/scraped-applications" element={<AdminScrapedJobApplications />} />
                      {/* <Route path="/employer/cv-database" element={<CVDatabase />} />
                      <Route path="/employer/outreach" element={<OutreachCampaign />} /> */}
                      
                      {/* Legacy resume builder redirects */}
                      <Route path="/resume" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder/*" element={<Navigate to="/resume/new" replace />} />
                      <Route path="/resume-builder/edit/:id" element={<Navigate to="/resume/edit/:id" replace />} />
                      
{/* SEO Routes - Note: These should be handled by server/CDN level redirects in production */}
                    </Routes>
                  </main>
                  <Footer />
                </div>
                  <Analytics />
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
