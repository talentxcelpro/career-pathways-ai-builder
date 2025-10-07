import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { registerServiceWorker } from './utils/serviceWorkerRegistration'
import { initCriticalPerformance } from './utils/criticalPerformance'

import './index.css'

// Initialize critical performance optimizations ASAP
initCriticalPerformance();

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

console.log('🚀 Starting React application...');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for aggressive caching
registerServiceWorker();
