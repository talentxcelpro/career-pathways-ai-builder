import React from 'react'
import { createRoot } from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppWrapper } from './AppWrapper.tsx'

import './index.css'

// Ultra-fast initialization - only critical optimizations
if (typeof window !== 'undefined') {
  // Immediate critical optimizations
  const criticalInit = () => {
    // Preload critical font
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
    
    // Enable instant page loads with prefetch
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link?.hostname === location.hostname && !link.dataset.prefetched) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
        link.dataset.prefetched = 'true';
      }
    }, { passive: true });
  };
  
  criticalInit();
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
    <SpeedInsights />
  </React.StrictMode>
);
