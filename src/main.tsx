import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'

// Critical initialization only - remove complex optimizations that may conflict with React
if (typeof window !== 'undefined') {
  // Basic font preload
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}

// Ensure React is properly available
if (typeof React === 'undefined') {
  console.error('React is not properly loaded');
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
    <SpeedInsights />
  </React.StrictMode>
);
