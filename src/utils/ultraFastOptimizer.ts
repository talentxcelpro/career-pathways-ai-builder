/**
 * Ultra-fast performance optimizer - minimal overhead
 */

// Immediate optimizations that happen synchronously
export const instantOptimizations = () => {
  // Preload critical resources immediately
  const preloadCritical = () => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // DNS prefetch for Supabase
  const dnsPrefetch = () => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = '//dthlgsnakhoftinssokm.supabase.co';
    document.head.appendChild(link);
  };

  preloadCritical();
  dnsPrefetch();
};

// Instant page navigation
export const enableInstantNavigation = () => {
  let prefetched = new Set<string>();
  
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
    if (link?.hostname === location.hostname && !prefetched.has(link.href)) {
      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = link.href;
      document.head.appendChild(prefetchLink);
      prefetched.add(link.href);
    }
  }, { passive: true });
};

// Minimal image optimization
export const optimizeImages = () => {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    htmlImg.loading = index < 2 ? 'eager' : 'lazy';
    htmlImg.decoding = 'async';
  });
};

// Initialize all optimizations
export const init = () => {
  instantOptimizations();
  enableInstantNavigation();
  
  // Defer non-critical optimizations
  requestIdleCallback(() => {
    optimizeImages();
  });
};