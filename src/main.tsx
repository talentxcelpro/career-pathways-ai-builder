import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async'

import './index.css'

// Import ultra-performance optimizations
import { hyperPerformanceCore } from './utils/hyperPerformanceCore'
import { appleStyleLoader } from './utils/appleStyleLoader'

// Initialize performance optimizations immediately
hyperPerformanceCore.init();
appleStyleLoader.init();

// Simplified and safer React initialization
const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

const root = createRoot(container);

// Direct render without complex wrappers that might interfere with React's internal dispatcher
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
