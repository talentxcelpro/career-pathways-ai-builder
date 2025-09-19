import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

interface OptimizedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  enabled?: boolean;
  select?: (data: T) => any;
  placeholderData?: T;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus = false,
  refetchInterval,
  enabled = true,
  select,
  placeholderData
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  // Memoize query function to prevent unnecessary re-renders
  const memoizedQueryFn = useCallback(queryFn, []);

  // Memoize select function if provided
  const memoizedSelect = useMemo(() => select, [select]);

  const query = useQuery({
    queryKey,
    queryFn: memoizedQueryFn,
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus,
    refetchInterval,
    enabled,
    select: memoizedSelect,
    placeholderData: placeholderData as any,
    // Aggressive optimizations
    networkMode: 'online',
    retry: 1,
    retryDelay: 1000,
  });

  // Prefetch related data
  const prefetchRelated = useCallback((relatedQueryKey: QueryKey, relatedQueryFn: () => Promise<any>) => {
    queryClient.prefetchQuery({
      queryKey: relatedQueryKey,
      queryFn: relatedQueryFn,
      staleTime: staleTime,
    });
  }, [queryClient, staleTime, cacheTime]);

  // Invalidate and refetch
  const invalidateAndRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    ...query,
    prefetchRelated,
    invalidateAndRefetch,
  };
}