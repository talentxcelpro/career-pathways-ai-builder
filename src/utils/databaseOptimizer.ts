/**
 * Database optimization layer - like giant apps use
 * Reduces database calls and optimizes queries
 */

import { supabase } from '@/integrations/supabase/client';

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; expires: number; }>();
  private pendingQueries = new Map<string, Promise<any>>();
  
  static getInstance() {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Optimized posts query that handles relationship errors gracefully
   */
  async getPostsOptimized(limit = 50) {
    const cacheKey = `posts_${limit}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Check if query is already pending
    if (this.pendingQueries.has(cacheKey)) {
      return this.pendingQueries.get(cacheKey);
    }

    // Create optimized query
    const queryPromise = this.executePostsQuery(limit);
    this.pendingQueries.set(cacheKey, queryPromise);

    try {
      const result = await queryPromise;
      this.setCached(cacheKey, result, 60000); // Cache for 1 minute
      return result;
    } catch (error) {
      console.warn('Posts query failed, using fallback:', error);
      return this.getFallbackPosts(limit);
    } finally {
      this.pendingQueries.delete(cacheKey);
    }
  }

  private async executePostsQuery(limit: number) {
    try {
      // First try the optimized query without the problematic foreign key hint
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            profile_picture_url,
            title,
            headline,
            current_company
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Fallback: Get posts without profile join
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(posts?.map(post => post.author_id).filter(Boolean) || [])];
      
      if (authorIds.length === 0) return posts || [];

      // Batch fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, headline, current_company')
        .in('id', authorIds);

      // Merge posts with profiles
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return posts?.map(post => ({
        ...post,
        profiles: profileMap.get(post.author_id) || null
      })) || [];
    }
  }

  private async getFallbackPosts(limit: number) {
    // Ultimate fallback - return empty array with structure
    console.warn('Using fallback posts data');
    return [];
  }

  /**
   * Optimized notifications query
   */
  async getNotificationsOptimized(userId: string, limit = 50) {
    const cacheKey = `notifications_${userId}_${limit}`;
    
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this.setCached(cacheKey, data || [], 30000); // Cache for 30 seconds
      return data || [];
    } catch (error) {
      console.warn('Notifications query failed:', error);
      return [];
    }
  }

  /**
   * Optimized user profile query
   */
  async getUserProfileOptimized(userId: string) {
    const cacheKey = `profile_${userId}`;
    
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      this.setCached(cacheKey, data, 300000); // Cache for 5 minutes
      return data;
    } catch (error) {
      console.warn('Profile query failed:', error);
      return null;
    }
  }

  /**
   * Batch multiple queries for efficiency
   */
  async batchQueries<T extends Record<string, () => Promise<any>>>(
    queries: T
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
    const entries = Object.entries(queries);
    const results = await Promise.allSettled(
      entries.map(([, queryFn]) => queryFn())
    );

    const batchResult = {} as any;
    entries.forEach(([key], index) => {
      const result = results[index];
      batchResult[key] = result.status === 'fulfilled' ? result.value : null;
    });

    return batchResult;
  }

  /**
   * Preload critical data for current route
   */
  async preloadCriticalData(userId: string) {
    // Batch the most common queries
    return this.batchQueries({
      posts: () => this.getPostsOptimized(20),
      notifications: () => this.getNotificationsOptimized(userId, 10),
      profile: () => this.getUserProfileOptimized(userId),
    });
  }

  private getCached(key: string) {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    this.queryCache.delete(key);
    return null;
  }

  private setCached(key: string, data: any, ttl: number) {
    this.queryCache.set(key, {
      data,
      expires: Date.now() + ttl
    });

    // Cleanup old cache entries
    if (this.queryCache.size > 100) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
  }

  /**
   * Clear cache for specific patterns
   */
  invalidateCache(pattern?: string) {
    if (!pattern) {
      this.queryCache.clear();
      return;
    }

    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
      }
    }
  }
}

// Export singleton
export const dbOptimizer = DatabaseOptimizer.getInstance();

// Optimized hook for notifications only
export const useOptimizedNotifications = (userId: string) => {
  return {
    getNotifications: (limit?: number) => dbOptimizer.getNotificationsOptimized(userId, limit),
    invalidateNotificationsCache: () => dbOptimizer.invalidateCache('notifications'),
  };
};
