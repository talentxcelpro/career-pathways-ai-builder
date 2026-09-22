// SearchService — The Architectural Scale Switch
// Exposes a unified search API for all UI components.
// Defaults to ₹0 SupabaseSearchProvider today; can switch to TypesenseSearchProvider later with 0 UI changes.
//
// Telemetry:
//   searchService.getStats()
//   → returns in-memory counters (resets on page reload — diagnostic only, not authoritative analytics)
//   → see SearchStats interface in SearchProvider.ts for field definitions

import type { SearchProvider, SearchParams, SearchResult, SearchStats } from './SearchProvider';
import { SupabaseSearchProvider } from './SupabaseSearchProvider';

class SearchService {
  private activeProvider: SearchProvider;
  private providers: Map<string, SearchProvider> = new Map();

  constructor() {
    // Register default ₹0 Supabase provider (with Search Traffic Governor)
    const supabaseProvider = new SupabaseSearchProvider();
    this.registerProvider(supabaseProvider);
    this.activeProvider = supabaseProvider;
  }

  /**
   * Registers a search provider into the service.
   */
  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Switches the active search provider (e.g. 'supabase' → 'typesense' when telemetry demands it).
   * Returns true on success. Does not change provider if name is not found.
   */
  setProvider(providerName: string): boolean {
    const provider = this.providers.get(providerName);
    if (provider) {
      this.activeProvider = provider;
      console.log(`[SearchService] Switched active provider to: ${providerName}`);
      return true;
    }
    console.warn(`[SearchService] Provider "${providerName}" not found. Keeping "${this.activeProvider.name}"`);
    return false;
  }

  /**
   * Returns the name of the currently active search provider.
   */
  getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  /**
   * Primary search entry point used by all UI components.
   * Delegates to the active provider (includes governor, cache, dedup).
   */
  async searchJobs(params: SearchParams): Promise<SearchResult> {
    return this.activeProvider.searchJobs(params);
  }

  /**
   * Clears in-memory search caches on the active provider.
   */
  clearCache(): void {
    if (this.activeProvider.clearCache) {
      this.activeProvider.clearCache();
    }
  }

  /**
   * Returns in-memory telemetry counters for the active provider.
   * Use to monitor: dbCallRate (key protection metric), cacheHitRate, concurrency peaks.
   * Stats reset on page reload by design.
   *
   * Example: copy-paste into browser DevTools console:
   *   import('/src/services/search/SearchService').then(m => console.table(m.searchService.getStats()))
   */
  getStats(): SearchStats {
    if (this.activeProvider.getStats) {
      return this.activeProvider.getStats();
    }
    // Fallback for providers that don't implement telemetry
    return {
      totalSearchCalls: 0, cacheHits: 0, dedupHits: 0,
      dbCalls: 0, governorQueued: 0, governorDropped: 0,
      cacheHitRate: 'N/A', dedupRate: 'N/A', dbCallRate: 'N/A',
      activeNow: 0, maxActiveObserved: 0, estimatedEgressKB: 0
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;
