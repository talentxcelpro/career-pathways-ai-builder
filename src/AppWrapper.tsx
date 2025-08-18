import React from "react";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { GlobalPerformanceOptimizer } from "./components/performance/GlobalPerformanceOptimizer";

export const AppWrapper: React.FC = () => {
  return (
    <HelmetProvider>
      <GlobalPerformanceOptimizer enableVirtualization={true} preloadCritical={true}>
        <App />
      </GlobalPerformanceOptimizer>
    </HelmetProvider>
  );
};