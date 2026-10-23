/**
 * Route preloader for instant navigation
 * Preloads routes on link hover/focus and mobile touchstart
 */

const preloadedRoutes = new Set<string>();

const routeImports: Record<string, () => Promise<any>> = {
  '/jobs': () => import('@/pages/Jobs'),
  '/network': () => import('@/pages/Network'),
  '/profile': () => import('@/pages/UserProfile'),
  '/dashboard': () => import('@/pages/UnifiedDashboard'),
  '/learning': () => import('@/pages/LearningHub'),
  '/companies': () => import('@/pages/Companies'),
  '/colleges': () => import('@/pages/Colleges'),
  '/tools': () => import('@/pages/Tools'),
  '/recruiters': () => import('@/pages/recruiters/RecruiterLandingPage'),
  '/career-map': () => import('@/pages/AICareerHub'),
  '/career-insights': () => import('@/pages/CareerInsightsPage'),
  '/passport': () => import('@/pages/TalentScorePage'),
  '/reels': () => import('@/pages/MobileReelsPage'),
  '/my-applications': () => import('@/pages/jobs/MyApplications'),
  '/gamification': () => import('@/pages/GamificationCenter'),
  '/resume/ats-check': () => import('@/pages/resume/ATSChecker'),
  '/resume': () => import('@/pages/resume/UnifiedResumeHub'),
};

/**
 * Normalize path for routing matching (strips query, hash, and trailing slashes)
 */
function normalizePath(rawPath: string): string {
  try {
    const clean = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
    return clean;
  } catch {
    return rawPath;
  }
}

export const preloadRoute = (rawRoutePath: string) => {
  if (!rawRoutePath || typeof rawRoutePath !== 'string') return;
  
  const routePath = normalizePath(rawRoutePath);

  // Avoid duplicate preloading
  if (preloadedRoutes.has(routePath)) {
    return;
  }

  preloadedRoutes.add(routePath);

  // Check exact match first
  let importFn = routeImports[routePath];

  // If not exact match, check prefix match (e.g., /jobs/123 -> /jobs)
  if (!importFn) {
    const prefix = Object.keys(routeImports).find(k => k !== '/' && routePath.startsWith(k));
    if (prefix) {
      importFn = routeImports[prefix];
    }
  }

  if (importFn) {
    // Preload in background
    importFn().catch(() => {
      // Silently retry on next trigger if network failed
      preloadedRoutes.delete(routePath);
    });
  }
};

let listenersInstalled = false;

/**
 * Add preload listeners to links for both desktop and mobile devices
 */
export const enableRoutePreloading = () => {
  if (typeof window === 'undefined' || listenersInstalled) return;
  listenersInstalled = true;

  const handleInteraction = (e: Event) => {
    const target = e.target;
    if (target && target instanceof Element) {
      const link = target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
          preloadRoute(href);
        }
      }
    }
  };

  // 1. Desktop mouse pointer over (bubbles up)
  document.addEventListener('pointerover', handleInteraction, { passive: true, capture: true });

  // 2. Mobile touch start (instant preload as soon as finger contacts screen, ~100ms before click)
  document.addEventListener('touchstart', handleInteraction, { passive: true, capture: true });

  // 3. Keyboard focus navigation
  document.addEventListener('focusin', handleInteraction, { passive: true, capture: true });

  // 4. Idle prefetch top critical routes after initial load
  const scheduleIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
  scheduleIdle(() => {
    preloadRoute('/jobs');
    preloadRoute('/network');
    preloadRoute('/colleges');
  });
};
