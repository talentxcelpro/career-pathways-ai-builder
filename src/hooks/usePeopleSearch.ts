
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
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const hasSearch = debouncedSearchTerm.trim().length > 0;

  // Get all people when no search is active
  const { data: allPeopleData, isLoading: allPeopleLoading, error: allPeopleError } = useQuery({
    queryKey: ['all-people', currentPage],
    queryFn: () => AISearchService.getAllPeople(currentPage, itemsPerPage),
    enabled: !hasSearch,
  });

  // Search people when search term is provided
  const { data: searchData, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['search-people', debouncedSearchTerm, currentPage],
    queryFn: async () => {
      try {
        // Try AI search first
        const aiResult = await AISearchService.searchPeople(debouncedSearchTerm, currentPage, itemsPerPage);
        if (aiResult.data && aiResult.data.length > 0) {
          return aiResult;
        }
        
        // Fallback to basic search
        const basicResult = await AISearchService.searchPeopleBasic(debouncedSearchTerm, currentPage, itemsPerPage);
        return basicResult;
      } catch (error) {
        console.error('Search failed:', error);
        // Final fallback to basic search
        const basicResult = await AISearchService.searchPeopleBasic(debouncedSearchTerm, currentPage, itemsPerPage);
        return basicResult;
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
