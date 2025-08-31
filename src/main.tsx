import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppWrapper } from './AppWrapper.tsx'
import { PerformanceMonitor } from './components/performance/PerformanceMonitor.tsx'
import './utils/resourcePreloader'
import './utils/performanceBudget'
import './utils/serviceWorker'
import './utils/imageOptimizer'
import './utils/criticalCSS'
import './utils/layoutStability'
import './utils/networkOptimization'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PerformanceMonitor>
      <AppWrapper />
      <SpeedInsights />
    </PerformanceMonitor>
  </React.StrictMode>
);
