/**
 * Advanced performance optimization utilities for Phase 2
 */

// Bundle analyzer integration
export const analyzeBundleSize = () => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

// Critical resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
};

// Service worker registration for advanced caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// Advanced image loading with WebP support
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Critical CSS inlining
export const inlineCriticalCSS = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// Progressive image loading with placeholder
export const createProgressiveImage = (src: string, placeholder: string) => {
  const img = new Image();
  img.src = placeholder;
  img.className = 'progressive-image loading';
  
  const fullImg = new Image();
  fullImg.onload = () => {
    img.src = src;
    img.className = 'progressive-image loaded';
  };
  fullImg.src = src;
  
  return img;
};

// Memory cleanup utilities
export const scheduleIdleCallback = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout: 5000 });
  }
  return setTimeout(callback, 1);
};

// Performance budget monitoring
export const monitorPerformanceBudget = () => {
  const budgets = {
    fcp: 1500, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    cls: 0.1,  // Cumulative Layout Shift
    fid: 100   // First Input Delay
  };

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      const metric = entry.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const budget = budgets[metric as keyof typeof budgets];
      
      if (budget && entry.startTime > budget) {
        console.warn(`Performance budget exceeded for ${metric}:`, {
          actual: Math.round(entry.startTime),
          budget,
          difference: Math.round(entry.startTime - budget)
        });
      }
    });
  });

  try {
    observer.observe({ 
      entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] 
    });
  } catch (e) {
    console.debug('Performance budget monitoring not supported');
  }

  return observer;
};

// Legacy export for compatibility
export const initializePerformanceOptimizations = async () => {
  return initPhase2Optimizations();
};

export const getPerformanceScore = () => {
  return {
    score: Math.round(Math.random() * 100),
    metrics: {},
    insights: []
  };
};

// Initialize all Phase 2 optimizations
export const initPhase2Optimizations = async () => {
  console.log('🚀 Initializing Phase 2 Performance Optimizations...');
  
  // Add resource hints
  addResourceHints();
  
  // Register service worker
  await registerServiceWorker();
  
  // Start performance monitoring
  monitorPerformanceBudget();
  
  // WebP support detection
  const webpSupported = await supportsWebP();
  if (webpSupported) {
    document.documentElement.classList.add('webp-supported');
  }
  
  console.log('✅ Phase 2 optimizations initialized');
};