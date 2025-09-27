import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { Navbar } from "./components/navigation/Navbar";
import { FooterWrapper } from "./components/layout/FooterWrapper";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";
import { BundleErrorFallback } from "./components/BundleErrorFallback";

// Create minimal query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
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
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 p-4">
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
              </main>
              <FooterWrapper />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;