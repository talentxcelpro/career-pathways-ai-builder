/**
 * Performance optimization utilities for Core Web Vitals improvement
 */

/**
 * Preload critical resources for faster page loads
 */
export const preloadCriticalAssets = () => {
  // Preload critical fonts
  const preloadFont = (href: string, type = 'font/woff2') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Preload Inter font (most critical)
  preloadFont('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2');
  
  // Preload hero image with high priority
  const heroImageUrl = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = heroImageUrl;
  link.as = 'image';
  link.fetchPriority = 'high';
  document.head.appendChild(link);
};

/**
 * Optimize images for Web Vitals
 */
export const optimizeImages = () => {
  // Add lazy loading to images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    // First few images should load eagerly (above fold)
    htmlImg.loading = index < 3 ? 'eager' : 'lazy';
    htmlImg.decoding = 'async';
  });

  // Add proper alt attributes where missing
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
  imagesWithoutAlt.forEach((img) => {
    const htmlImg = img as HTMLImageElement;
    htmlImg.alt = 'Image'; // Basic fallback
    console.warn('Missing alt attribute added to image:', htmlImg.src);
  });
};

/**
 * Optimize Core Web Vitals metrics
 */
export const optimizeCoreWebVitals = () => {
  // Reduce Cumulative Layout Shift (CLS)
  const addDimensionsToImages = () => {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      // Set intrinsic dimensions if available
      if (htmlImg.naturalWidth && htmlImg.naturalHeight) {
        htmlImg.setAttribute('width', htmlImg.naturalWidth.toString());
        htmlImg.setAttribute('height', htmlImg.naturalHeight.toString());
      }
    });
  };

  // Optimize First Input Delay (FID)
  const deferNonCriticalJS = () => {
    // Mark non-critical scripts as defer
    const scripts = document.querySelectorAll('script:not([defer]):not([async])');
    scripts.forEach((script) => {
      const htmlScript = script as HTMLScriptElement;
      if (!htmlScript.src.includes('critical') && !htmlScript.type?.includes('module')) {
        htmlScript.defer = true;
      }
    });
  };

  // Run optimizations
  addDimensionsToImages();
  deferNonCriticalJS();
};

/**
 * Monitor performance metrics
 */
export const monitorPerformance = () => {
  if ('performance' in window) {
    // Monitor First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      });
    });
    observer.observe({ entryTypes: ['paint'] });

    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log('LCP:', entry.startTime);
      });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

/**
 * Optimize CSS delivery
 */
export const optimizeCSS = () => {
  // Inline critical CSS (this would be done at build time ideally)
  const criticalCSS = `
    /* Critical above-fold styles */
    body { margin: 0; font-family: Inter, system-ui, sans-serif; }
    .header { position: sticky; top: 0; z-index: 50; }
    .hero { min-height: 60vh; }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);

  // Defer non-critical CSS
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  stylesheets.forEach((link) => {
    const htmlLink = link as HTMLLinkElement;
    htmlLink.media = 'print';
    htmlLink.onload = () => { htmlLink.media = 'all'; };
  });
};

/**
 * Implement resource hints
 */
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const prefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'www.googletagmanager.com'
  ];

  prefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical external resources
  const preconnectDomains = [
    'https://fonts.gstatic.com'
  ];

  preconnectDomains.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = () => {
  // Run immediately
  preloadCriticalAssets();
  addResourceHints();

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImages();
      optimizeCoreWebVitals();
      optimizeCSS();
      monitorPerformance();
    });
  } else {
    optimizeImages();
    optimizeCoreWebVitals();
    optimizeCSS();
    monitorPerformance();
  }
};

/**
 * Get performance score based on Web Vitals
 */
export const getPerformanceScore = async (): Promise<{
  score: number;
  metrics: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  };
}> => {
  return new Promise((resolve) => {
    const metrics = { fcp: 0, lcp: 0, cls: 0, fid: 0 };
    let metricsCollected = 0;
    const totalMetrics = 4;

    const checkComplete = () => {
      if (metricsCollected >= totalMetrics) {
        const score = calculatePerformanceScore(metrics);
        resolve({ score, metrics });
      }
    };

    // Collect FCP
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          metricsCollected++;
          checkComplete();
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Collect LCP
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        metrics.lcp = entry.startTime;
        metricsCollected++;
        checkComplete();
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Collect CLS
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          metrics.cls += entry.value;
        }
      });
      metricsCollected++;
      checkComplete();
    }).observe({ entryTypes: ['layout-shift'] });

    // Collect FID (approximate with first input)
    const firstInputHandler = (event: Event) => {
      metrics.fid = performance.now() - event.timeStamp;
      metricsCollected++;
      checkComplete();
      document.removeEventListener('click', firstInputHandler);
      document.removeEventListener('keydown', firstInputHandler);
    };
    
    document.addEventListener('click', firstInputHandler, { once: true });
    document.addEventListener('keydown', firstInputHandler, { once: true });

    // Timeout after 5 seconds
    setTimeout(() => {
      metricsCollected = totalMetrics;
      checkComplete();
    }, 5000);
  });
};

const calculatePerformanceScore = (metrics: { fcp: number; lcp: number; cls: number; fid: number }): number => {
  let score = 100;

  // FCP scoring (0-25 points)
  if (metrics.fcp > 3000) score -= 25;
  else if (metrics.fcp > 1800) score -= 15;

  // LCP scoring (0-25 points)
  if (metrics.lcp > 4000) score -= 25;
  else if (metrics.lcp > 2500) score -= 15;

  // CLS scoring (0-25 points)
  if (metrics.cls > 0.25) score -= 25;
  else if (metrics.cls > 0.1) score -= 15;

  // FID scoring (0-25 points)
  if (metrics.fid > 300) score -= 25;
  else if (metrics.fid > 100) score -= 15;

  return Math.max(0, score);
};