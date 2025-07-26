// Performance optimization utilities

// Preload critical images
export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Prefetch next route
export const prefetchRoute = (route: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

// Optimize images to WebP
export const convertToWebP = (imageFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp'
          });
          resolve(webpFile);
        } else {
          reject(new Error('Failed to convert to WebP'));
        }
      }, 'image/webp', 0.8);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Measure performance metrics
export const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`Performance: ${name} took ${end - start} milliseconds`);
  return result;
};

// Check if browser supports WebP
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Remove unused CSS classes (dev tool)
export const findUnusedCSS = () => {
  const stylesheets = Array.from(document.styleSheets);
  const usedSelectors = new Set<string>();
  
  stylesheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          const selector = rule.selectorText;
          if (document.querySelector(selector)) {
            usedSelectors.add(selector);
          }
        }
      });
    } catch (e) {
      // Cross-origin or other errors
    }
  });
  
  return Array.from(usedSelectors);
};

// Performance monitoring
export const trackWebVitals = () => {
  // Track Core Web Vitals
  if ('web-vital' in window) {
    // @ts-ignore
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// Critical resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://dthlgsnakhoftinssokm.supabase.co' },
    { rel: 'dns-prefetch', href: 'https://api.openai.com' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.rel === 'preconnect') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};