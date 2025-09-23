import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  retries?: number;
  timeout?: number;
  fallbackData?: any;
}

export class EnhancedDatabaseQueries {
  private static instance: EnhancedDatabaseQueries;
  private queryCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): EnhancedDatabaseQueries {
    if (!EnhancedDatabaseQueries.instance) {
      EnhancedDatabaseQueries.instance = new EnhancedDatabaseQueries();
    }
    return EnhancedDatabaseQueries.instance;
  }

  // Enhanced query with retry logic and caching
  async executeQuery<T>(
    queryBuilder: () => any,
    cacheKey?: string,
    options: QueryOptions = {}
  ): Promise<{ data: T | null; error: any }> {
    const { retries = 3, timeout = 10000, fallbackData = null } = options;
    
    // Check cache first
    if (cacheKey && this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        console.log(`📊 Cache hit for: ${cacheKey}`);
        return { data: cached.data, error: null };
      } else {
        this.queryCache.delete(cacheKey);
      }
    }

    let lastError = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📊 Database query attempt ${attempt}/${retries}`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });
        
        // Race between query and timeout
        const result = await Promise.race([
          queryBuilder(),
          timeoutPromise
        ]);
        
        // Cache successful results
        if (cacheKey && !result.error && result.data) {
          this.queryCache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000 // 5 minutes cache
          });
        }
        
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Query attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (this.shouldSkipRetry(error)) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ All query attempts failed, returning fallback data');
    return { data: fallbackData, error: lastError };
  }

  private shouldSkipRetry(error: any): boolean {
    const errorMsg = error.message?.toLowerCase() || '';
    
    const skipErrors = [
      'jwt',
      'unauthorized',
      'permission denied',
      'row level security',
      'invalid_grant'
    ];
    
    return skipErrors.some(skip => errorMsg.includes(skip));
  }

  // Specific methods for common problematic queries
  async getTokenTransactions(userId: string, limit = 20) {
    return this.executeQuery(
      () => supabase
        .from('token_transactions')
        .select(`
          id,
          amount,
          transaction_type,
          description,
          created_at,
          token_type,
          status
        `)
        .or(`to_user_id.eq.${userId},from_user_id.eq.${userId}`)
        .eq('token_type', 'TXC')
        .order('created_at', { ascending: false })
        .limit(limit),
      `token_transactions_${userId}_${limit}`,
      { retries: 2, fallbackData: [] }
    );
  }

  async getProfileViews(profileId: string, viewerId: string) {
    return this.executeQuery(
      () => supabase
        .from('profile_views')
        .select('id')
        .eq('profile_id', profileId)
        .eq('viewer_id', viewerId)
        .gte('viewed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1),
      `profile_views_${profileId}_${viewerId}`,
      { retries: 2, fallbackData: [] }
    );
  }

  async getConversations(userId: string) {
    return this.executeQuery(
      () => supabase
        .from('conversations')
        .select(`
          *,
          messages!conversations_last_message_id_fkey(
            id,
            content,
            created_at,
            sender_id,
            message_type,
            status
          )
        `)
        .contains('participants', [userId])
        .order('last_updated', { ascending: false }),
      `conversations_${userId}`,
      { retries: 2, fallbackData: [] }
    );
  }

  async getPostLikes(postIds: string[]) {
    // Split large arrays to avoid URL length issues
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < postIds.length; i += batchSize) {
      const batch = postIds.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    const allResults = [];
    
    for (const batch of batches) {
      const result = await this.executeQuery(
        () => supabase
          .from('post_likes')
          .select('created_at, user_id, post_id')
          .in('post_id', batch),
        `post_likes_batch_${batch.join('_').substring(0, 50)}`,
        { retries: 2, fallbackData: [] }
      );
      
      if (result.data && Array.isArray(result.data)) {
        allResults.push(...result.data);
      }
    }
    
    return { data: allResults, error: null };
  }

  // Clear cache when needed
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
    console.log('🗑️ Database query cache cleared');
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }
}

export const enhancedDB = EnhancedDatabaseQueries.getInstance();