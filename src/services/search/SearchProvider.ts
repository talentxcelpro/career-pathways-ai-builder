// Production Search Provider Interface — The Scale Switch Architecture
// Allows ₹0 SupabaseSearchProvider today, and TypesenseSearchProvider later with 0 UI changes.

export interface SearchParams {
  query?: string;
  location?: string;
  employment_types?: string[];
  experience_levels?: string[];
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface SearchResult {
  jobs: any[];
  totalCount: number;
  hasMore: boolean;
  // 'dedup' = served from in-flight deduplication (0 extra DB calls)
  source: 'cache' | 'dedup' | 'supabase' | 'typesense';
  latencyMs?: number;
  // true if result is stale (governor timed out, returned cached data from a prior call)
  stale?: boolean;
}

/**
 * In-memory telemetry counters for the search layer.
 * Reset on page reload by design — these are diagnostic, not authoritative analytics.
 * Inspect via: searchService.getStats()
 */
export interface SearchStats {
  // Raw call counts
  totalSearchCalls: number;   // all calls to searchJobs()
  cacheHits: number;          // served from LRU cache (fresh)
  dedupHits: number;          // served from in-flight dedup promise
  dbCalls: number;            // reached Supabase RPC
  governorQueued: number;     // queued by concurrency governor
  governorDropped: number;    // timed out in queue, fell back to stale/error

  // Derived rates (as percentages, rounded to 1dp)
  cacheHitRate: string;       // cacheHits / totalSearchCalls
  dedupRate: string;          // dedupHits / totalSearchCalls
  dbCallRate: string;         // dbCalls / totalSearchCalls — key protection metric

  // Concurrency observations
  activeNow: number;          // current active Supabase RPC calls
  maxActiveObserved: number;  // peak observed simultaneous DB calls

  // Egress estimate (uncompressed: ~26.3 KB/call, compressed: ~3.01 KB/call)
  estimatedEgressKB: number;  // dbCalls * 3.01 (compressed 20-job response)
}

export interface SearchProvider {
  readonly name: string;
  searchJobs(params: SearchParams): Promise<SearchResult>;
  clearCache?(): void;
  getStats?(): SearchStats;
}
