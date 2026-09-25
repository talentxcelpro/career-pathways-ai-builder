
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { AISearchService } from '@/services/aiSearchService';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  data: any[];
  isLoading: boolean;
  error: string | null;
  parsedQuery: any;
  suggestions: string[];
}

export const useNaturalLanguageSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [parsedQuery, setParsedQuery] = useState<any>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return [
        'Senior AI Engineers in San Francisco',
        'Staff System Architects in Dubai',
        'Principal Fullstack Engineers in London',
        'Product Leaders with 5+ yrs in Singapore',
        'Cloud & DevOps Specialists in Bengaluru',
        'Founding Engineers Remote Worldwide'
      ];
    }

    const suggestions = [];
    const lowerInput = searchTerm.toLowerCase();

    // Technology-based suggestions
    if (['react', 'angular', 'vue', 'js', 'javascript', 'python', 'rust', 'go', 'ai', 'ml'].some(tech => lowerInput.includes(tech))) {
      suggestions.push('Senior AI Engineers', 'Full-stack Engineers', 'Distributed Systems Architects');
    }

    // Role-based suggestions
    if (['design', 'ui', 'ux', 'product'].some(role => lowerInput.includes(role))) {
      suggestions.push('Lead Product Designers', 'VP of Product', 'Design System Leads');
    }

    // Location-based suggestions
    if (['dubai', 'london', 'san francisco', 'new york', 'singapore', 'berlin', 'bengaluru', 'remote'].some(loc => lowerInput.includes(loc))) {
      suggestions.push('Dubai & UAE Tech Leaders', 'Silicon Valley AI Talent', 'London & European Engineers', 'Global Remote Specialists');
    }

    return suggestions.slice(0, 3);
  }, [searchTerm]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setParsedQuery(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Performing natural language search:', query);
      
      // Use AI search service to parse and search
      const searchResult = await AISearchService.searchPeople(query);
      
      if (searchResult.error) {
        throw new Error(searchResult.error.message || 'Search failed');
      }

      setResults(searchResult.data || []);
      setParsedQuery(searchResult.filters);
      
      console.log('✅ Search completed:', {
        resultsCount: searchResult.data?.length || 0,
        parsedQuery: searchResult.filters
      });

    } catch (err: any) {
      console.error('❌ Search failed:', err);
      setError(err.message || 'Search failed');
      setResults([]);
      setParsedQuery(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform search when debounced term changes
  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
  }, []);

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    results,
    isLoading,
    error,
    parsedQuery,
    suggestions,
    selectSuggestion,
    performSearch
  };
};
