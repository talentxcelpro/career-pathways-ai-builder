import React from "react";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { PerformanceMonitor } from './components/performance/PerformanceMonitor';

export const AppWrapper: React.FC = () => {
  return (
    <HelmetProvider>
      <PerformanceMonitor>
        <App />
      </PerformanceMonitor>
    </HelmetProvider>
  );
};