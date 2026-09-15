/**
 * Critical path optimization hook for jobs page
 * Focuses on loading essential data first, then progressive enhancement
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface CriticalJobData {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  posted_at: string;
  is_featured: boolean;
  employment_type: string;
}

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
export const useJobsCriticalPath = (filters: JobFilters, sortBy: string = 'created_at') => {
  const [page, setPage] = useState(0);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  // Step 1: Load critical job data only (minimal fields for fast rendering)
  const criticalQuery = useQuery({
    queryKey: ['jobs-critical', filters, sortBy, page],
    queryFn: async () => {
      console.log('🚀 Loading critical job data with filters:', filters, 'page:', page);
      
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          salary_min,
          salary_max,
          posted_at,
          is_featured,
          employment_type,
          is_remote
        `)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      // Apply filters server-side
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.is_remote) query = query.eq('is_remote', true);
      if (filters.employment_type?.length > 0) query = query.in('employment_type', filters.employment_type);
      if (filters.experience_level?.length > 0) query = query.in('experience_level', filters.experience_level);
      if (filters.salary_min > 0) query = query.gte('salary_min', filters.salary_min);
      if (filters.salary_max > 0) query = query.lte('salary_max', filters.salary_max);

      const { data, error } = await query
        .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
        .range(page * 20, (page + 1) * 20 - 1);

      if (error) throw error;
      return data || [];
    },
    staleTime: 120000,
  });

  // Accumulate jobs when new data arrives
  useEffect(() => {
    if (criticalQuery.data) {
      if (page === 0) {
        setAllJobs(criticalQuery.data);
      } else {
        setAllJobs(prev => {
          const newJobs = criticalQuery.data || [];
          const existingIds = new Set(prev.map(j => j.id));
          return [...prev, ...newJobs.filter(j => !existingIds.has(j.id))];
        });
      }
    }
  }, [criticalQuery.data, page]);

  // Reset when filters or sortBy change
  useEffect(() => {
    setPage(0);
    setAllJobs([]);
  }, [filters, sortBy]);

  const isLoading = criticalQuery.isLoading && page === 0;
  const isFetchingMore = criticalQuery.isFetching && page > 0;

  return {
    jobs: allJobs,
    isLoading,
    isFetchingMore,
    isEnhancementLoaded: true, // Simplified
    totalCount: allJobs.length,
    hasMore: (criticalQuery.data?.length || 0) >= 20,
    loadMore: () => {
      if (!criticalQuery.isFetching && (criticalQuery.data?.length || 0) >= 20) {
        setPage(prev => prev + 1);
      }
    },
    refetch: () => {
      setPage(0);
      criticalQuery.refetch();
    }
  };
};

// Hook for preloading job metadata
export const useJobsMetadataPreload = () => {
  useQuery({
    queryKey: ['jobs-metadata-counts'],
    queryFn: async () => {
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      const { count: featuredJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open')
        .eq('is_featured', true);

      return { totalJobs: totalJobs || 0, featuredJobs: featuredJobs || 0 };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};