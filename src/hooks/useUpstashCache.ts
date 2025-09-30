import { useState, useEffect, useCallback } from 'react';
import { upstashRedisCache, CacheOptions } from '@/lib/upstash-redis';

export function useUpstashCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions & { enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options?.enabled && options?.enabled !== undefined) return;
    
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      const cached = await upstashRedisCache.get<T>(key);
      
      if (cached) {
        setData(cached);
        setLoading(false);
        await upstashRedisCache.increment('cache:hits');
        return cached;
      }

      // Cache miss - fetch fresh data
      await upstashRedisCache.increment('cache:misses');
      const freshData = await fetcher();
      
      // Cache the result
      await upstashRedisCache.set(key, freshData, options);
      setData(freshData);
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      console.error('Upstash cache fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options]);

  const invalidate = useCallback(async () => {
    await upstashRedisCache.del(key);
    setData(null);
  }, [key]);

  const invalidateByTag = useCallback(async (tag: string) => {
    await upstashRedisCache.invalidateByTag(tag);
  }, []);

  const refresh = useCallback(async () => {
    await invalidate();
    return fetchData();
  }, [invalidate, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    invalidateByTag,
    refetch: fetchData
  };
}

export function useUpstashCacheStats() {
  const [stats, setStats] = useState({ hits: 0, misses: 0, hitRate: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const cacheStats = await upstashRedisCache.getStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to fetch Upstash cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}