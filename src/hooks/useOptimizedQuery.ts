import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface OptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  cacheTime = 10 * 60 * 1000,
  enabled = true,
  priority = 'normal'
}: OptimizedQueryOptions<T>) => {
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    return await queryFn();
  }, [queryFn]);

  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime,
    gcTime: cacheTime,
    enabled,
    refetchOnWindowFocus: priority === 'high',
    retry: priority === 'low' ? 1 : 2,
  });
};