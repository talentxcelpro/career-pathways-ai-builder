
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AISearchService } from '@/services/aiSearchService';
import { useDebounce } from './useDebounce';

export const usePeopleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const hasSearch = debouncedSearchTerm.trim().length > 0;

  // Get all people when no search is active
  const { data: allPeople, isLoading: allPeopleLoading, error: allPeopleError } = useQuery({
    queryKey: ['all-people'],
    queryFn: () => AISearchService.getAllPeople(),
    enabled: !hasSearch,
    select: (data) => data.data || []
  });

  // Search people when search term is provided
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['search-people', debouncedSearchTerm],
    queryFn: async () => {
      try {
        // Try AI search first
        const aiResult = await AISearchService.searchPeople(debouncedSearchTerm);
        if (aiResult.data && aiResult.data.length > 0) {
          return aiResult.data;
        }
        
        // Fallback to basic search
        const basicResult = await AISearchService.searchPeopleBasic(debouncedSearchTerm);
        return basicResult.data || [];
      } catch (error) {
        console.error('Search failed:', error);
        // Final fallback to basic search
        const basicResult = await AISearchService.searchPeopleBasic(debouncedSearchTerm);
        return basicResult.data || [];
      }
    },
    enabled: hasSearch,
  });

  // Apply additional filters
  const filteredResults = useCallback((people: any[]) => {
    let filtered = people;

    if (locationFilter !== 'all') {
      filtered = filtered.filter(person => person.location === locationFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(person => person.industry === industryFilter);
    }

    return filtered;
  }, [locationFilter, industryFilter]);

  const results = hasSearch ? searchResults : allPeople;
  const isLoading = hasSearch ? searchLoading : allPeopleLoading;
  const error = hasSearch ? searchError : allPeopleError;

  return {
    searchTerm,
    setSearchTerm,
    locationFilter,
    setLocationFilter,
    industryFilter,
    setIndustryFilter,
    results: results ? filteredResults(results) : [],
    isLoading,
    error,
    hasSearch
  };
};
