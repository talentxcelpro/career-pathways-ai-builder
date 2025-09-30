import { Redis } from '@upstash/redis';

// Replace the mock Redis with real Upstash Redis
const redis = new Redis({
  url: 'https://usw1-sacred-boa-34251.upstash.io', // Replace with your Upstash Redis URL
  token: 'AYTyASQgNzI2YzM1YjItN2JjNy00Y2E0LWI1NDktOGY5ZWM3YzlhNWQ5ZjNlMGRjY2FiNDkyNDgzNzg5MGI5MDMzNWRlYjZmZWI=', // Replace with your Upstash token
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

export class UpstashRedisCache {
  private static instance: UpstashRedisCache;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  static getInstance(): UpstashRedisCache {
    if (!UpstashRedisCache.instance) {
      UpstashRedisCache.instance = new UpstashRedisCache();
    }
    return UpstashRedisCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      await this.increment('cache:hits');
      return value as T;
    } catch (error) {
      console.error('Upstash Redis get error:', error);
      await this.increment('cache:misses');
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || 3600; // Default 1 hour
      
      await this.redis.setex(key, ttl, JSON.stringify(value));
      
      // Store cache tags for invalidation
      if (options?.tags) {
        const operations = options.tags.map(async (tag) => {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl);
        });
        await Promise.all(operations);
      }

      return true;
    } catch (error) {
      console.error('Upstash Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Upstash Redis delete error:', error);
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
      }
    } catch (error) {
      console.error('Upstash Redis tag invalidation error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Upstash Redis exists error:', error);
      return false;
    }
  }

  async increment(key: string, increment = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, increment);
    } catch (error) {
      console.error('Upstash Redis increment error:', error);
      return 0;
    }
  }

  async getStats(): Promise<{ hits: number; misses: number; hitRate: number }> {
    try {
      const hits = await this.redis.get('cache:hits') || 0;
      const misses = await this.redis.get('cache:misses') || 0;
      const total = Number(hits) + Number(misses);
      const hitRate = total > 0 ? (Number(hits) / total) * 100 : 0;

      return {
        hits: Number(hits),
        misses: Number(misses),
        hitRate: Math.round(hitRate * 100) / 100
      };
    } catch (error) {
      console.error('Upstash Redis stats error:', error);
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }

  // Advanced caching methods for performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(v => v as T | null);
    } catch (error) {
      console.error('Upstash Redis mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  async mset(pairs: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      
      Object.entries(pairs).forEach(([key, value]) => {
        if (ttl) {
          pipeline.setex(key, ttl, JSON.stringify(value));
        } else {
          pipeline.set(key, JSON.stringify(value));
        }
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Upstash Redis mset error:', error);
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