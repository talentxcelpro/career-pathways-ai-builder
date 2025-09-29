/**
 * Instant page loading optimizations
 */

// Aggressive resource hints
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const addHint = (rel: string, href: string, as?: string, type?: string) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;
    
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.as = as;
    if (type) link.type = type;
    if (as === 'font') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Preconnect to critical origins
  addHint('preconnect', 'https://dthlgsnakhoftinssokm.supabase.co');
  addHint('preconnect', 'https://fonts.googleapis.com');
  addHint('preconnect', 'https://fonts.gstatic.com');

  // Preload critical fonts
  addHint('preload', 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2', 'font', 'font/woff2');
  
  // Preload hero image
  addHint('preload', '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png', 'image');
};

// Ultra-fast DOM optimizations
export const optimizeDOM = () => {
  if (typeof document === 'undefined') return;

  // Enable CSS containment for better performance
  const optimizeContainment = () => {
    const style = document.createElement('style');
    style.textContent = `
      .card, .bg-card { contain: layout style paint; }
      .hero-section { contain: layout; }
      .news-widget { contain: layout style; }
      img { content-visibility: auto; }
    `;
    document.head.appendChild(style);
  };

  // Reduce paint operations
  const reducePaint = () => {
    // Use transform instead of changing position
    const style = document.createElement('style');
    style.textContent = `
      .hover\\:scale-105 { will-change: transform; }
      .transition-transform { backface-visibility: hidden; }
      .animate-spin { will-change: transform; }
    `;
    document.head.appendChild(style);
  };

  optimizeContainment();
  reducePaint();
};

// Instant click optimizations
export const enableInstantClicks = () => {
  if (typeof document === 'undefined') return;

  let mousedownTarget: HTMLElement | null = null;

  document.addEventListener('mousedown', (e) => {
    mousedownTarget = e.target as HTMLElement;
    
    // Pre-warm link on mousedown
    const link = mousedownTarget.closest('a[href]') as HTMLAnchorElement;
    if (link && link.hostname === location.hostname) {
      // Start navigation preparation
      const href = link.href;
      if (!href.startsWith('javascript:') && !href.includes('#')) {
        // Preload the page immediately
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = href;
        document.head.appendChild(prefetch);
      }
    }
  }, { passive: true, capture: true });

  // Fast click handling
  document.addEventListener('click', (e) => {
    if (e.target !== mousedownTarget) return;
    
    const link = (e.target as Element).closest('a[href]') as HTMLAnchorElement;
    if (link && link.hostname === location.hostname) {
      // Instant navigation feedback
      link.style.opacity = '0.7';
      requestAnimationFrame(() => {
        link.style.opacity = '';
      });
    }
  }, { passive: true, capture: true });
};

// Memory-efficient caching
export const setupSmartCaching = () => {
  if (typeof window === 'undefined') return;

  // Cache frequently accessed DOM queries
  const elementCache = new Map<string, Element | null>();
  
  const cachedQuerySelector = (selector: string) => {
    if (elementCache.has(selector)) {
      return elementCache.get(selector);
    }
    const element = document.querySelector(selector);
    elementCache.set(selector, element);
    return element;
  };

  // Clear cache on DOM mutations
  const observer = new MutationObserver(() => {
    elementCache.clear();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Expose optimized selector
  (window as any).cachedQuerySelector = cachedQuerySelector;
};

// Initialize all instant optimizations + giant app loader
export const initInstantLoader = () => {
  // Load giant app optimizations first
  import('./giantAppLoader').then(({ giantAppLoader }) => {
    giantAppLoader.init();
  });
  
  // Immediate optimizations
  addResourceHints();
  
  // DOM ready optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeDOM();
      enableInstantClicks();
      setupSmartCaching();
    });
  } else {
    optimizeDOM();
    enableInstantClicks();
    setupSmartCaching();
  }
};

// Auto-initialize for maximum speed
initInstantLoader();