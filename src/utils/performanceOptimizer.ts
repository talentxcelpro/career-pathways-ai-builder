// 🔴 Performance optimization utilities - Enhanced for Core Web Vitals

// 🔴 Fix #3: Preload critical images for LCP improvement
export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    link.fetchPriority = 'high'; // High priority for LCP images
    document.head.appendChild(link);
  });
};

// 🔴 Fix #5: Eliminate render-blocking resources

// 🔴 Fix #1: Advanced prefetching for route optimization
export const prefetchRoute = (route: string, priority: 'low' | 'high' = 'low') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  if (priority === 'high') {
    link.fetchPriority = 'high';
  }
  document.head.appendChild(link);
};

// 🔴 Fix #4: Enhanced WebP conversion with quality optimization
export const convertToWebP = (imageFile: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 🔴 Fix #4: Intelligent resizing based on viewport
      const maxWidth = window.innerWidth > 1920 ? 1920 : window.innerWidth;
      const scale = Math.min(maxWidth / img.width, 1);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // High-quality scaling
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const webpFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp'
          });
          resolve(webpFile);
        } else {
          reject(new Error('Failed to convert to WebP'));
        }
      }, 'image/webp', quality);
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

// 🔴 Fix #5: Enhanced resource hints for critical performance
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://dthlgsnakhoftinssokm.supabase.co' },
    { rel: 'dns-prefetch', href: 'https://api.openai.com' },
    { rel: 'dns-prefetch', href: 'https://vercel.com' }
  ];
  
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.rel === 'preconnect') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// 🔴 New: Core Web Vitals optimization
export const optimizeCoreWebVitals = () => {
  // Reduce Total Blocking Time (TBT)
  const scheduleWork = (task: () => void) => {
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      (window as any).scheduler.postTask(task, { priority: 'background' });
    } else if ('requestIdleCallback' in window) {
      requestIdleCallback(task);
    } else {
      setTimeout(task, 0);
    }
  };

  // Optimize Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
        // Track LCP for optimization
      }
    }
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observer not supported');
  }

  return { scheduleWork };
};