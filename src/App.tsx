import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

// Simple error fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
    <p className="text-gray-600">{error.message}</p>
  </div>
);

// Create query client
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <header className="bg-primary text-primary-foreground p-4">
              <h1 className="text-2xl font-bold">TalentXcel Platform</h1>
            </header>
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Welcome to TalentXcel</h2>
                    <p className="text-gray-600">Your Career Growth Platform</p>
                  </div>
                } />
                <Route path="*" element={
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
                    <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;