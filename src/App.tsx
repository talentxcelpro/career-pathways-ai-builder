
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems, NavItem } from "./nav-items";
import { Navbar } from "./components/navigation/Navbar";
import { Footer } from "./components/layout/Footer";
import { OfflineIndicator } from "./components/shared/OfflineIndicator";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

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

// Routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/callback'];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <OfflineIndicator />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {navItems.map((item: NavItem) => {
                  const isPublicRoute = publicRoutes.includes(item.to);
                  
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
                      {...(item.exact && { index: item.to === "/" })}
                    />
                  );
                })}
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
        <Analytics />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
