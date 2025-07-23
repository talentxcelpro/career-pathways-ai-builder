
import { useState, useCallback, useMemo } from 'react';
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
        'React developers in Mumbai',
        'Senior UI/UX designers',
        'Product managers with 3+ years experience',
        'Marketing professionals in Bangalore',
        'Data scientists with Python skills',
        'Frontend developers remote'
      ];
    }

    const suggestions = [];
    const lowerInput = searchTerm.toLowerCase();

    // Technology-based suggestions
    if (['react', 'angular', 'vue', 'js', 'javascript'].some(tech => lowerInput.includes(tech))) {
      suggestions.push('Frontend developers', 'Full-stack engineers', 'React Native developers');
    }

    // Role-based suggestions
    if (['design', 'ui', 'ux'].some(role => lowerInput.includes(role))) {
      suggestions.push('UI/UX designers', 'Product designers', 'Graphic designers');
    }

    // Location-based suggestions
    if (['bangalore', 'mumbai', 'delhi', 'remote'].some(loc => lowerInput.includes(loc))) {
      suggestions.push('Remote workers', 'Bangalore tech professionals', 'Mumbai finance experts');
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
  React.useEffect(() => {
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
