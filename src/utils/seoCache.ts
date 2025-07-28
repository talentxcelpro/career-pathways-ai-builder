import { QueryClient } from '@tanstack/react-query';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  maxPages: number;
}

interface SEOCacheStats {
  totalCached: number;
  stalePages: number;
  cacheHitRate: number;
  averageLoadTime: number;
}

/**
 * SEO Cache Manager for optimizing page performance
 */
export class SEOCacheManager {
  private queryClient: QueryClient;
  private config: CacheConfig;
  private stats: Map<string, { hits: number; misses: number; loadTimes: number[] }>;

  constructor(queryClient: QueryClient, config: Partial<CacheConfig> = {}) {
    this.queryClient = queryClient;
    this.config = {
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxPages: 1000,
      ...config
    };
    this.stats = new Map();
  }

  /**
   * Preload critical SEO pages for better performance
   */
  async preloadCriticalPages() {
    const criticalPages = [
      { pageType: 'job_location', primarySlug: 'bangalore' },
      { pageType: 'job_location', primarySlug: 'delhi' },
      { pageType: 'job_location', primarySlug: 'mumbai' },
      { pageType: 'job_role', primarySlug: 'software-engineer' },
      { pageType: 'job_role', primarySlug: 'data-scientist' },
      { pageType: 'job_skill', primarySlug: 'react' },
      { pageType: 'job_skill', primarySlug: 'python' },
    ];

    console.log('Preloading critical SEO pages...');
    
    const promises = criticalPages.map(page => 
      this.prefetchSEOContent(page.pageType, page.primarySlug)
    );

    await Promise.allSettled(promises);
    console.log('Critical pages preloaded');
  }

  /**
   * Prefetch SEO content without triggering loading states
   */
  async prefetchSEOContent(
    pageType: string, 
    primarySlug: string, 
    secondarySlug?: string, 
    tertiarySlug?: string
  ) {
    const queryKey = [
      'seo-content',
      pageType,
      primarySlug,
      secondarySlug,
      tertiarySlug
    ].filter(Boolean);

    try {
      await this.queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          const startTime = performance.now();
          
          // Simulate the same fetch logic as useCachedSEO
          const response = await fetch('/api/seo-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageType,
              primarySlug,
              secondarySlug,
              tertiarySlug
            })
          });
          
          const endTime = performance.now();
          this.recordStats(queryKey.join('/'), true, endTime - startTime);
          
          return response.json();
        },
        staleTime: this.config.staleTime,
        gcTime: this.config.gcTime,
      });
    } catch (error) {
      this.recordStats(queryKey.join('/'), false, 0);
      console.error('Failed to prefetch SEO content:', error);
    }
  }

  /**
   * Bulk prefetch multiple pages
   */
  async bulkPrefetch(pages: Array<{
    pageType: string;
    primarySlug: string;
    secondarySlug?: string;
    tertiarySlug?: string;
  }>) {
    console.log(`Bulk prefetching ${pages.length} SEO pages...`);
    
    // Process in batches to avoid overwhelming the server
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < pages.length; i += batchSize) {
      batches.push(pages.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(page => 
        this.prefetchSEOContent(
          page.pageType,
          page.primarySlug,
          page.secondarySlug,
          page.tertiarySlug
        )
      );
      
      await Promise.allSettled(promises);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Bulk prefetch completed');
  }

  /**
   * Clear stale cache entries
   */
  clearStaleCache() {
    const queries = this.queryClient.getQueryCache().getAll();
    const staleTime = Date.now() - this.config.staleTime;
    
    queries.forEach(query => {
      if (query.queryKey[0] === 'seo-content' && 
          query.state.dataUpdatedAt < staleTime) {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    console.log('Cleared stale SEO cache entries');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): SEOCacheStats {
    const queries = this.queryClient.getQueryCache().getAll();
    const seoQueries = queries.filter(q => q.queryKey[0] === 'seo-content');
    
    const totalCached = seoQueries.length;
    const staleTime = Date.now() - this.config.staleTime;
    const stalePages = seoQueries.filter(q => q.state.dataUpdatedAt < staleTime).length;
    
    // Calculate hit rate from stored stats
    let totalHits = 0;
    let totalMisses = 0;
    let allLoadTimes: number[] = [];
    
    this.stats.forEach(stat => {
      totalHits += stat.hits;
      totalMisses += stat.misses;
      allLoadTimes.push(...stat.loadTimes);
    });
    
    const cacheHitRate = totalHits + totalMisses > 0 
      ? (totalHits / (totalHits + totalMisses)) * 100 
      : 0;
      
    const averageLoadTime = allLoadTimes.length > 0
      ? allLoadTimes.reduce((a, b) => a + b, 0) / allLoadTimes.length
      : 0;

    return {
      totalCached,
      stalePages,
      cacheHitRate,
      averageLoadTime
    };
  }

  /**
   * Invalidate specific page cache
   */
  invalidatePage(pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string) {
    const queryKey = [
      'seo-content',
      pageType,
      primarySlug,
      secondarySlug,
      tertiarySlug
    ].filter(Boolean);

    this.queryClient.invalidateQueries({ queryKey });
    console.log(`Invalidated cache for: ${queryKey.join('/')}`);
  }

  /**
   * Force refresh specific page
   */
  async refreshPage(pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string) {
    const queryKey = [
      'seo-content',
      pageType,
      primarySlug,
      secondarySlug,
      tertiarySlug
    ].filter(Boolean);

    await this.queryClient.refetchQueries({ queryKey });
    console.log(`Refreshed cache for: ${queryKey.join('/')}`);
  }

  private recordStats(pageKey: string, hit: boolean, loadTime: number) {
    if (!this.stats.has(pageKey)) {
      this.stats.set(pageKey, { hits: 0, misses: 0, loadTimes: [] });
    }
    
    const stat = this.stats.get(pageKey)!;
    
    if (hit) {
      stat.hits++;
    } else {
      stat.misses++;
    }
    
    if (loadTime > 0) {
      stat.loadTimes.push(loadTime);
      
      // Keep only last 10 load times to prevent memory bloat
      if (stat.loadTimes.length > 10) {
        stat.loadTimes = stat.loadTimes.slice(-10);
      }
    }
  }
}

/**
 * Default cache configuration optimized for SEO pages
 */
export const DEFAULT_SEO_CACHE_CONFIG: CacheConfig = {
  staleTime: 24 * 60 * 60 * 1000, // 24 hours - SEO content doesn't change frequently
  gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - Keep in memory for a week
  maxPages: 1000, // Reasonable limit for memory usage
};

/**
 * Initialize SEO cache with service worker for offline support
 */
export const initializeSEOCache = async (queryClient: QueryClient) => {
  const cacheManager = new SEOCacheManager(queryClient, DEFAULT_SEO_CACHE_CONFIG);
  
  // Preload critical pages on app start
  await cacheManager.preloadCriticalPages();
  
  // Set up periodic cache cleanup
  setInterval(() => {
    cacheManager.clearStaleCache();
  }, 60 * 60 * 1000); // Every hour
  
  return cacheManager;
};
