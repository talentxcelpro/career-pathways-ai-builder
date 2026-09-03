import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { registerServiceWorker } from './utils/serviceWorkerRegistration'
import { initCriticalPerformance } from './utils/criticalPerformance'

import './index.css'

// Initialize critical performance optimizations ASAP
initCriticalPerformance();

// Auto-heal Vite chunk loading mismatches during live deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite chunk preload error detected during deployment. Auto-refreshing to latest assets...');
  event.preventDefault();
  const lastReload = parseInt(sessionStorage.getItem('last_chunk_reload') || '0', 10);
  const now = Date.now();
  if (now - lastReload > 8000) {
    sessionStorage.setItem('last_chunk_reload', String(now));
    window.location.reload();
  }
});

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
