/**
 * Intelligent lazy loading for performance optimization
 */
import React from 'react';

// Progressive loading based on viewport and connection
export const createProgressiveLoader = () => {
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const lazyAction = element.dataset.lazyAction;
        
        if (lazyAction) {
          // Execute lazy action
          eval(lazyAction);
          element.removeAttribute('data-lazy-action');
        }
      }
    });
  }, observerOptions);
};

// Lazy load images with connection awareness
export const optimizeImageLoading = () => {
  if (typeof document === 'undefined') return;
  
  const images = document.querySelectorAll('img[data-src]');
  const connection = (navigator as any).connection;
  const isSlowConnection = connection?.effectiveType?.includes('2g') || connection?.effectiveType === '3g';
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          // For slow connections, load smaller versions first
          if (isSlowConnection && src.includes('.')) {
            const parts = src.split('.');
            const extension = parts.pop();
            const lowQualitySrc = `${parts.join('.')}_low.${extension}`;
            
            // Try low quality first, fallback to original
            img.src = lowQualitySrc;
            img.onerror = () => {
              img.src = src;
            };
          } else {
            img.src = src;
          }
          
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });
  
  images.forEach(img => observer.observe(img));
};

// Component-level lazy loading
export const useLazyComponentLoading = (componentKey: string) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return shouldLoad;
};

// Initialize lazy loading system
export const initializeLazyLoading = () => {
  if (typeof window === 'undefined') return;
  
  // Set up progressive loading
  const loader = createProgressiveLoader();
  
  // Optimize existing images
  optimizeImageLoading();
  
  // Monitor for new images
  const bodyObserver = new MutationObserver(() => {
    optimizeImageLoading();
  });
  
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    loader.disconnect();
    bodyObserver.disconnect();
  };
};
