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
  source: 'cache' | 'supabase' | 'typesense';
  latencyMs?: number;
}

export interface SearchProvider {
  readonly name: string;
  searchJobs(params: SearchParams): Promise<SearchResult>;
  clearCache?(): void;
}
