import { useEffect, useCallback, useRef } from 'react';

interface AdvancedCacheConfig {
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxAge: number;
  maxEntries: number;
  networkTimeoutSeconds?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  maxAge: number;
}

export const useAdvancedCaching = () => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const networkRef = useRef<Map<string, Promise<any>>>(new Map());

  // Smart cache with different strategies
  const cache = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    config: AdvancedCacheConfig = {
      strategy: 'stale-while-revalidate',
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 100
    }
  ): Promise<T> => {
    const now = Date.now();
    const cached = cacheRef.current.get(key);

    // Check if cached data is still valid
    const isCacheValid = cached && (now - cached.timestamp) < cached.maxAge;

    switch (config.strategy) {
      case 'cache-first':
        if (isCacheValid) {
          return cached.data;
        }
        break;

      case 'network-first':
        try {
          const networkPromise = getNetworkData(key, fetcher, config);
          const data = await networkPromise;
          setCacheData(key, data, config);
          return data;
        } catch (error) {
          if (cached) {
            console.warn('Network failed, using stale cache:', error);
            return cached.data;
          }
          throw error;
        }

      case 'stale-while-revalidate':
        if (cached) {
          // Return stale data immediately
          if (!isCacheValid) {
            // Revalidate in background
            getNetworkData(key, fetcher, config)
              .then(data => setCacheData(key, data, config))
              .catch(error => console.warn('Background revalidation failed:', error));
          }
          return cached.data;
        }
        break;
    }

    // Fetch from network
    const data = await getNetworkData(key, fetcher, config);
    setCacheData(key, data, config);
    return data;
  }, []);

  // Network data fetching with deduplication
  const getNetworkData = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    config: AdvancedCacheConfig
  ): Promise<T> => {
    // Check if request is already in flight
    const existingRequest = networkRef.current.get(key);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request with timeout
    const request = Promise.race([
      fetcher(),
      ...(config.networkTimeoutSeconds ? [
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), config.networkTimeoutSeconds! * 1000)
        )
      ] : [])
    ]);

    networkRef.current.set(key, request);

    try {
      const data = await request;
      return data;
    } finally {
      networkRef.current.delete(key);
    }
  }, []);

  // Set cache data with LRU eviction
  const setCacheData = useCallback((key: string, data: any, config: AdvancedCacheConfig) => {
    const cache = cacheRef.current;

    // LRU eviction if cache is full
    if (cache.size >= config.maxEntries) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge: config.maxAge
    });
  }, []);

  // Prefetch data
  const prefetch = useCallback(<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: Partial<AdvancedCacheConfig>
  ) => {
    const fullConfig: AdvancedCacheConfig = {
      strategy: 'cache-first',
      maxAge: 10 * 60 * 1000, // 10 minutes for prefetched data
      maxEntries: 100,
      ...config
    };

    return cache(key, fetcher, fullConfig).catch(error => {
      console.warn('Prefetch failed for', key, error);
    });
  }, [cache]);

  // Invalidate cache entries
  const invalidate = useCallback((pattern?: string | RegExp) => {
    if (!pattern) {
      cacheRef.current.clear();
      return;
    }

    const cache = cacheRef.current;
    const keysToDelete: string[] = [];

    for (const key of cache.keys()) {
      const shouldDelete = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
      
      if (shouldDelete) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const now = Date.now();
    
    let validEntries = 0;
    let staleEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of cache.entries()) {
      const isValid = (now - entry.timestamp) < entry.maxAge;
      if (isValid) {
        validEntries++;
      } else {
        staleEntries++;
      }
      
      try {
        totalSize += JSON.stringify(entry.data).length;
      } catch {
        // Circular reference or non-serializable data
        totalSize += 1000; // Estimate
      }
    }

    return {
      totalEntries: cache.size,
      validEntries,
      staleEntries,
      estimatedSizeBytes: totalSize,
      hitRate: validEntries / Math.max(cache.size, 1)
    };
  }, []);

  // Background cache cleanup
  useEffect(() => {
    const cleanup = () => {
      const cache = cacheRef.current;
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of cache.entries()) {
        if ((now - entry.timestamp) > entry.maxAge * 2) { // Delete if 2x expired
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => cache.delete(key));
      
      if (keysToDelete.length > 0) {
        console.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
      }
    };

    const interval = setInterval(cleanup, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, []);

  return {
    cache,
    prefetch,
    invalidate,
    getCacheStats
  };
};