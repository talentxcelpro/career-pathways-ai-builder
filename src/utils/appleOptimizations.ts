/**
 * Apple-style performance optimizations for instant loading
 */

// Critical resource preloading with Apple-style priorities
export const preloadAppleStyleResources = () => {
  if (typeof document === 'undefined') return;

  // Preload hero image with highest priority
  const heroImg = new Image();
  (heroImg as any).fetchPriority = 'high';
  (heroImg as any).loading = 'eager';
  heroImg.src = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';

  // Preload critical fonts
  const preloadFont = (href: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  };

  // Inter font (Apple uses San Francisco, we use Inter)
  preloadFont('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2');

  // DNS prefetch for critical domains
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

// Apple-style image optimization
export const optimizeImagesAppleStyle = () => {
  if (typeof document === 'undefined') return;

  // Optimize all images with Apple-style loading priorities
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    
    // Hero images get highest priority
    if (htmlImg.src.includes('hero') || index === 0) {
      (htmlImg as any).fetchPriority = 'high';
      (htmlImg as any).loading = 'eager';
    } else {
      (htmlImg as any).fetchPriority = 'low';
      (htmlImg as any).loading = 'lazy';
    }
    
    htmlImg.decoding = 'async';
    
    // Add intersection observer for smooth loading
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.style.opacity = '1';
            observer.unobserve(img);
          }
        });
      }, { threshold: 0.1 });
      
      if (htmlImg.getAttribute('loading') === 'lazy') {
        htmlImg.style.opacity = '0';
        htmlImg.style.transition = 'opacity 0.3s ease-out';
        observer.observe(htmlImg);
      }
    }
  });
};

// Apple-style smooth scrolling and interactions
export const enableAppleStyleInteractions = () => {
  if (typeof document === 'undefined') return;

  // Smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';

  // Add momentum scrolling for iOS-like feel
  (document.body.style as any).webkitOverflowScrolling = 'touch';

  // Optimize transforms for Apple-like animations
  const addWillChange = () => {
    const animatedElements = document.querySelectorAll('.hover\\:scale-105, .transition-transform, .animate-fade-in');
    animatedElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.willChange = 'transform';
    });
  };

  // Defer non-critical optimizations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(addWillChange);
  } else {
    setTimeout(addWillChange, 100);
  }
};

// Apple-style instant page transitions
export const enableInstantTransitions = () => {
  if (typeof document === 'undefined') return;

  let prefetchCache = new Set<string>();

  // Prefetch on hover (Apple-style)
  document.addEventListener('mouseover', (e) => {
    const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
    if (link?.hostname === location.hostname && !prefetchCache.has(link.href)) {
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch';
      prefetch.href = link.href;
      document.head.appendChild(prefetch);
      prefetchCache.add(link.href);
    }
  }, { passive: true });

  // Add Apple-style click feedback
  document.addEventListener('mousedown', (e) => {
    const clickable = (e.target as Element)?.closest('button, a, [role="button"]');
    if (clickable) {
      const el = clickable as HTMLElement;
      el.style.transform = 'scale(0.98)';
      el.style.opacity = '0.8';
      
      const resetTransform = () => {
        el.style.transform = '';
        el.style.opacity = '';
      };
      
      document.addEventListener('mouseup', resetTransform, { once: true });
      document.addEventListener('mouseleave', resetTransform, { once: true });
    }
  }, { passive: true });
};

// Ultra-fast Apple-style image preloading
export const preloadCriticalImages = () => {
  if (typeof document === 'undefined') return;
  
  const criticalImages = [
    '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    // Add more critical images here
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    (img as any).fetchPriority = 'high';
    (img as any).loading = 'eager';
    img.src = src;
  });
};

// Apple-style content prefetching
export const enableSmartPrefetch = () => {
  if (typeof document === 'undefined') return;
  
  const prefetchedUrls = new Set<string>();
  
  // Intersection Observer for aggressive prefetching
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const link = entry.target.closest('a[href]') as HTMLAnchorElement;
        if (link && !prefetchedUrls.has(link.href)) {
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = link.href;
          document.head.appendChild(prefetch);
          prefetchedUrls.add(link.href);
        }
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all links
  document.querySelectorAll('a[href]').forEach(link => observer.observe(link));
};

// Initialize all Apple-style optimizations
export const initAppleOptimizations = () => {
  // Immediate optimizations (blocking)
  preloadAppleStyleResources();
  preloadCriticalImages();
  
  // DOM ready optimizations (non-blocking)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImagesAppleStyle();
      enableAppleStyleInteractions();
      enableInstantTransitions();
      enableSmartPrefetch();
    });
  } else {
    optimizeImagesAppleStyle();
    enableAppleStyleInteractions();
    enableInstantTransitions();
    enableSmartPrefetch();
  }
};

// Auto-initialize
initAppleOptimizations();