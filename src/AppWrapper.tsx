import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// Create a separate query client to isolate potential issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppWrapper: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};