import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { NavItem } from "./types/nav-item";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";

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

const BundleErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-6 text-red-500">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={BundleErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <header className="bg-background border-b p-4">
                <h1 className="text-xl font-bold">TalentXcel</h1>
              </header>
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
            </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;