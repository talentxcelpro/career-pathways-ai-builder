import { supabase } from '@/integrations/supabase/client';

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
  private static cache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Smart caching for expensive queries
  static async getCachedQuery<T>(
    key: string, 
    queryFn: () => Promise<T>,
    ttl: number = this.cacheTimeout
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await queryFn();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

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

  // Clear cache manually
  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  static getCacheStats() {
    const keys = Array.from(this.cache.keys());
    const sizes = keys.map(key => {
      const data = this.cache.get(key);
      return JSON.stringify(data).length;
    });

    return {
      entries: this.cache.size,
      totalSizeBytes: sizes.reduce((sum, size) => sum + size, 0),
      keys: keys
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

// Auto-cleanup cache every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of CostOptimizer['cache'].entries()) {
    if (now - value.timestamp > CostOptimizer['cacheTimeout']) {
      CostOptimizer['cache'].delete(key);
    }
  }
}, 10 * 60 * 1000);