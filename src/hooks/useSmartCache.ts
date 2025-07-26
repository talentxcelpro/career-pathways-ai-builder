import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  staleWhileRevalidate?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 min default
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > entry.ttl * 0.8; // Consider stale at 80% of TTL
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

const globalCache = new SmartCache(200);

export const useSmartCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) => {
  const {
    ttl = 300000, // 5 minutes
    staleWhileRevalidate = true
  } = options;

  const [data, setData] = useState<T | null>(() => globalCache.get<T>(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fetchData = useCallback(async (isRevalidation = false) => {
    try {
      if (!isRevalidation) setIsLoading(true);
      setIsValidating(isRevalidation);
      setError(null);

      const result = await fetcher();
      globalCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [key, fetcher, ttl]);

  const revalidate = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const mutate = useCallback((newData: T | ((current: T | null) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as Function)(data) 
      : newData;
    
    globalCache.set(key, updatedData, ttl);
    setData(updatedData);
  }, [key, data, ttl]);

  useEffect(() => {
    const cachedData = globalCache.get<T>(key);
    
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      
      // Check if data is stale and revalidate in background
      if (staleWhileRevalidate && globalCache.isStale(key)) {
        fetchData(true);
      }
    } else {
      fetchData();
    }
  }, [key, fetchData, staleWhileRevalidate]);

  return {
    data,
    isLoading,
    error,
    isValidating,
    revalidate,
    mutate,
    cache: {
      invalidate: (pattern?: string) => globalCache.invalidate(pattern),
      stats: globalCache.getStats()
    }
  };
};