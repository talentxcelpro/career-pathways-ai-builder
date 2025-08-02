import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'
import { PerformanceMonitor } from './components/performance/PerformanceMonitor.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PerformanceMonitor>
      <AppWrapper />
    </PerformanceMonitor>
  </React.StrictMode>
);
