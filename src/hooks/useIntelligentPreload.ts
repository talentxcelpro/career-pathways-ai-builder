import { useEffect, useState, useCallback } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  maxAge?: number;
}

interface CachedData {
  data: any;
  timestamp: number;
  priority: 'high' | 'low';
}

class IntelligentCache {
  private cache = new Map<string, CachedData>();
  private maxSize = 100;
  private maxAge = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, options: PreloadOptions = {}) {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLowestPriority();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      priority: options.priority || 'low'
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  private evictLowestPriority() {
    let lowestPriorityKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((value, key) => {
      if (value.priority === 'low' && value.timestamp < oldestTimestamp) {
        lowestPriorityKey = key;
        oldestTimestamp = value.timestamp;
      }
    });

    if (lowestPriorityKey) {
      this.cache.delete(lowestPriorityKey);
    } else {
      // If no low priority items, evict oldest
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  prefetch(key: string, fetcher: () => Promise<any>, options: PreloadOptions = {}) {
    if (this.has(key)) return Promise.resolve(this.get(key));

    return fetcher().then(data => {
      this.set(key, data, options);
      return data;
    });
  }
}

const intelligentCache = new IntelligentCache();

export const useIntelligentPreload = () => {
  const [isPreloading, setIsPreloading] = useState(false);

  const preload = useCallback(async (
    key: string,
    fetcher: () => Promise<any>,
    options: PreloadOptions = {}
  ) => {
    if (intelligentCache.has(key)) {
      return intelligentCache.get(key);
    }

    setIsPreloading(true);
    try {
      const data = await intelligentCache.prefetch(key, fetcher, options);
      return data;
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const getCached = useCallback((key: string) => {
    return intelligentCache.get(key);
  }, []);

  const prefetchOnHover = useCallback((
    key: string,
    fetcher: () => Promise<any>,
    options: PreloadOptions = {}
  ) => {
    return {
      onMouseEnter: () => {
        preload(key, fetcher, { ...options, priority: 'high' });
      }
    };
  }, [preload]);

  return {
    preload,
    getCached,
    prefetchOnHover,
    isPreloading
  };
};

// Preload images
export const useImagePreloader = () => {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (srcs: string[]) => {
    await Promise.all(srcs.map(src => preloadImage(src)));
  }, [preloadImage]);

  return { preloadImage, preloadImages };
};

// Intersection observer for lazy loading
export const useLazyLoad = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, callback, options]);

  return setRef;
};
