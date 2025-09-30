/**
 * Route preloader for instant navigation
 * Preloads routes on link hover/focus
 */

const preloadedRoutes = new Set<string>();

export const preloadRoute = (routePath: string) => {
  // Avoid duplicate preloading
  if (preloadedRoutes.has(routePath)) {
    return;
  }

  preloadedRoutes.add(routePath);

  // Map routes to their import functions
  const routeImports: Record<string, () => Promise<any>> = {
    '/jobs': () => import('@/pages/Jobs'),
    '/network': () => import('@/pages/Network'),
    '/profile': () => import('@/pages/Profile'),
    '/dashboard': () => import('@/pages/Dashboard'),
    '/learning': () => import('@/pages/Learning'),
    '/companies': () => import('@/pages/Companies'),
    '/tools': () => import('@/pages/Tools'),
    '/gamification': () => import('@/pages/GamificationCenter'),
    '/career-dashboard': () => import('@/pages/CareerDashboard'),
  };

  const importFn = routeImports[routePath];
  if (importFn) {
    // Preload in background
    importFn().catch(() => {
      // Silently fail if preload doesn't work
      preloadedRoutes.delete(routePath);
    });
  }
};

/**
 * Add preload listeners to links
 */
export const enableRoutePreloading = () => {
  if (typeof window === 'undefined') return;

  // Preload on mouseenter
  document.addEventListener('mouseenter', (e) => {
    const target = (e.target as HTMLElement).closest('a[href]');
    if (target) {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        preloadRoute(href);
      }
    }
  }, { passive: true, capture: true });

  // Preload on focus
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        preloadRoute(href);
      }
    }
  }, { passive: true });
};
