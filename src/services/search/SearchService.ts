// SearchService — The Architectural Scale Switch
// Exposes a unified search API for all UI components.
// Defaults to ₹0 SupabaseSearchProvider today; can switch to TypesenseSearchProvider later with 0 UI changes.

import type { SearchProvider, SearchParams, SearchResult } from './SearchProvider';
import { SupabaseSearchProvider } from './SupabaseSearchProvider';

class SearchService {
  private activeProvider: SearchProvider;
  private providers: Map<string, SearchProvider> = new Map();

  constructor() {
    // Register default ₹0 Supabase provider
    const supabaseProvider = new SupabaseSearchProvider();
    this.registerProvider(supabaseProvider);
    this.activeProvider = supabaseProvider;
  }

  /**
   * Registers a search provider into the service
   */
  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Switches the active search provider (e.g. 'supabase' -> 'typesense' at Gate 3)
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
   * Returns current active provider name
   */
  getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  /**
   * Primary search execution method used across all UI components
   */
  async searchJobs(params: SearchParams): Promise<SearchResult> {
    return this.activeProvider.searchJobs(params);
  }

  /**
   * Clears in-memory search caches
   */
  clearCache(): void {
    if (this.activeProvider.clearCache) {
      this.activeProvider.clearCache();
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;
