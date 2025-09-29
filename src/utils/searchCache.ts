/**
 * Browser-based caching for CV search results and frequent data
 * Reduces API calls and improves performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class SearchCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Set cache item with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      this.cache.set(key, item);
      
      // Also store in localStorage for persistence
      const storageKey = `search_cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
      
      // Clean up old cache entries
      this.cleanup();
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Get cache item if not expired
   */
  get<T>(key: string): T | null {
    try {
      let item = this.cache.get(key);
      
      // Try localStorage if not in memory
      if (!item) {
        const storageKey = `search_cache_${key}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          item = JSON.parse(stored);
          this.cache.set(key, item);
        }
      }
      
      if (!item) return null;
      
      const now = Date.now();
      const isExpired = (now - item.timestamp) > item.ttl;
      
      if (isExpired) {
        this.delete(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Delete cache item
   */
  delete(key: string): void {
    try {
      this.cache.delete(key);
      const storageKey = `search_cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      this.cache.clear();
      
      // Clear localStorage cache items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('search_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Generate cache key for search queries
   */
  generateSearchKey(searchTerm: string, filters: any = {}, page: number = 1): string {
    const filterStr = JSON.stringify(filters);
    return `search_${searchTerm}_${filterStr}_${page}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Generate cache key for CV data
   */
  generateCVKey(cvId: string): string {
    return `cv_${cvId}`;
  }

  /**
   * Generate cache key for batch data
   */
  generateBatchKey(batchId: string): string {
    return `batch_${batchId}`;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      this.cache.forEach((item, key) => {
        const isExpired = (now - item.timestamp) > item.ttl;
        if (isExpired) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.delete(key));
      
      // Limit cache size to prevent memory issues
      if (this.cache.size > 100) {
        const oldestKeys = Array.from(this.cache.keys()).slice(0, 20);
        oldestKeys.forEach(key => this.delete(key));
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; memorySize: number; storageSize: number } {
    try {
      const memorySize = this.cache.size;
      
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('search_cache_')
      );
      const storageSize = storageKeys.length;
      
      return {
        size: memorySize + storageSize,
        memorySize,
        storageSize
      };
    } catch (error) {
      console.warn('Cache stats failed:', error);
      return { size: 0, memorySize: 0, storageSize: 0 };
    }
  }
}

// Export singleton instance
export const searchCache = new SearchCache();

/**
 * Hook for using search cache in React components
 */
export const useSearchCache = () => {
  return {
    cache: searchCache,
    
    // Helper functions for common operations
    cacheSearch: (searchTerm: string, filters: any, page: number, data: any) => {
      const key = searchCache.generateSearchKey(searchTerm, filters, page);
      searchCache.set(key, data);
    },
    
    getCachedSearch: (searchTerm: string, filters: any, page: number) => {
      const key = searchCache.generateSearchKey(searchTerm, filters, page);
      return searchCache.get(key);
    },
    
    cacheCV: (cvId: string, data: any) => {
      const key = searchCache.generateCVKey(cvId);
      searchCache.set(key, data, 30 * 60 * 1000); // 30 minutes for CV data
    },
    
    getCachedCV: (cvId: string) => {
      const key = searchCache.generateCVKey(cvId);
      return searchCache.get(key);
    },
    
    clearCache: () => searchCache.clear(),
    getStats: () => searchCache.getStats()
  };
};