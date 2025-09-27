import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";
import { MobileAppWrapper } from "./components/mobile/MobileAppWrapper";

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
  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <Toaster
                duration={10000}
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    marginTop: '80px',
                  },
                }}
              />
              <MobileAppWrapper>
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
                        <Route path="*" element={<div className="p-6">404 - Page not found</div>} />
                      </Routes>
                    </React.Suspense>
                  </main>
                  <FooterWrapper />
                </div>
              </MobileAppWrapper>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;