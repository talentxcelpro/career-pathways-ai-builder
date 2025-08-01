import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export const useJobsWithPagination = (filters: JobFilters, sortBy: string = 'created_at') => {
  console.log('🚀 useJobsWithPagination hook called with:', { filters, sortBy });
  
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const pageSize = 50;

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ['jobs-paginated', filters, sortBy, page],
    queryFn: async () => {
      console.log('🔍 useJobsWithPagination: Starting query for page', page);
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      try {
        // Step 1: Get total count without joins to avoid issues
        let countQuery = supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gte('expires_at', new Date().toISOString()); // Filter out expired jobs

        // Apply location filter for count
        if (filters.location === 'India') {
          countQuery = countQuery.ilike('location', '%india%');
        } else if (filters.location === 'International') {
          countQuery = countQuery.not('location', 'ilike', '%india%');
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          console.error('❌ Count query error:', countError);
          throw countError;
        }

        console.log('📊 Total jobs in database:', totalCount);

        // Step 2: Get paginated data with joins
        let dataQuery = supabase
          .from('jobs')
          .select(`
            *,
            companies (
              id,
              name,
              logo_url,
              industry,
              is_verified
            )
          `)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gte('expires_at', new Date().toISOString()) // Filter out expired jobs
          .order('created_at', { ascending: false })
          .range(start, end);

        // Apply location filter for data
        if (filters.location === 'India') {
          dataQuery = dataQuery.ilike('location', '%india%');
        } else if (filters.location === 'International') {
          dataQuery = dataQuery.not('location', 'ilike', '%india%');
        }

        // Apply other filters
        if (filters.search) {
          dataQuery = dataQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
        }

        if (filters.employment_type.length > 0) {
          dataQuery = dataQuery.in('employment_type', filters.employment_type);
        }

        if (filters.experience_level.length > 0) {
          dataQuery = dataQuery.in('experience_level', filters.experience_level);
        }

        if (filters.is_remote) {
          dataQuery = dataQuery.eq('is_remote', true);
        }

        const { data: jobs, error: dataError } = await dataQuery;

        if (dataError) {
          console.error('❌ Data query error:', dataError);
          throw dataError;
        }

        console.log('✅ Jobs fetched successfully:', {
          jobsCount: jobs?.length || 0,
          totalCount,
          page,
          start,
          end,
          hasMore: (totalCount || 0) > page * pageSize
        });

        return {
          jobs: jobs || [],
          totalCount: totalCount || 0,
          hasMore: (totalCount || 0) > page * pageSize
        };

      } catch (err) {
        console.error('💥 useJobsWithPagination error:', err);
        throw err;
      }
    },
    enabled: true
  });

  // Log any query errors
  React.useEffect(() => {
    if (error) {
      console.error('React Query error in useJobsWithPagination:', error);
    }
  }, [error]);

  // Update accumulated jobs when new data arrives - use replace for pagination
  React.useEffect(() => {
    if (data?.jobs) {
      setAllJobs(data.jobs); // Replace instead of accumulate for traditional pagination
    }
  }, [data]);

  // Reset when filters change
  React.useEffect(() => {
    setPage(1);
    setAllJobs([]);
  }, [filters, sortBy]);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil((data?.totalCount || 0) / pageSize)) {
      setPage(newPage);
    }
  };

  const loadMore = () => {
    if (data?.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const featuredJobs = allJobs.filter(job => job.is_featured);
  const regularJobs = allJobs.filter(job => !job.is_featured);

  return {
    jobs: allJobs,
    featuredJobs,
    regularJobs,
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    loadMore,
    refetch,
    currentPage: page,
    totalPages: Math.ceil((data?.totalCount || 0) / pageSize),
    goToPage,
    pageSize
  };
};