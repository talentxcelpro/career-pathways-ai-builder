import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface JobFilters {
  search: string;
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  skills: string[];
}

interface OptimizedJobsResult {
  jobs: any[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  refetch: () => void;
  prefetchNext: () => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

export const useJobsOptimized = (
  filters: JobFilters, 
  sortBy: string = 'created_at',
  mode: 'pagination' | 'infinite' = 'pagination'
): OptimizedJobsResult => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15; // Reduced for faster loading
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();

  // For infinite scroll mode
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['jobs-infinite', filters, sortBy],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      console.log('🚀 Fetching optimized jobs page:', pageParam);
      
      const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
        p_page: pageParam,
        p_limit: pageSize,
        p_search: filters.search || '',
        p_location: filters.location || '',
        p_employment_types: filters.employment_type,
        p_experience_levels: filters.experience_level,
        p_min_salary: filters.salary_min || 0,
        p_max_salary: filters.salary_max || 0,
        p_is_remote: filters.is_remote || false,
        p_skills: filters.skills,
        p_sort_by: sortBy
      });

      if (error) {
        console.error('❌ RPC error:', error);
        throw error;
      }

      console.log('✅ RPC result:', data);
      
      // The RPC function returns a JSONB object directly, not an array
      const result = data as any;
      
      return {
        jobs: Array.isArray(result?.jobs) ? result.jobs : [],
        totalCount: result?.total_count || 0,
        hasMore: result?.has_more || false,
        page: pageParam
      };
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    enabled: mode === 'infinite',
    staleTime: 60000, // 1 minute for better performance
    gcTime: 180000, // 3 minutes to reduce memory usage
  });

  // For pagination mode
  const paginationQuery = useQuery({
    queryKey: ['jobs-paginated-optimized', filters, sortBy, currentPage],
    queryFn: async () => {
      console.log('🚀 Fetching optimized jobs page:', currentPage);
      
      const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
        p_page: currentPage,
        p_limit: pageSize,
        p_search: filters.search || '',
        p_location: filters.location || '',
        p_employment_types: filters.employment_type,
        p_experience_levels: filters.experience_level,
        p_min_salary: filters.salary_min || 0,
        p_max_salary: filters.salary_max || 0,
        p_is_remote: filters.is_remote || false,
        p_skills: filters.skills,
        p_sort_by: sortBy
      });

      if (error) {
        console.error('❌ RPC error:', error);
        throw error;
      }

      console.log('✅ RPC result:', data);
      
      // The RPC function returns a JSONB object directly, not an array
      const result = data as any;
      
      return {
        jobs: Array.isArray(result?.jobs) ? result.jobs : [],
        totalCount: result?.total_count || 0,
        hasMore: result?.has_more || false
      };
    },
    enabled: mode === 'pagination',
    staleTime: 90000, // 1.5 minutes for better caching
    gcTime: 300000, // 5 minutes
  });

  // Prefetch next page
  const prefetchNext = useCallback(() => {
    if (mode === 'pagination' && paginationQuery.data?.hasMore) {
      // Clear existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Prefetch after a short delay
      prefetchTimeoutRef.current = setTimeout(() => {
        supabase.rpc('get_jobs_paginated_optimized', {
          p_page: currentPage + 1,
          p_limit: pageSize,
          p_search: filters.search || '',
          p_location: filters.location || '',
          p_employment_types: filters.employment_type,
          p_experience_levels: filters.experience_level,
          p_min_salary: filters.salary_min || 0,
          p_max_salary: filters.salary_max || 0,
          p_is_remote: filters.is_remote || false,
          p_skills: filters.skills,
          p_sort_by: sortBy
        }).then(({ data }) => {
          console.log('✅ Prefetched next page');
        });
      }, 1000);
    }
  }, [mode, currentPage, filters, sortBy, paginationQuery.data?.hasMore]);

  // Auto-prefetch on successful load
  useEffect(() => {
    if (paginationQuery.isSuccess && !paginationQuery.isFetching) {
      prefetchNext();
    }
  }, [paginationQuery.isSuccess, paginationQuery.isFetching, prefetchNext]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Navigate to specific page
  const goToPage = useCallback((page: number) => {
    if (mode === 'pagination') {
      setCurrentPage(page);
    }
  }, [mode]);

  // Load more for infinite scroll
  const loadMore = useCallback(() => {
    if (mode === 'infinite' && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      infiniteQuery.fetchNextPage();
    }
  }, [mode, infiniteQuery]);

  // Determine which query to use
  const activeQuery = mode === 'infinite' ? infiniteQuery : paginationQuery;
  
  // Process jobs data
  const jobs = mode === 'infinite' 
    ? infiniteQuery.data?.pages.flatMap(page => page.jobs) || []
    : paginationQuery.data?.jobs || [];

  const totalCount = mode === 'infinite'
    ? infiniteQuery.data?.pages[0]?.totalCount || 0
    : paginationQuery.data?.totalCount || 0;

  const hasMore = mode === 'infinite'
    ? infiniteQuery.hasNextPage || false
    : paginationQuery.data?.hasMore || false;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    jobs,
    totalCount,
    hasMore,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: mode === 'infinite' ? infiniteQuery.isFetchingNextPage : false,
    loadMore,
    refetch: activeQuery.refetch,
    prefetchNext,
    currentPage,
    totalPages,
    goToPage
  };
};

// Hook for job categories
export const useJobCategories = () => {
  return useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_job_categories_with_counts');
      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
};

// Hook for trending locations
export const useTrendingLocations = () => {
  return useQuery({
    queryKey: ['trending-locations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_job_locations');
      if (error) throw error;
      return data || [];
    },
    staleTime: 3600000, // 1 hour
    gcTime: 7200000, // 2 hours
  });
};