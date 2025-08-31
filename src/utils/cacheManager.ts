import { redisCache } from './redis';
import { supabase } from '@/integrations/supabase/client';

export interface CacheMetrics {
  hitRate: number;
  totalRequests: number;
  avgResponseTime: number;
  cacheSize: number;
}

export class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Jobs cache
  async cacheJobs(jobs: any[], filters: Record<string, any>) {
    const cacheKey = `jobs:${JSON.stringify(filters)}`;
    await redisCache.set(cacheKey, jobs, {
      ttl: 600, // 10 minutes
      tags: ['jobs', 'search']
    });
  }

  async getCachedJobs(filters: Record<string, any>) {
    const cacheKey = `jobs:${JSON.stringify(filters)}`;
    return redisCache.get(cacheKey);
  }

  // User profile cache
  async cacheUserProfile(userId: string, profile: any) {
    const cacheKey = `profile:${userId}`;
    await redisCache.set(cacheKey, profile, {
      ttl: 1800, // 30 minutes
      tags: ['profiles', `user:${userId}`]
    });
  }

  async getCachedUserProfile(userId: string) {
    const cacheKey = `profile:${userId}`;
    return redisCache.get(cacheKey);
  }

  // Search results cache
  async cacheSearchResults(query: string, results: any[]) {
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    await redisCache.set(cacheKey, results, {
      ttl: 300, // 5 minutes
      tags: ['search']
    });
  }

  async getCachedSearchResults(query: string) {
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    return redisCache.get(cacheKey);
  }

  // Analytics cache
  async cacheAnalytics(type: string, data: any) {
    const cacheKey = `analytics:${type}`;
    await redisCache.set(cacheKey, data, {
      ttl: 3600, // 1 hour
      tags: ['analytics']
    });
  }

  async getCachedAnalytics(type: string) {
    const cacheKey = `analytics:${type}`;
    return redisCache.get(cacheKey);
  }

  // Cache invalidation strategies
  async invalidateUserCache(userId: string) {
    await redisCache.invalidateByTag(`user:${userId}`);
  }

  async invalidateJobsCache() {
    await redisCache.invalidateByTag('jobs');
  }

  async invalidateSearchCache() {
    await redisCache.invalidateByTag('search');
  }

  async invalidateAnalyticsCache() {
    await redisCache.invalidateByTag('analytics');
  }

  // Performance metrics
  async getMetrics(): Promise<CacheMetrics> {
    const stats = await redisCache.getStats();
    
    return {
      hitRate: stats.hitRate,
      totalRequests: stats.hits + stats.misses,
      avgResponseTime: 0, // Would need to implement timing
      cacheSize: 0 // Would need Redis memory usage
    };
  }

  // Store metrics in Supabase for persistence
  async logMetrics(metrics: CacheMetrics) {
    try {
      await supabase.from('performance_cache_metrics').insert({
        hit_rate: metrics.hitRate,
        total_requests: metrics.totalRequests,
        avg_response_time: metrics.avgResponseTime,
        cache_size: metrics.cacheSize,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log cache metrics:', error);
    }
  }

  // Warm cache with frequently accessed data
  async warmCache() {
    try {
      // Warm popular job categories
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .limit(50);

      if (jobs) {
        await this.cacheJobs(jobs, { popular: true });
      }

      // Warm trending locations
      const { data: locations } = await supabase.rpc('get_trending_job_locations');
      if (locations) {
        await redisCache.set('trending:locations', locations, {
          ttl: 7200, // 2 hours
          tags: ['trending']
        });
      }
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }
}

export const cacheManager = CacheManager.getInstance();