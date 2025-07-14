
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { Footer } from "./components/layout/Footer";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { GoogleAnalytics } from "./components/analytics/GoogleAnalytics";
import { SearchConsoleVerification } from "./components/analytics/SearchConsoleVerification";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { MobileAppInitializer } from "./components/MobileAppInitializer";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AnalyticsProvider>
          <AuthProvider>
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
                </Routes>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </AnalyticsProvider>
        <Analytics />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
