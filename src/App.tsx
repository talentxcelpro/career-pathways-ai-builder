import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { Footer } from "./components/layout/Footer";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { AIProvider } from "./contexts/AIContext";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';

// Create query client with simpler configuration to avoid potential issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Routes that don't require authentication - updated to include job viewing and public post routes
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
  '/employer/team/accept/:token', // Invitation acceptance
  '/p/post/:postId', // Public post route
  '/p/job/:jobId', // Public job route (future)
  '/p/company/:companyId', // Public company route (future)
  '/p/college/:collegeId', // Public college route (future)
  '/p/article/:articleId', // Public article route (future)
  '/p/profile/:profileId' // Public profile route (future)
];

const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <TooltipProvider>
          <AnalyticsProvider>
            <AuthProvider>
              <AIProvider>
                <Toaster />
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
                    
                    {/* Legacy resume builder redirects */}
                    <Route path="/resume" element={<Navigate to="/resume/new" replace />} />
                    <Route path="/resume-builder" element={<Navigate to="/resume/new" replace />} />
                    <Route path="/resume-builder/*" element={<Navigate to="/resume/new" replace />} />
                    <Route path="/resume-builder/edit/:id" element={<Navigate to="/resume/edit/:id" replace />} />
                  </Routes>
                  </main>
                  <Footer />
                </div>
                <Analytics />
              </AIProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
