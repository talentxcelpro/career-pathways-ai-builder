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
import { AIProvider } from "./contexts/AIContext";
import { FloatingChatbot } from "./components/ai-agent/FloatingChatbot";

import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobileAppInitializer } from "./components/MobileAppInitializer";
import EnhancedUploadResume from './pages/resume/EnhancedUploadResume';

// Create query client with better default configurations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
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
                  <FloatingChatbot />
                </div>
              </AIProvider>
            </AuthProvider>
          </AnalyticsProvider>
          <Analytics />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
