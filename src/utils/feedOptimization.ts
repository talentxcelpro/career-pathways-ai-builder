import { supabase } from '@/integrations/supabase/client';

interface FeedCache {
  data: any[];
  timestamp: number;
  version: string;
}

interface CDNConfig {
  imageBaseUrl: string;
  videoBaseUrl: string;
  cacheTTL: number;
}

/**
 * Feed Optimization Utilities
 * Implements caching, CDN management, and performance optimizations
 */
export class FeedOptimizer {
  private cache = new Map<string, FeedCache>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor(private cdnConfig?: CDNConfig) {}

  /**
   * Get optimized image URL with CDN and responsive sizing
   */
  getOptimizedImageUrl(
    originalUrl: string, 
    width?: number, 
    quality: number = 80
  ): string {
    if (!this.cdnConfig || !originalUrl) return originalUrl;

    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('f', 'webp'); // Prefer WebP format

    return `${this.cdnConfig.imageBaseUrl}/${originalUrl}?${params.toString()}`;
  }

  /**
   * Cache management with LRU eviction
   */
  setCacheData(key: string, data: any[], version: string = '1.0') {
    // Implement LRU eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      version
    });
  }

  getCacheData(key: string): any[] | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Incremental feed updates - only fetch new/changed items
   */
  async getIncrementalUpdates(
    lastUpdateTimestamp: string,
    userId?: string,
    limit: number = 50
  ) {
    try {
      const query = supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id, user_id),
          post_comments!left(id),
          post_shares!left(id),
          profiles!inner(id, full_name, profile_picture_url, title)
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .gt('updated_at', lastUpdateTimestamp)
        .order('updated_at', { ascending: false })
        .limit(limit);

      const { data, error } = await query;
      
      if (error) throw error;

      // Optimize image URLs for each post
      const optimizedData = data?.map(post => ({
        ...post,
        media_urls: post.media_urls?.map((url: string) => 
          this.getOptimizedImageUrl(url, 800, 85)
        ),
        profiles: {
          ...post.profiles,
          profile_picture_url: post.profiles?.profile_picture_url 
            ? this.getOptimizedImageUrl(post.profiles.profile_picture_url, 100, 90)
            : null
        }
      })) || [];

      return {
        items: optimizedData,
        hasMore: data?.length === limit,
        lastTimestamp: data?.[0]?.updated_at || lastUpdateTimestamp
      };
    } catch (error) {
      console.error('Error fetching incremental updates:', error);
      throw error;
    }
  }

  /**
   * Preload next batch of content for smooth scrolling
   */
  async preloadNextBatch(
    currentOffset: number,
    batchSize: number = 10
  ): Promise<any[]> {
    const cacheKey = `preload-${currentOffset + batchSize}`;
    const cached = this.getCacheData(cacheKey);
    
    if (cached) return cached;

    try {
      const { data } = await supabase
        .from('posts')
        .select('id, media_urls')
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(currentOffset + batchSize, currentOffset + batchSize * 2 - 1);

      // Preload images in background
      if (data) {
        data.forEach(post => {
          post.media_urls?.forEach((url: string) => {
            const img = new Image();
            img.src = this.getOptimizedImageUrl(url, 800, 85);
          });
        });

        this.setCacheData(cacheKey, data);
      }

      return data || [];
    } catch (error) {
      console.error('Error preloading content:', error);
      return [];
    }
  }

  /**
   * Background sync for offline capability
   */
  async syncInBackground(userId: string) {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('sync' in registration) {
        await (registration as any).sync.register('feed-sync');
      }

      // Store sync timestamp
      localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  /**
   * Performance monitoring
   */
  measurePerformance(operation: string, startTime: number): void {
    const duration = performance.now() - startTime;
    
    console.log(`Feed operation '${operation}' took ${duration.toFixed(2)}ms`);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'feed_performance', {
        operation,
        duration: Math.round(duration),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Memory management
   */
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const feedOptimizer = new FeedOptimizer({
  imageBaseUrl: 'https://images.webalias.co',
  videoBaseUrl: 'https://videos.webalias.co',
  cacheTTL: 5 * 60 * 1000
});