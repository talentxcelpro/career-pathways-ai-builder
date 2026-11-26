import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from './useDebounce';
import { universalSearchOrchestrator } from '@/services/search/universal/UniversalSearchOrchestrator';
import { searchAnalytics } from '@/services/search/universal/SearchAnalytics';
import type {
  SearchEntityType,
  SearchSortBy,
  SearchUserContext,
  UniversalSearchResponse,
} from '@/services/search/universal/types';

export interface UseUniversalSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
  initialScopes?: SearchEntityType[];
  limitPerScope?: number;
  includePrivateMessages?: boolean;
}

export function useUniversalSearch(options: UseUniversalSearchOptions = {}) {
  const {
    enabled = true,
    debounceMs = 250,
    initialScopes,
    limitPerScope = 6,
    includePrivateMessages = false,
  } = options;

  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchEntityType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SearchSortBy>('relevance');

  const debouncedQuery = useDebounce(query, debounceMs);

  const userContext: SearchUserContext = useMemo(() => {
    const role =
      (user?.user_metadata as Record<string, any>)?.role ||
      (user?.user_metadata as Record<string, any>)?.user_type ||
      null;
    const isEmployer = role === 'employer' || role === 'recruiter';
    return {
      userId: user?.id || null,
      userRole: role,
      isEmployer,
      isRecruiter: role === 'recruiter' || isEmployer,
      isAdmin: role === 'admin',
    };
  }, [user]);

  const scopes = useMemo(() => {
    if (activeCategory !== 'all') return [activeCategory];
    return initialScopes;
  }, [activeCategory, initialScopes]);

  const searchQuery = useQuery<UniversalSearchResponse>({
    queryKey: ['universal-search', debouncedQuery, activeCategory, sortBy, userContext.userId, includePrivateMessages],
    queryFn: () =>
      universalSearchOrchestrator.search(debouncedQuery, {
        scopes,
        limitPerScope,
        sortBy,
        userContext,
        includePrivateMessages,
      }),
    enabled: enabled && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const suggestions = useMemo(() => {
    return universalSearchOrchestrator.getSuggestions(query);
  }, [query]);

  const recentSearches = useMemo(() => {
    return searchAnalytics.getRecentSearches();
  }, [searchQuery.data]);

  const recordClick = useCallback((type: SearchEntityType, id: string) => {
    searchAnalytics.recordResultClick(type, id);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveCategory('all');
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setActiveCategory('all');
    }
  }, [query]);

  return {
    query,
    setQuery,
    debouncedQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    response: searchQuery.data,
    isLoading: searchQuery.isFetching,
    error: searchQuery.error,
    suggestions,
    recentSearches,
    recordClick,
    clearSearch,
  };
}
