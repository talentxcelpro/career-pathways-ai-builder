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
  const queryClient = useQueryClient();
  const [isEnhancementLoaded, setIsEnhancementLoaded] = useState(false);

  // Step 1: Load critical job data only (minimal fields for fast rendering)
  const criticalQuery = useQuery({
    queryKey: ['jobs-critical', filters, sortBy],
    queryFn: async () => {
      console.log('🚀 Loading critical job data...');
      
      const { data, error } = await supabase
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
        .eq('job_status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
        .limit(20); // Load only first page

      if (error) throw error;
      
      console.log('✅ Critical job data loaded:', data?.length);
      return data || [];
    },
    staleTime: 120000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Step 2: Load enhanced data progressively (after critical path)
  const enhancedQuery = useQuery({
    queryKey: ['jobs-enhanced', filters, sortBy],
    queryFn: async () => {
      console.log('🔄 Loading enhanced job data...');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            industry,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
        .limit(20);

      if (error) throw error;
      
      console.log('✅ Enhanced job data loaded:', data?.length);
      setIsEnhancementLoaded(true);
      return data || [];
    },
    enabled: criticalQuery.isSuccess && !criticalQuery.isLoading,
    staleTime: 180000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Step 3: Prefetch next batch in background
  useEffect(() => {
    if (enhancedQuery.isSuccess && !enhancedQuery.isFetching) {
      // Prefetch page 2 after a delay
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['jobs-critical-page-2', filters, sortBy],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('jobs')
              .select('id, title, company_name, location, salary_min, salary_max, posted_at, is_featured, employment_type')
              .eq('is_active', true)
              .eq('job_status', 'open')
              .gt('expires_at', new Date().toISOString())
              .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
              .range(20, 39); // Next 20 items

            if (error) throw error;
            return data || [];
          },
          staleTime: 300000, // 5 minutes
        });
      }, 2000); // 2 second delay to not block initial render
    }
  }, [enhancedQuery.isSuccess, enhancedQuery.isFetching, queryClient, filters, sortBy]);

  // Return critical data first, then enhanced when available
  const jobs = enhancedQuery.data || criticalQuery.data || [];
  const isLoading = criticalQuery.isLoading;
  const isEnhancing = enhancedQuery.isFetching;

  return {
    jobs,
    isLoading,
    isEnhancing,
    isEnhancementLoaded,
    totalCount: jobs.length, // Simplified for critical path
    hasMore: jobs.length >= 20,
    refetch: () => {
      criticalQuery.refetch();
      enhancedQuery.refetch();
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