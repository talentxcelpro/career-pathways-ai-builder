
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AISearchService } from '@/services/aiSearchService';
import { useDebounce } from './useDebounce';

export const usePeopleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 150);
  const hasSearch = debouncedSearchTerm.trim().length > 0;

  // Get all people when no search is active
  const { data: allPeopleData, isLoading: allPeopleLoading, error: allPeopleError } = useQuery({
    queryKey: ['all-people', currentPage],
    queryFn: () => AISearchService.getAllPeople(currentPage, itemsPerPage),
    enabled: !hasSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Search people when search term is provided  
  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['search-people', debouncedSearchTerm, currentPage],
    queryFn: async () => {
      try {
        // Always use basic search first for better performance
        const basicResult = await AISearchService.searchPeopleBasic(debouncedSearchTerm, currentPage, itemsPerPage);
        return basicResult;
      } catch (error) {
        console.error('Search failed:', error);
        // Return empty result on error
        return { data: [], error, count: 0, page: currentPage, limit: itemsPerPage };
      }
    },
    enabled: hasSearch && debouncedSearchTerm.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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

  const currentData = hasSearch ? searchData : allPeopleData;
  const results = currentData?.data ? filteredResults(currentData.data) : [];
  const isLoading = hasSearch ? searchLoading : allPeopleLoading;
  const error = hasSearch ? searchError : allPeopleError;
  const totalCount = currentData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    setSearchTerm: handleSearchChange,
    locationFilter,
    setLocationFilter,
    industryFilter,
    setIndustryFilter,
    results,
    isLoading,
    error,
    hasSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    itemsPerPage
  };
};
