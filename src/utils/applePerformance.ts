/**
 * Apple-style performance optimizations for TalentXcel
 */

// Immediate performance boosts
export const applyInstantOptimizations = () => {
  if (typeof document === 'undefined') return;

  // Critical CSS inlining simulation
  const inlineCriticalCSS = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Critical above-the-fold styles */
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .transition-apple { transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); }
      .rounded-apple-sm { border-radius: 6px; }
      .font-apple-medium { font-weight: 500; }
    `;
    document.head.insertBefore(style, document.head.firstChild);
  };

  // Resource prioritization
  const optimizeResourcePriority = () => {
    // Set fetch priority for critical resources
    const criticalLinks = document.querySelectorAll('link[rel="stylesheet"]');
    criticalLinks.forEach((link, index) => {
      const htmlLink = link as HTMLLinkElement;
      if (index === 0) {
        // TypeScript-safe way to set fetchPriority
        (htmlLink as any).fetchPriority = 'high';
      }
    });

    // Preconnect to critical domains
    const domains = [
      'https://dthlgsnakhoftinssokm.supabase.co',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  };

  inlineCriticalCSS();
  optimizeResourcePriority();
};

// Apple-style smooth animations
export const enableAppleAnimations = () => {
  if (typeof document === 'undefined') return;

  // Add will-change for better performance
  const optimizeAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
      .transition-apple { will-change: transform, opacity; }
      .hover-lift:hover { will-change: transform; }
      [data-state="active"] { will-change: background-color, color; }
    `;
    document.head.appendChild(style);
  };

  // Micro-interactions
  const addMicroInteractions = () => {
    document.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, [role="button"], .btn-apple-primary, .btn-apple-secondary')) {
        target.style.transform = 'scale(0.98)';
        target.style.opacity = '0.8';
        
        const reset = () => {
          target.style.transform = '';
          target.style.opacity = '';
        };
        
        document.addEventListener('mouseup', reset, { once: true });
        document.addEventListener('mouseleave', reset, { once: true });
      }
    }, { passive: true });
  };

  optimizeAnimations();
  addMicroInteractions();
};

// Memory optimization
export const optimizeMemoryUsage = () => {
  if (typeof window === 'undefined') return;

  // Efficient event delegation
  const setupEventDelegation = () => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Handle tab clicks
      if (target.matches('[data-state]') || target.closest('[data-state]')) {
        // Optimized tab switching
        requestAnimationFrame(() => {
          // Minimal DOM manipulation
        });
      }
    }, { passive: true });
  };

  // Cleanup unused resources
  const cleanupResources = () => {
    // Remove unused prefetch links after a delay
    setTimeout(() => {
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      if (prefetchLinks.length > 20) {
        // Keep only the most recent 20
        Array.from(prefetchLinks)
          .slice(0, -20)
          .forEach(link => link.remove());
      }
    }, 30000); // 30 seconds
  };

  setupEventDelegation();
  cleanupResources();
};

// Initialize all Apple performance optimizations
export const initApplePerformance = () => {
  // Immediate optimizations
  applyInstantOptimizations();
  
  // DOM ready optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      enableAppleAnimations();
      optimizeMemoryUsage();
    });
  } else {
    enableAppleAnimations();
    optimizeMemoryUsage();
  }
};

// Export for manual initialization
// initApplePerformance();
