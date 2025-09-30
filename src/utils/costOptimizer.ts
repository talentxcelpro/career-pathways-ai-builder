import { supabase } from '@/integrations/supabase/client';
import { upstashRedisCache } from '@/lib/upstash-redis';

interface CostOptimizationResult {
  optimization: string;
  before_size_mb: number;
  after_size_mb: number;
  savings_mb: number;
  records_affected: number;
}

interface OptimizationSummary {
  total_savings_mb: number;
  total_records_affected: number;
  estimated_cost_reduction_percent: number;
  optimizations_applied: number;
}

export class CostOptimizer {
  // Removed in-memory cache in favor of Upstash Redis
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Smart caching using Upstash Redis for better performance
  static async getCachedQuery<T>(
    key: string, 
    queryFn: () => Promise<T>,
    ttl: number = this.cacheTimeout
  ): Promise<T> {
    const cached = await upstashRedisCache.get<T>(key);
    
    if (cached) {
      return cached;
    }

    const data = await queryFn();
    await upstashRedisCache.set(key, data, { ttl: Math.floor(ttl / 1000) });

    return data;
  }

  // Cached CV search with optimized queries
  static async searchCVs(searchTerm: string, filters: any = {}) {
    const cacheKey = `cv_search_${searchTerm}_${JSON.stringify(filters)}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .from('unified_candidates')
        .select(`
          id, full_name, email, phone, location,
          skills, experience_years, education,
          current_position, resume_url, created_at
        `)
        .or(`
          full_name.ilike.%${searchTerm}%,
          email.ilike.%${searchTerm}%,
          skills.cs.{${searchTerm}},
          current_position.ilike.%${searchTerm}%,
          location.ilike.%${searchTerm}%
        `)
        .limit(50);

      if (error) throw error;
      return data;
    }, 2 * 60 * 1000); // 2 minute cache for search results
  }

  // Optimized job search with caching
  static async searchJobs(searchTerm: string, filters: any = {}) {
    const cacheKey = `job_search_${searchTerm}_${JSON.stringify(filters)}`;
    
    return this.getCachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, company_name, location, salary_range,
          employment_type, experience_level, skills_required,
          created_at, expires_at, is_remote
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gt('expires_at', new Date().toISOString())
        .or(`
          title.ilike.%${searchTerm}%,
          company_name.ilike.%${searchTerm}%,
          description.ilike.%${searchTerm}%
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }, 5 * 60 * 1000); // 5 minute cache for job listings
  }

  // Run database cleanup optimizations
  static async runDatabaseCleanup(): Promise<{
    results: CostOptimizationResult[];
    summary: OptimizationSummary;
  }> {
    const { data, error } = await supabase.functions.invoke('cost-optimizer', {
      body: { action: 'optimize_all' }
    });

    if (error) {
      throw new Error(`Database cleanup failed: ${error.message}`);
    }

    return {
      results: data.results,
      summary: data.summary
    };
  }

  // Run specific optimization
  static async runOptimization(action: string): Promise<{
    results: CostOptimizationResult[];
    summary: OptimizationSummary;
  }> {
    const { data, error } = await supabase.functions.invoke('cost-optimizer', {
      body: { action }
    });

    if (error) {
      throw new Error(`Optimization failed: ${error.message}`);
    }

    return {
      results: data.results,
      summary: data.summary
    };
  }

  // Clear cache manually using Redis
  static async clearCache(pattern?: string) {
    if (pattern) {
      await upstashRedisCache.invalidateByTag(pattern);
    } else {
      // Note: Full cache clear would need to be implemented based on your needs
      console.log('Full cache clear requested - implement based on specific requirements');
    }
  }

  // Get cache statistics from Upstash Redis
  static async getCacheStats() {
    return await upstashRedisCache.getStats();
  }

  // System optimization methods
  static async runSystemOptimization(): Promise<{
    results: CostOptimizationResult[];
    summary: OptimizationSummary;
  }> {
    const { data, error } = await supabase.functions.invoke('system-optimizer', {
      body: { action: 'optimize_all' }
    });

    if (error) {
      throw new Error(`System optimization failed: ${error.message}`);
    }

    return {
      results: data.results,
      summary: data.summary
    };
  }

  // Batch process CVs efficiently
  static async batchProcessCVs(cvIds: string[], batchSize: number = 10) {
    const results = [];
    
    for (let i = 0; i < cvIds.length; i += batchSize) {
      const batch = cvIds.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (cvId) => {
          try {
            // Process CV with caching
            const cacheKey = `cv_processing_${cvId}`;
            return this.getCachedQuery(cacheKey, async () => {
              const { data, error } = await supabase
                .from('cv_files')
                .select('*')
                .eq('id', cvId)
                .single();
              
              if (error) throw error;
              return data;
            });
          } catch (error) {
            console.error(`Failed to process CV ${cvId}:`, error);
            return null;
          }
        })
      );

      results.push(...batchResults.filter(Boolean));
      
      // Small delay between batches to prevent overwhelming the database
      if (i + batchSize < cvIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

// Cache is now managed by Upstash Redis with automatic TTL expiration