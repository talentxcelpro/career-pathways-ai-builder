import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export interface ProfileVisitor {
  visitor_id: string;
  full_name: string;
  headline: string | null;
  company: string | null;
  location: string | null;
  profile_picture_url: string | null;
  profile_slug: string;
  is_online: boolean;
  last_seen: string | null;
  last_heartbeat_at: string | null;
  presence_visibility: 'everyone' | 'connections_only' | 'nobody' | string;
  first_visited_at: string;
  last_visited_at: string;
  visit_count: number;
  last_view_source: string | null;
}

export interface ProfileVisitorsData {
  total_views: number;
  unique_visitors: number;
  anonymous_views: number;
  visitors: ProfileVisitor[];
  has_more: boolean;
}

const PAGE_SIZE = 15;

export function useProfileVisitors(enabled: boolean = true) {
  const { user } = useOptimizedAuth();
  const [accumulatedVisitors, setAccumulatedVisitors] = useState<ProfileVisitor[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const query = useQuery({
    queryKey: ['profile-visitors', user?.id, page],
    queryFn: async (): Promise<ProfileVisitorsData> => {
      if (!user?.id) {
        return {
          total_views: 0,
          unique_visitors: 0,
          anonymous_views: 0,
          visitors: [],
          has_more: false
        };
      }

      const { data, error } = await supabase.rpc('get_profile_visitors', {
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE
      });

      if (error) {
        throw error;
      }

      const parsedData = (data as unknown) as ProfileVisitorsData;
      const safeVisitors: ProfileVisitor[] = Array.isArray(parsedData?.visitors)
        ? parsedData.visitors
        : [];

      setAccumulatedVisitors(prev => {
        if (page === 0) return safeVisitors;
        // Merge without duplicates by visitor_id
        const existingIds = new Set(prev.map(v => v.visitor_id));
        const newUnique = safeVisitors.filter(v => !existingIds.has(v.visitor_id));
        return [...prev, ...newUnique];
      });

      setHasMore(Boolean(parsedData?.has_more));

      return {
        total_views: Number(parsedData?.total_views || 0),
        unique_visitors: Number(parsedData?.unique_visitors || 0),
        anonymous_views: Number(parsedData?.anonymous_views || 0),
        visitors: safeVisitors,
        has_more: Boolean(parsedData?.has_more)
      };
    },
    enabled: Boolean(enabled && user?.id),
    staleTime: 60 * 1000,
  });

  const loadMore = useCallback(() => {
    if (!query.isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [query.isFetching, hasMore]);

  const reset = useCallback(() => {
    setPage(0);
    setAccumulatedVisitors([]);
    query.refetch();
  }, [query]);

  return {
    ...query,
    visitors: accumulatedVisitors.length > 0 ? accumulatedVisitors : (query.data?.visitors || []),
    totalViews: query.data?.total_views ?? 0,
    uniqueVisitors: query.data?.unique_visitors ?? 0,
    anonymousViews: query.data?.anonymous_views ?? 0,
    hasMore,
    loadMore,
    reset
  };
}
