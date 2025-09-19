// Advanced caching utilities for performance optimization

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  strategy?: 'lru' | 'fifo' | 'lfu';
}

export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize || 100,
      strategy: config.strategy || 'lru'
    };
  }

  set(key: string, value: T): void {
    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check TTL
    if (Date.now() - item.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access count for LFU
    item.accessCount++;
    
    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;
    
    switch (this.config.strategy) {
      case 'lru':
        // Find least recently used (oldest timestamp with recent access)
        keyToEvict = this.findLRU();
        break;
      case 'lfu':
        // Find least frequently used
        keyToEvict = this.findLFU();
        break;
      case 'fifo':
      default:
        // First in, first out (oldest timestamp)
        keyToEvict = this.findFIFO();
        break;
    }
    
    this.cache.delete(keyToEvict);
  }

  private findLRU(): string {
    let oldestKey = '';
    let oldestTime = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  private findLFU(): string {
    let leastUsedKey = '';
    let leastCount = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }
    
    return leastUsedKey;
  }

  private findFIFO(): string {
    return this.cache.keys().next().value;
  }

  size(): number {
    return this.cache.size;
  }
}

// API Response Cache
export class APICache {
  private cache = new MemoryCache<{ data: any; etag?: string }>();
  
  constructor(config?: CacheConfig) {
    this.cache = new MemoryCache(config);
  }

  async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = this.generateCacheKey(url, options);
    const cached = this.cache.get(cacheKey);
    
    // Add If-None-Match header if we have an etag
    if (cached?.etag) {
      options.headers = {
        ...options.headers,
        'If-None-Match': cached.etag
      };
    }
    
    try {
      const response = await fetch(url, options);
      
      // If 304 Not Modified, return cached data
      if (response.status === 304 && cached) {
        return cached.data;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const etag = response.headers.get('etag');
      
      // Cache the response
      this.cache.set(cacheKey, { data, etag: etag || undefined });
      
      return data;
    } catch (error) {
      // Return cached data if available and there's a network error
      if (cached) {
        console.warn('Network error, returning cached data:', error);
        return cached.data;
      }
      throw error;
    }
  }

  private generateCacheKey(url: string, options: RequestInit): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Simple pattern matching for cache invalidation
    const regex = new RegExp(pattern);
    for (const key of Array.from(this.cache['cache'].keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// LocalStorage with TTL
export class PersistentCache {
  private prefix = 'app_cache_';
  
  set(key: string, value: any, ttl?: number): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000 // 24 hours default
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      // Handle quota exceeded
      this.cleanup();
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
      } catch (retryError) {
        console.error('Failed to save to localStorage after cleanup:', retryError);
      }
    }
  }
  
  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;
      
      const item = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }
  
  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
  
  private cleanup(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (Date.now() - item.timestamp > item.ttl) {
            keysToRemove.push(key);
          }
        } catch {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Service Worker Cache (for offline support)
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration);
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Global cache instances
export const apiCache = new APICache({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const persistentCache = new PersistentCache();