import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppWrapper } from './AppWrapper.tsx'

import './utils/resourcePreloader'
import './utils/performanceBudget'
import './utils/serviceWorker'
import './utils/imageOptimizer'
import './utils/criticalCSS'
import './utils/layoutStability'
import './utils/networkOptimization'
import './index.css'

// Phase 4: Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Dynamic imports to avoid blocking initial load
  Promise.all([
    import('./utils/performanceOptimizer'),
    import('./utils/bundleOptimizer'),
    import('./utils/lazyLoading')
  ]).then(([
    { initializePerformanceOptimization },
    { initializeBundleOptimization },
    { initializeLazyLoading }
  ]) => {
    initializePerformanceOptimization();
    initializeBundleOptimization();
    initializeLazyLoading();
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
    <SpeedInsights />
  </React.StrictMode>
);
