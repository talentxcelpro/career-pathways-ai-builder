/**
 * Ultra-fast loading optimizations for instant page loads
 */

// Browser compatibility polyfill for requestIdleCallback
const safeRequestIdleCallback = (callback: () => void) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  }
  // Fallback to setTimeout with minimal delay
  return setTimeout(callback, 1);
};

// Critical resource prefetching
export const prefetchCriticalResources = () => {
  if (typeof document === 'undefined') return;

  // Preload hero image immediately
  const heroImg = new Image();
  heroImg.src = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
  
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // DNS prefetch for external resources
  const dnsPrefetch = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  };

  dnsPrefetch('//dthlgsnakhoftinssokm.supabase.co');
  dnsPrefetch('//fonts.googleapis.com');
  dnsPrefetch('//fonts.gstatic.com');
};

// Instant navigation with aggressive prefetching
export const enableInstantNavigation = () => {
  if (typeof document === 'undefined') return;

  let prefetchedUrls = new Set<string>();
  
  // Prefetch on hover (faster than default)
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
    if (link?.hostname === location.hostname && !prefetchedUrls.has(link.href)) {
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch';
      prefetch.href = link.href;
      document.head.appendChild(prefetch);
      prefetchedUrls.add(link.href);
    }
  }, { passive: true, capture: true });

  // Prefetch visible links immediately
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const link = entry.target as HTMLAnchorElement;
        if (!prefetchedUrls.has(link.href)) {
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = link.href;
          document.head.appendChild(prefetch);
          prefetchedUrls.add(link.href);
        }
        observer.unobserve(link);
      }
    });
  }, { rootMargin: '100px' });

  // Observe all internal links
  safeRequestIdleCallback(() => {
    document.querySelectorAll('a[href]').forEach(link => {
      const anchor = link as HTMLAnchorElement;
      if (anchor.hostname === location.hostname) {
        observer.observe(anchor);
      }
    });
  });
};

// Ultra-fast image loading with instant placeholders
export const optimizeImages = () => {
  if (typeof document === 'undefined') return;

  // Set loading priorities
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    // First 3 images eager, rest lazy
    (htmlImg as any).loading = index < 3 ? 'eager' : 'lazy';
    htmlImg.decoding = 'async';
    
    // Add fetch priority for hero images
    if (index === 0) {
      (htmlImg as any).fetchPriority = 'high';
    }
  });

  // Progressive enhancement for modern formats
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  if (supportsWebP()) {
    document.documentElement.classList.add('webp');
  }
};

// Eliminate layout shifts with predictive sizing
export const preventLayoutShifts = () => {
  if (typeof document === 'undefined') return;

  // Reserve space for dynamic content
  const reserveSpace = (selector: string, minHeight: string) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.style.minHeight) {
        htmlEl.style.minHeight = minHeight;
        htmlEl.style.contain = 'layout';
      }
    });
  };

  // Reserve space for common dynamic content
  reserveSpace('.news-widget', '200px');
  reserveSpace('.job-card', '150px');
  reserveSpace('.profile-card', '120px');
};

// Memory management for performance
export const optimizeMemory = () => {
  if (typeof window === 'undefined') return;

  // Clean up unused images
  const cleanupImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
      if (!isVisible && img.parentNode) {
        img.parentNode.removeChild(img);
      }
    });
  };

  // Cleanup on scroll (throttled)
  let cleanupTimeout: number;
  window.addEventListener('scroll', () => {
    clearTimeout(cleanupTimeout);
    cleanupTimeout = window.setTimeout(cleanupImages, 1000);
  }, { passive: true });
};

// Initialize all optimizations
export const initUltraFastLoading = () => {
  // Immediate optimizations
  prefetchCriticalResources();
  
  // DOM ready optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      preventLayoutShifts();
      enableInstantNavigation();
    });
  } else {
    optimizeImages();
    preventLayoutShifts();
    enableInstantNavigation();
  }

  // Post-load optimizations
  window.addEventListener('load', () => {
    safeRequestIdleCallback(() => {
      optimizeMemory();
    });
  });
};

// Auto-initialize
initUltraFastLoading();