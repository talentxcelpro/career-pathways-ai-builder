// SupabaseSearchProvider — ₹0 Scale Search Engine Implementation
// Uses PostgreSQL optimized RPC 'get_jobs_paginated_optimized' with in-memory browser caching.

import { supabase } from '@/integrations/supabase/client';
import type { SearchProvider, SearchParams, SearchResult } from './SearchProvider';

interface CacheEntry {
  result: SearchResult;
  timestamp: number;
}

export class SupabaseSearchProvider implements SearchProvider {
  readonly name = 'supabase';

  // In-memory LRU browser cache (3-minute TTL, max 100 queries)
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Generates a deterministic cache key from search parameters
   */
  private getCacheKey(params: SearchParams): string {
    const normalized = {
      q: (params.query || '').trim().toLowerCase(),
      loc: (params.location || '').trim().toLowerCase(),
      emp: (params.employment_types || []).slice().sort(),
      exp: (params.experience_levels || []).slice().sort(),
      minSal: params.min_salary || 0,
      maxSal: params.max_salary || 0,
      remote: Boolean(params.is_remote),
      skills: (params.skills || []).slice().sort(),
      page: Math.max(1, params.page || 1),
      limit: Math.min(50, Math.max(1, params.limit || 20)),
      sort: params.sortBy || 'created_at'
    };
    return `jobs-search:${JSON.stringify(normalized)}`;
  }

  /**
   * Cleans expired cache entries
   */
  private pruneCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL_MS) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  async searchJobs(params: SearchParams): Promise<SearchResult> {
    const cacheKey = this.getCacheKey(params);
    const now = Date.now();

    // 1. Check Browser In-Memory Cache
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
      // Return cached result with 0ms latency and 0 network requests
      return {
        ...cached.result,
        source: 'cache',
        latencyMs: 0
      };
    }

    // 2. Cache Miss: Execute optimized database RPC
    const startTime = performance.now();
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20)); // Enforce limit: 20 max default

    try {
      const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
        p_page: page,
        p_limit: limit,
        p_search: (params.query || '').trim(),
        p_location: (params.location || '').trim(),
        p_employment_types: params.employment_types || [],
        p_experience_levels: params.experience_levels || [],
        p_min_salary: params.min_salary || 0,
        p_max_salary: params.max_salary || 0,
        p_is_remote: params.is_remote || false,
        p_skills: params.skills || [],
        p_sort_by: params.sortBy || 'created_at'
      });

      if (error) throw error;

      const duration = Math.round(performance.now() - startTime);

      // Filter non-expired valid jobs
      const validJobs = (data?.jobs || []).filter((job: any) => {
        const isNotExpired = !job.expires_at || new Date(job.expires_at) > new Date();
        const hasValidData = job.id && job.title;
        return isNotExpired && hasValidData;
      });

      const result: SearchResult = {
        jobs: validJobs,
        totalCount: data?.total_count || 0,
        hasMore: data?.has_more || false,
        source: 'supabase',
        latencyMs: duration
      };

      // 3. Store in LRU cache
      this.pruneCache();
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        // Evict oldest entry
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) this.cache.delete(oldestKey);
      }
      this.cache.set(cacheKey, { result, timestamp: now });

      return result;
    } catch (err: any) {
      console.warn('SupabaseSearchProvider search failed:', err?.message || err);
      throw err;
    }
  }
}
