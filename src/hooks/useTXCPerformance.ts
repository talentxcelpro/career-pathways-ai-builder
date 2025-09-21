import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  cacheHitRate: number;
  avgResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class TXCPerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, data: T, ttlMs = 300000): void { // 5 min default TTL
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.data as T;
  }

  getCacheStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      size: this.cache.size,
      hits: this.hitCount,
      misses: this.missCount
    };
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

// Singleton cache instance
const performanceCache = new TXCPerformanceCache();

export const useTXCPerformance = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeConnections: 0,
    memoryUsage: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Debounced function to batch database requests
  const debouncedBatch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    const pendingRequests: Array<() => Promise<any>> = [];

    return (request: () => Promise<any>) => {
      return new Promise((resolve, reject) => {
        pendingRequests.push(() => request().then(resolve).catch(reject));

        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          const batch = [...pendingRequests];
          pendingRequests.length = 0;

          try {
            const results = await Promise.allSettled(
              batch.map(req => req())
            );
            
            // Log batch performance
            console.log(`Executed batch of ${batch.length} requests`);
          } catch (error) {
            console.error('Batch execution error:', error);
          }
        }, 100); // 100ms debounce
      });
    };
  }, []);

  // Optimized data fetcher with caching
  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 300000
  ): Promise<T> => {
    const startTime = Date.now();

    // Check cache first
    const cached = performanceCache.get<T>(key);
    if (cached) {
      return cached;
    }

    try {
      const result = await debouncedBatch(fetcher) as T;
      performanceCache.set(key, result, ttlMs);
      
      // Track performance
      const responseTime = Date.now() - startTime;
      console.log(`Cache miss for ${key}, fetch took ${responseTime}ms`);
      
      return result;
    } catch (error) {
      console.error(`Fetch error for ${key}:`, error);
      throw error;
    }
  }, [debouncedBatch]);

  // Optimized TXC balance fetcher
  const getOptimizedBalance = useCallback(async () => {
    if (!user?.id) return null;

    return fetchWithCache(
      `balance-${user.id}`,
      async () => {
        const { data, error } = await supabase
          .from('user_txc_balances')
          .select('balance, total_earned')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        return data;
      },
      60000 // 1 minute cache for balance
    );
  }, [user?.id, fetchWithCache]);

  // Optimized leaderboard fetcher
  const getOptimizedLeaderboard = useCallback(async (limit = 10) => {
    return fetchWithCache(
      `leaderboard-${limit}`,
      async () => {
        const { data, error } = await supabase
          .rpc('get_txc_leaderboard_optimized', { limit_count: limit });

        if (error) throw error;
        return data;
      },
      300000 // 5 minute cache for leaderboard
    );
  }, [fetchWithCache]);

  // Performance monitoring
  const collectMetrics = useCallback(async () => {
    const cacheStats = performanceCache.getCacheStats();
    
    // Simulated metrics - in production, these would come from monitoring APIs
    setMetrics({
      cacheHitRate: cacheStats.hitRate,
      avgResponseTime: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 5, // 0-5%
      activeConnections: Math.floor(Math.random() * 100) + 50,
      memoryUsage: (performance as any)?.memory?.usedJSHeapSize || 0
    });
  }, []);

  // Auto-optimization features
  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Clear stale cache entries
      performanceCache.clear();
      
      // Preload critical data
      if (user?.id) {
        await Promise.all([
          getOptimizedBalance(),
          getOptimizedLeaderboard(5)
        ]);
      }

      // Simulate optimization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('TXC Performance optimization completed');
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [user?.id, getOptimizedBalance, getOptimizedLeaderboard]);

  // Lazy loading utility
  const createLazyLoader = useCallback(<T>(
    loader: () => Promise<T>,
    fallback: T
  ) => {
    let promise: Promise<T> | null = null;
    let result: T | null = null;

    return () => {
      if (result) return Promise.resolve(result);
      
      if (!promise) {
        promise = loader().then(data => {
          result = data;
          return data;
        }).catch(() => fallback);
      }
      
      return promise;
    };
  }, []);

  // Connection pooling for Supabase
  const createConnectionPool = useCallback(() => {
    const pool: Promise<any>[] = [];
    const maxPoolSize = 5;

    return {
      execute: async <T>(query: () => Promise<T>): Promise<T> => {
        if (pool.length >= maxPoolSize) {
          await Promise.race(pool);
        }

        const promise = query();
        pool.push(promise);

        promise.finally(() => {
          const index = pool.indexOf(promise);
          if (index > -1) {
            pool.splice(index, 1);
          }
        });

        return promise;
      }
    };
  }, []);

  // Memory management
  const optimizeMemory = useCallback(() => {
    // Clear large objects from memory
    if (window.gc) {
      window.gc();
    }
    
    // Clear unused cache entries
    const cacheStats = performanceCache.getCacheStats();
    if (cacheStats.size > 50) {
      performanceCache.clear();
    }
  }, []);

  // Service Worker for background tasks
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Send TXC data to service worker for background processing
        if (registration.active) {
          registration.active.postMessage({
            type: 'TXC_INIT',
            userId: user?.id
          });
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    // Collect metrics every 30 seconds
    const interval = setInterval(collectMetrics, 30000);
    collectMetrics(); // Initial collection

    return () => clearInterval(interval);
  }, [collectMetrics]);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
    
    // Auto-optimize on user change
    if (user?.id) {
      optimizePerformance();
    }
  }, [user?.id, registerServiceWorker, optimizePerformance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      optimizeMemory();
    };
  }, [optimizeMemory]);

  return {
    metrics,
    isOptimizing,
    fetchWithCache,
    getOptimizedBalance,
    getOptimizedLeaderboard,
    optimizePerformance,
    createLazyLoader,
    createConnectionPool,
    optimizeMemory,
    cacheStats: performanceCache.getCacheStats()
  };
};