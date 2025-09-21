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

// Phase 4: Initialize performance optimizations - deferred for faster initial load
if (typeof window !== 'undefined') {
  // Check connection speed first
  const connection = (navigator as any).connection;
  const isSlowConnection = connection?.effectiveType?.includes('2g') || connection?.effectiveType === '3g';
  
  // Defer performance initialization based on connection speed
  const initDelay = isSlowConnection ? 2000 : 500;
  
  setTimeout(() => {
    // Only load bundle optimizer immediately for slow connections
    if (isSlowConnection) {
      import('./utils/bundleOptimizer').then(({ initializeBundleOptimization }) => {
        initializeBundleOptimization();
      });
    }
    
    // Load other optimizations when idle
    requestIdleCallback(() => {
      Promise.all([
        import('./utils/performanceOptimizer'),
        !isSlowConnection ? import('./utils/bundleOptimizer') : Promise.resolve({ initializeBundleOptimization: () => {} }),
        import('./utils/lazyLoading')
      ]).then(([
        { initializePerformanceOptimizations },
        { initializeBundleOptimization },
        { initializeLazyLoading }
      ]) => {
        try {
          initializePerformanceOptimizations();
          if (!isSlowConnection) initializeBundleOptimization();
          initializeLazyLoading();
        } catch (error) {
          console.warn('Performance initialization failed:', error);
        }
      }).catch(error => {
        console.warn('Failed to load performance modules:', error);
      });
    });
  }, initDelay);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
    <SpeedInsights />
  </React.StrictMode>
);
