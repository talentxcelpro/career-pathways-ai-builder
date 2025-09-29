/**
 * Enhanced performance monitoring and optimization hooks
 * Integrates with existing app architecture
 */

import { useEffect, useCallback, useState } from 'react';
import { giantAppLoader } from '@/utils/giantAppLoader';
import { dbOptimizer } from '@/utils/databaseOptimizer';
import { errorResilience } from '@/utils/errorResilience';

/**
 * Hook for optimized data fetching with caching and error resilience
 */
export const useOptimizedQuery = <T>(
  key: string, 
  queryFn: () => Promise<T>,
  options?: {
    cacheTime?: number;
    retryCount?: number;
    fallback?: T;
  }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await errorResilience.resilientCall(
        key,
        queryFn,
        options?.fallback
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      if (options?.fallback) {
        setData(options.fallback);
      }
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, options?.fallback]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Hook for optimized posts with giant app performance
 */
export const useOptimizedPosts = (limit = 50) => {
  const { data: posts, loading, error, refetch } = useOptimizedQuery(
    'posts',
    () => dbOptimizer.getPostsOptimized(limit),
    { fallback: [] }
  );

  const invalidateCache = useCallback(() => {
    dbOptimizer.invalidateCache('posts');
    refetch();
  }, [refetch]);

  return {
    posts: posts || [],
    loading,
    error,
    refetch,
    invalidateCache
  };
};

/**
 * Hook for optimized notifications with performance monitoring
 */
export const useOptimizedNotifications = (userId: string) => {
  const { data: notifications, loading, error, refetch } = useOptimizedQuery(
    `notifications_${userId}`,
    () => dbOptimizer.getNotificationsOptimized(userId),
    { fallback: [] }
  );

  return {
    notifications: notifications || [],
    loading,
    error,
    refetch
  };
};

/**
 * Hook for preloading critical data based on route
 */
export const useRoutePreloader = (route: string, userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    // Preload data based on route
    const preloadData = async () => {
      const routeDataMap: Record<string, () => Promise<any>> = {
        '/network': () => dbOptimizer.preloadCriticalData(userId),
        '/jobs': () => dbOptimizer.batchQueries({
          jobs: () => Promise.resolve([]), // Add jobs query
          applications: () => Promise.resolve([]), // Add applications query
        }),
        '/profile': () => dbOptimizer.getUserProfileOptimized(userId),
      };

      const preloader = routeDataMap[route];
      if (preloader) {
        await preloader();
      }
    };

    preloadData().catch(console.warn);
  }, [route, userId]);
};

/**
 * Hook for performance monitoring
 */
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Initialize giant app optimizations
    giantAppLoader.init();

    // Track performance metrics
    if (typeof performance !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navigation = entry as PerformanceNavigationTiming;
            console.log('🚀 Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, []);

  return {
    preloadRoute: (route: string) => {
      // Use intelligent preloading
      if (giantAppLoader.preloader) {
        giantAppLoader.preloader.intelligentPreload(route);
      }
    },
    clearCache: () => {
      dbOptimizer.invalidateCache();
    }
  };
};