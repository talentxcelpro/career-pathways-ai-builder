// Performance optimization utilities for faster registration and auth flows

/**
 * Preload critical resources for faster page loads
 */
export const preloadCriticalResources = () => {
  // Supabase client is bundled locally via npm; no obsolete CDN fetching needed.
};

/**
 * Optimize form input performance with debouncing
 */
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * Cache frequently accessed DOM elements
 */
class DOMElementCache {
  private cache = new Map<string, Element | null>();

  get(selector: string): Element | null {
    if (!this.cache.has(selector)) {
      this.cache.set(selector, document.querySelector(selector));
    }
    return this.cache.get(selector) || null;
  }

  clear() {
    this.cache.clear();
  }
}

export const domCache = new DOMElementCache();

/**
 * Optimize image loading with progressive enhancement
 */
export const optimizeImageLoading = () => {
  // Use intersection observer for lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
};

/**
 * Batch DOM updates for better performance
 */
export const batchDOMUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Preload route components
 */
export const preloadRouteComponent = async (routePath: string) => {
  try {
    switch (routePath) {
      case '/auth/login':
        // await import('@/pages/auth/Login');
        break;
      case '/dashboard':
        // await import('@/pages/Dashboard');
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn('Failed to preload route component:', routePath, error);
  }
};

/**
 * Optimize bundle loading with code splitting
 */
export const preloadCriticalChunks = () => {
  // Preload authentication related chunks
  import('@/components/auth/SocialLogin').catch(() => {});
  
  // Preload UI components that are likely to be used
  import('@/components/ui/button').catch(() => {});
  import('@/components/ui/input').catch(() => {});
  import('@/components/ui/card').catch(() => {});
};

/**
 * Memory management for large forms
 */
export class FormMemoryManager {
  private formData = new Map<string, any>();
  private listeners = new Set<() => void>();

  setValue(key: string, value: any) {
    this.formData.set(key, value);
    this.notifyListeners();
  }

  getValue(key: string) {
    return this.formData.get(key);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  clear() {
    this.formData.clear();
    this.listeners.clear();
  }
}

/**
 * Performance monitoring for registration flow
 */
export class RegistrationPerformanceMonitor {
  private metrics = {
    formLoadTime: 0,
    validationTime: 0,
    submissionTime: 0,
    totalTime: 0
  };

  private startTime = 0;

  startTiming() {
    this.startTime = performance.now();
  }

  recordFormLoad() {
    this.metrics.formLoadTime = performance.now() - this.startTime;
  }

  recordValidation() {
    this.metrics.validationTime = performance.now() - this.startTime;
  }

  recordSubmission() {
    this.metrics.submissionTime = performance.now() - this.startTime;
  }

  recordTotal() {
    this.metrics.totalTime = performance.now() - this.startTime;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Registration Performance Metrics');
      console.log(`Form Load: ${this.metrics.formLoadTime.toFixed(2)}ms`);
      console.log(`Validation: ${this.metrics.validationTime.toFixed(2)}ms`);
      console.log(`Submission: ${this.metrics.submissionTime.toFixed(2)}ms`);
      console.log(`Total: ${this.metrics.totalTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  }
}

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = () => {
  // Preload critical resources
  preloadCriticalResources();
  
  // Setup image optimization
  optimizeImageLoading();
  
  // Preload critical chunks
  preloadCriticalChunks();

  // Add performance monitoring
  if ('performance' in window && 'observe' in window.PerformanceObserver.prototype) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          console.log('FID:', fidEntry.processingStart - entry.startTime);
        }
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
  }
};