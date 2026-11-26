import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from './useDebounce';
import { universalSearchOrchestrator } from '@/services/search/universal/UniversalSearchOrchestrator';
import type { SearchEntityType } from '@/services/search/universal/types';

export interface SearchResult {
  type: 'post' | 'user' | 'hashtag' | 'job' | 'company' | 'community' | 'article' | 'course';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  url: string;
  relevance: number;
}

interface UseGlobalSearchProps {
  enabled?: boolean;
  debounceMs?: number;
}

function mapEntityType(type: SearchEntityType): SearchResult['type'] {
  switch (type) {
    case 'people':
    case 'connections':
    case 'talent':
      return 'user';
    case 'jobs':
      return 'job';
    case 'companies':
      return 'company';
    case 'communities':
      return 'community';
    case 'articles':
      return 'article';
    case 'courses':
      return 'course';
    default:
      return 'post';
  }
}

export const useGlobalSearch = ({
  enabled = true,
  debounceMs = 250,
}: UseGlobalSearchProps = {}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const searchQuery = useQuery({
    queryKey: ['globalSearch', debouncedSearchTerm, user?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
        return [];
      }

      const response = await universalSearchOrchestrator.search(debouncedSearchTerm, {
        limitPerScope: 4,
        userContext: {
          userId: user?.id || null,
        },
      });

      return response.topResults.map((item) => ({
        type: mapEntityType(item.type),
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        avatar: item.avatarUrl || undefined,
        url: item.url,
        relevance: item.score,
      }));
    },
    enabled: enabled && debouncedSearchTerm.trim().length >= 2,
    staleTime: 30_000,
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    handleSearch,
    clearSearch,
    results: searchQuery.data || [],
    isLoading: searchQuery.isFetching,
    error: searchQuery.error,
  };
};
