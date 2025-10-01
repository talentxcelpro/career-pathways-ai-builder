/**
 * Multi-Level Cache System
 * Memory → IndexedDB → Service Worker → CDN
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
}

interface CacheOptions {
  ttl?: number; // Time to live in ms
  priority?: 'high' | 'medium' | 'low';
  staleWhileRevalidate?: boolean;
}

class MultiLevelCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private dbName = 'talentxcel-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIndexedDB();
      this.startCacheCleanup();
    }
  }

  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  // Get from cache with fallback strategy
  async get<T>(key: string): Promise<T | null> {
    // Level 1: Memory cache (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Level 2: IndexedDB (fast)
    const dbEntry = await this.getFromIndexedDB<T>(key);
    if (dbEntry && !this.isExpired(dbEntry)) {
      // Promote to memory cache
      this.memoryCache.set(key, dbEntry);
      return dbEntry.data;
    }

    return null;
  }

  // Set in cache with multi-level strategy
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 5 * 60 * 1000, // Default 5 minutes
      priority = 'medium',
      staleWhileRevalidate = true,
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      priority,
    };

    // Level 1: Always set in memory
    this.memoryCache.set(key, entry);

    // Level 2: Set in IndexedDB for persistence
    await this.setInIndexedDB(key, entry);

    // Manage memory cache size
    this.manageMemoryCacheSize();
  }

  // Get with stale-while-revalidate
  async getWithRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached) {
      // Return cached data immediately
      // Revalidate in background if expired
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && this.isExpired(memoryEntry)) {
        this.revalidateInBackground(key, fetcher, options);
      }
      return cached;
    }

    // Cache miss - fetch and cache
    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ) {
    try {
      const data = await fetcher();
      await this.set(key, data, options);
    } catch (error) {
      console.warn('Background revalidation failed:', error);
    }
  }

  // Prefetch data for faster access
  async prefetch<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}) {
    const cached = await this.get<T>(key);
    if (!cached) {
      const data = await fetcher();
      await this.set(key, data, { ...options, priority: 'low' });
    }
  }

  // Batch prefetch
  async batchPrefetch<T>(keys: string[], fetcher: (key: string) => Promise<T>, options: CacheOptions = {}) {
    const promises = keys.map(key => this.prefetch(key, () => fetcher(key), options));
    await Promise.allSettled(promises);
  }

  // Delete from cache
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.deleteFromIndexedDB(key);
  }

  // Clear all caches
  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.clearIndexedDB();
  }

  // IndexedDB operations
  private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.entry : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async setInIndexedDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, entry });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility methods
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private manageMemoryCacheSize() {
    const maxSize = 100; // Maximum entries in memory
    if (this.memoryCache.size > maxSize) {
      // Remove low priority and oldest entries
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => {
          if (a[1].priority !== b[1].priority) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
          }
          return a[1].timestamp - b[1].timestamp;
        });

      // Remove oldest low priority entries
      entries.slice(0, this.memoryCache.size - maxSize).forEach(([key]) => {
        this.memoryCache.delete(key);
      });
    }
  }

  private startCacheCleanup() {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      this.memoryCache.forEach((entry, key) => {
        if (now > entry.expiresAt) {
          this.memoryCache.delete(key);
        }
      });
    }, 5 * 60 * 1000);
  }

  // Get cache statistics
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        key,
        size: JSON.stringify(entry.data).length,
        priority: entry.priority,
        age: Date.now() - entry.timestamp,
        ttl: entry.expiresAt - Date.now(),
      })),
    };
  }
}

export const multiLevelCache = new MultiLevelCache();
