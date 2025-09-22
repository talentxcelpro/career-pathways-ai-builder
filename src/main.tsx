import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'
import './utils/ultraFastLoader'
import './utils/instantLoader'
import './utils/appleOptimizations'

// Ensure React is globally available and properly initialized
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <React.StrictMode>
    <AppWrapper />
    <SpeedInsights />
  </React.StrictMode>
);
