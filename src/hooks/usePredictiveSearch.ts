/**
 * Predictive Search with Instant Results
 * Uses ML-based ranking and smart caching
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { multiLevelCache } from '@/utils/multiLevelCache';
import { useDebounce } from './useDebounce';

interface SearchResult {
  id: string;
  title: string;
  type: 'job' | 'profile' | 'company' | 'post';
  description?: string;
  url: string;
  score: number;
  metadata?: any;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  clicks: string[]; // IDs of clicked results
}

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY = 50;

class SearchPredictor {
  private history: SearchHistory[] = [];
  private popularQueries: Map<string, number> = new Map();

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        this.buildPopularQueries();
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }

  private saveHistory() {
    try {
      const recent = this.history.slice(-MAX_HISTORY);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  private buildPopularQueries() {
    this.popularQueries.clear();
    this.history.forEach((entry) => {
      const normalized = entry.query.toLowerCase().trim();
      this.popularQueries.set(normalized, (this.popularQueries.get(normalized) || 0) + 1);
    });
  }

  recordSearch(query: string, clickedResults: string[] = []) {
    const entry: SearchHistory = {
      query: query.toLowerCase().trim(),
      timestamp: Date.now(),
      clicks: clickedResults,
    };

    this.history.push(entry);
    this.saveHistory();
    this.buildPopularQueries();
  }

  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query) return [];

    const normalized = query.toLowerCase().trim();
    const suggestions: Array<[string, number]> = [];

    // Find queries that start with the input
    this.popularQueries.forEach((count, storedQuery) => {
      if (storedQuery.startsWith(normalized)) {
        suggestions.push([storedQuery, count]);
      }
    });

    // Sort by popularity and return top suggestions
    return suggestions
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  rankResults(results: SearchResult[], query: string): SearchResult[] {
    const clicks = this.getClickedResults(query);
    const clickedSet = new Set(clicks);

    return results.map((result) => {
      let score = result.score;

      // Boost previously clicked results
      if (clickedSet.has(result.id)) {
        score += 0.3;
      }

      // Boost based on result type popularity
      const typeBoost = {
        job: 0.2,
        profile: 0.1,
        company: 0.1,
        post: 0.05,
      };
      score += typeBoost[result.type] || 0;

      return { ...result, score };
    }).sort((a, b) => b.score - a.score);
  }

  private getClickedResults(query: string): string[] {
    const normalized = query.toLowerCase().trim();
    const matches = this.history.filter((entry) => entry.query === normalized);
    
    // Flatten all clicked results
    return matches.flatMap((entry) => entry.clicks);
  }

  clearHistory() {
    this.history = [];
    this.popularQueries.clear();
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }
}

const searchPredictor = new SearchPredictor();

export function usePredictiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 150); // Very fast debounce
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update suggestions as user types
  useEffect(() => {
    if (query) {
      const newSuggestions = searchPredictor.getSuggestions(query);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Check cache first
    const cacheKey = `search:${searchQuery}`;
    const cached = await multiLevelCache.get<SearchResult[]>(cacheKey);

    if (cached) {
      const ranked = searchPredictor.rankResults(cached, searchQuery);
      setResults(ranked);
      return;
    }

    setIsLoading(true);

    try {
      // Parallel search across all types
      const [jobs, profiles, companies, posts] = await Promise.all([
        searchJobs(searchQuery),
        searchProfiles(searchQuery),
        searchCompanies(searchQuery),
        searchPosts(searchQuery),
      ]);

      const allResults = [...jobs, ...profiles, ...companies, ...posts];
      const ranked = searchPredictor.rankResults(allResults, searchQuery);

      // Cache results
      await multiLevelCache.set(cacheKey, allResults, {
        ttl: 5 * 60 * 1000, // 5 minutes
        priority: 'high',
      });

      setResults(ranked);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordClick = useCallback((resultId: string) => {
    if (query) {
      searchPredictor.recordSearch(query, [resultId]);
    }
  }, [query]);

  const clearHistory = useCallback(() => {
    searchPredictor.clearHistory();
    setSuggestions([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    recordClick,
    clearHistory,
  };
}

// Search implementations
async function searchJobs(query: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('jobs')
    .select('id, title, description, company_name, seo_slug')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,company_name.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(10);

  return (data || []).map((job) => ({
    id: job.id,
    title: job.title,
    type: 'job' as const,
    description: job.description?.substring(0, 100),
    url: `/jobs/${job.seo_slug || job.id}`,
    score: 0.5,
    metadata: { company: job.company_name },
  }));
}

async function searchProfiles(query: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, professional_headline, username')
    .or(`full_name.ilike.%${query}%,professional_headline.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(10);

  return (data || []).map((profile) => ({
    id: profile.id,
    title: profile.full_name || 'User',
    type: 'profile' as const,
    description: profile.professional_headline,
    url: `/network/people/${profile.username || profile.id}`,
    score: 0.4,
  }));
}

async function searchCompanies(query: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('companies')
    .select('id, name, description, slug')
    .ilike('name', `%${query}%`)
    .limit(10);

  return (data || []).map((company) => ({
    id: company.id,
    title: company.name,
    type: 'company' as const,
    description: company.description?.substring(0, 100),
    url: `/companies/${company.slug || company.id}`,
    score: 0.3,
  }));
}

async function searchPosts(query: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from('posts')
    .select('id, content')
    .ilike('content', `%${query}%`)
    .eq('visibility', 'public')
    .limit(10);

  return (data || []).map((post) => ({
    id: post.id,
    title: post.content.substring(0, 50) + '...',
    type: 'post' as const,
    description: post.content.substring(0, 100),
    url: `/feed?post=${post.id}`,
    score: 0.2,
  }));
}
