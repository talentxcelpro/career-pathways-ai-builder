import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { OptimizedAuthProvider } from "./contexts/OptimizedAuthContext";
import { ErrorBoundary } from "react-error-boundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";

// Essential performance utilities
import { turboCore } from "@/utils/turboCore";
import { initializePerformanceOptimizations } from '@/utils/performanceOptimizations';

// Create query client optimized for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 15 * 60 * 1000,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => {
  useEffect(() => {
    try {
      performance.mark('app-init-start');
      
      requestIdleCallback(() => {
        if (turboCore && typeof turboCore.init === 'function') {
          turboCore.init();
        }
        initializePerformanceOptimizations();
        performance.mark('app-init-complete');
        performance.measure('app-initialization', 'app-init-start', 'app-init-complete');
      });
      
    } catch (error) {
      console.warn('App initialization error:', error);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <OptimizedAuthProvider>
              <NotificationProvider>
                <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                  <TooltipProvider>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        <React.Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
                          <Routes>
                            {navItems.map((item: NavItem) => (
                              <Route 
                                key={item.to} 
                                path={item.to} 
                                element={item.page}
                              />
                            ))}
                            
                            <Route path="*" element={
                              <div className="flex items-center justify-center min-h-[50vh]">
                                <div className="text-center">
                                  <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                                  <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                                </div>
                              </div>
                            } />
                          </Routes>
                        </React.Suspense>
                      </main>
                    </div>
                  </TooltipProvider>
                </React.Suspense>
                <Toaster />
              </NotificationProvider>
            </OptimizedAuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;