import { supabase } from '@/integrations/supabase/client';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

export class UpstashRedisCache {
  private static instance: UpstashRedisCache;

  private constructor() {}

  static getInstance(): UpstashRedisCache {
    if (!UpstashRedisCache.instance) {
      UpstashRedisCache.instance = new UpstashRedisCache();
    }
    return UpstashRedisCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'get', key }
      });
      
      if (error) throw error;
      return data?.data ? JSON.parse(data.data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      await this.increment('cache:misses');
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { 
          action: 'set', 
          key, 
          value, 
          ttl: options?.ttl || 3600,
          tag: options?.tags?.[0] // Use first tag for simplicity
        }
      });
      
      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'del', key }
      });
      
      if (error) throw error;
      return data?.success || false;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      await supabase.functions.invoke('cache-manager', {
        body: { action: 'invalidateByTag', tag }
      });
    } catch (error) {
      console.error('Cache tag invalidation error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'exists', key }
      });
      
      if (error) throw error;
      return data?.data || false;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async increment(key: string, increment = 1): Promise<number> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'increment', key, value: increment }
      });
      
      if (error) throw error;
      return data?.data || 0;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async getStats(): Promise<{ hits: number; misses: number; hitRate: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'stats' }
      });
      
      if (error) throw error;
      return data?.data || { hits: 0, misses: 0, hitRate: 0 };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }

  // Advanced caching methods for performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const { data, error } = await supabase.functions.invoke('cache-manager', {
        body: { action: 'mget', keys }
      });
      
      if (error) throw error;
      return data?.data || new Array(keys.length).fill(null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  async mset(pairs: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      // For simplicity, we'll set each key individually
      const promises = Object.entries(pairs).map(([key, value]) =>
        this.set(key, value, { ttl })
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Cache warming for predictive caching
  async warmCache(patterns: string[]): Promise<void> {
    console.log('Warming cache for patterns:', patterns);
    // Implementation for cache warming based on usage patterns
  }
}

export const upstashRedisCache = UpstashRedisCache.getInstance();