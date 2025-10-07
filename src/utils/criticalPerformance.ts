/**
 * Critical performance optimizations
 * Applied immediately on app initialization
 */

// Preload critical DNS
export const preloadCriticalDNS = () => {
  if (typeof document === 'undefined') return;

  const domains = [
    'https://dthlgsnakhoftinssokm.supabase.co',
    'https://fonts.gstatic.com',
    'https://www.googletagmanager.com',
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    if (!document.head.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`)) {
      document.head.appendChild(link);
    }
  });
};

// Optimize images on page
export const optimizePageImages = () => {
  if (typeof document === 'undefined') return;

  const images = document.querySelectorAll('img:not([data-optimized])');
  
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    
    // First visible image gets high priority
    if (index === 0) {
      htmlImg.loading = 'eager';
      (htmlImg as any).fetchPriority = 'high';
    } else {
      htmlImg.loading = 'lazy';
      (htmlImg as any).fetchPriority = 'low';
    }
    
    htmlImg.decoding = 'async';
    htmlImg.setAttribute('data-optimized', 'true');
  });
};

// Prefetch critical routes
export const prefetchCriticalRoutes = () => {
  if (typeof document === 'undefined') return;

  const routes = ['/jobs', '/network', '/passport'];
  
  routes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    if (!document.head.querySelector(`link[href="${route}"][rel="prefetch"]`)) {
      document.head.appendChild(link);
    }
  });
};

// Initialize all critical optimizations
export const initCriticalPerformance = () => {
  // Run immediately
  preloadCriticalDNS();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizePageImages();
      // Delay route prefetching to not compete with critical resources
      setTimeout(prefetchCriticalRoutes, 2000);
    });
  } else {
    optimizePageImages();
    setTimeout(prefetchCriticalRoutes, 2000);
  }
};
