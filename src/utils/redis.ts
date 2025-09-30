// Mock Redis client for development - replace with actual Upstash config
const redis = {
  async get(key: string) {
    try {
      const stored = localStorage.getItem(`redis:${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  async setex(key: string, ttl: number, value: string) {
    localStorage.setItem(`redis:${key}`, value);
    setTimeout(() => {
      localStorage.removeItem(`redis:${key}`);
    }, ttl * 1000);
  },
  async del(...keys: string[]) {
    keys.forEach(key => localStorage.removeItem(`redis:${key}`));
  },
  async exists(key: string) {
    return localStorage.getItem(`redis:${key}`) !== null ? 1 : 0;
  },
  async incrby(key: string, increment: number) {
    const current = Number(localStorage.getItem(`redis:${key}`) || '0');
    const newValue = current + increment;
    localStorage.setItem(`redis:${key}`, newValue.toString());
    return newValue;
  },
  async sadd(key: string, member: string) {
    const stored = localStorage.getItem(`redis:${key}`);
    const set = new Set(stored ? JSON.parse(stored) : []);
    set.add(member);
    localStorage.setItem(`redis:${key}`, JSON.stringify([...set]));
  },
  async smembers(key: string) {
    const stored = localStorage.getItem(`redis:${key}`);
    return stored ? JSON.parse(stored) : [];
  },
  async expire(key: string, ttl: number) {
    setTimeout(() => {
      localStorage.removeItem(`redis:${key}`);
    }, ttl * 1000);
  }
};

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

export class RedisCache {
  private static instance: RedisCache;
  private redis: typeof redis;

  private constructor() {
    this.redis = redis;
  }

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      await this.increment('cache:hits');
      return value as T;
    } catch (error) {
      console.error('Redis get error:', error);
      await this.increment('cache:misses');
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    try {
      const ttl = options?.ttl || 3600; // Default 1 hour
      
      if (options?.compress && typeof value === 'string' && value.length > 1000) {
        // Compress large strings (implement compression if needed)
      }

      await this.redis.setex(key, ttl, JSON.stringify(value));
      
      // Store cache tags for invalidation with batch operations
      if (options?.tags) {
        const operations = options.tags.map(async (tag) => {
          await this.redis.sadd(`tag:${tag}`, key);
          await this.redis.expire(`tag:${tag}`, ttl);
        });
        await Promise.all(operations);
      }

      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
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
      console.error('Redis tag invalidation error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async increment(key: string, increment = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, increment);
    } catch (error) {
      console.error('Redis increment error:', error);
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
      console.error('Redis stats error:', error);
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }
}

export const redisCache = RedisCache.getInstance();