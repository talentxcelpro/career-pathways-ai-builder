/**
 * Critical performance optimizations for immediate Core Web Vitals improvement
 */

// Critical CSS inlining
export const inlineCriticalCSS = () => {
  const criticalStyles = `
    /* Critical above-the-fold styles */
    .min-h-screen { min-height: 100vh; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .bg-background { background-color: hsl(var(--background)); }
    .text-primary { color: hsl(var(--primary)); }
    .text-muted-foreground { color: hsl(var(--muted-foreground)); }
    .animate-spin { animation: spin 1s linear infinite; }
    .border-2 { border-width: 2px; }
    .border-primary { border-color: hsl(var(--primary)); }
    .border-t-transparent { border-top-color: transparent; }
    .rounded-full { border-radius: 9999px; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .text-sm { font-size: 0.875rem; }
    .gap-4 { gap: 1rem; }
    .flex-col { flex-direction: column; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalStyles;
  document.head.insertBefore(style, document.head.firstChild);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/src/index.css', as: 'style' },
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', as: 'style' },
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Critical script optimizations
export const optimizeCriticalScripts = () => {
  // Remove blocking scripts
  const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
  scripts.forEach((script) => {
    if (!script.getAttribute('src')?.includes('main.tsx')) {
      script.setAttribute('defer', 'true');
    }
  });
};

// Optimize initial render performance
export const optimizeInitialRender = () => {
  // Use requestIdleCallback for non-critical operations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Initialize non-critical features
      import('./performanceOptimizations').then(({ initializePerformanceOptimizations }) => {
        initializePerformanceOptimizations();
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('./performanceOptimizations').then(({ initializePerformanceOptimizations }) => {
        initializePerformanceOptimizations();
      });
    }, 100);
  }
};

// Critical database query optimization
export const optimizeInitialQueries = () => {
  // Implement query prioritization
  const criticalQueries = ['user_profile', 'auth_session'];
  const deferredQueries = ['notifications', 'feed_posts', 'job_recommendations'];
  
  return {
    criticalQueries,
    deferredQueries,
    prioritize: (queryKey: string) => criticalQueries.includes(queryKey),
    defer: (queryKey: string) => deferredQueries.includes(queryKey)
  };
};

// Initialize all critical optimizations
export const initializeCriticalOptimizations = () => {
  // Run immediately for best performance
  inlineCriticalCSS();
  preloadCriticalResources();
  optimizeCriticalScripts();
  optimizeInitialRender();
  
  // Mark critical path complete
  performance.mark('critical-path-complete');
};

// Auto-initialize if not in test environment
if (typeof window !== 'undefined' && !window.location.href.includes('test')) {
  initializeCriticalOptimizations();
}