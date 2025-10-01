import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback } from 'react';

interface RealtimeOptions {
  table: string;
  select?: string;
  filter?: any;
  queryKey: string[];
  staleTime?: number;
  cacheTime?: number;
}

export const useOptimizedRealtime = <T = any>({
  table,
  select = '*',
  filter,
  queryKey,
  staleTime = 30000, // 30 seconds
  cacheTime = 5 * 60 * 1000 // 5 minutes
}: RealtimeOptions) => {
  const queryClient = useQueryClient();

  // Fetch with optimized caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table).select(select);
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Optimistic realtime updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return old;

      switch (payload.eventType) {
        case 'INSERT':
          return Array.isArray(old) ? [payload.new, ...old] : payload.new;
        
        case 'UPDATE':
          return Array.isArray(old)
            ? old.map((item: any) => item.id === payload.new.id ? payload.new : item)
            : payload.new;
        
        case 'DELETE':
          return Array.isArray(old)
            ? old.filter((item: any) => item.id !== payload.old.id)
            : null;
        
        default:
          return old;
      }
    });
  }, [queryClient, queryKey]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_${queryKey.join('_')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter: Object.entries(filter).map(([key, value]) => `${key}=eq.${value}`).join(',') })
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, handleRealtimeUpdate]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
};

// Batch multiple queries for better performance
export const useBatchedRealtime = (queries: RealtimeOptions[]) => {
  const results = queries.map(query => useOptimizedRealtime(query));
  
  return {
    data: results.map(r => r.data),
    isLoading: results.some(r => r.isLoading),
    errors: results.map(r => r.error),
    refetchAll: () => results.forEach(r => r.refetch())
  };
};

// Prefetch data for instant navigation
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchData = useCallback(async (options: RealtimeOptions) => {
    await queryClient.prefetchQuery({
      queryKey: options.queryKey,
      queryFn: async () => {
        let query = supabase.from(options.table).select(options.select || '*');
        
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
      },
      staleTime: options.staleTime || 30000
    });
  }, [queryClient]);

  return { prefetchData };
};
