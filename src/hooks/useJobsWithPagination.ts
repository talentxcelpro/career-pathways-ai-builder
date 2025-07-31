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
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const pageSize = 50;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['jobs-paginated', filters, sortBy, page],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // First get the total count with all filters applied
      let countQuery = supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      // Apply same filters for count
      if (filters.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        countQuery = countQuery.ilike('location', `%${filters.location}%`);
      }

      if (filters.employment_type.length > 0) {
        countQuery = countQuery.in('employment_type', filters.employment_type);
      }

      if (filters.experience_level.length > 0) {
        countQuery = countQuery.in('experience_level', filters.experience_level);
      }

      if (filters.is_remote) {
        countQuery = countQuery.eq('is_remote', true);
      }

      if (filters.salary_min > 0) {
        countQuery = countQuery.gte('salary_min', filters.salary_min);
      }

      if (filters.salary_max > 0) {
        countQuery = countQuery.lte('salary_max', filters.salary_max);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Error fetching count:', countError);
        throw countError;
      }

      // Now get the actual data for this page
      let dataQuery = supabase
        .from('jobs')
        .select(`
          *,
          companies(
            id,
            name,
            logo_url,
            industry,
            company_size,
            is_verified
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .range(start, end);

      // Apply same filters for data
      if (filters.search) {
        dataQuery = dataQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        dataQuery = dataQuery.ilike('location', `%${filters.location}%`);
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

      if (filters.salary_min > 0) {
        dataQuery = dataQuery.gte('salary_min', filters.salary_min);
      }

      if (filters.salary_max > 0) {
        dataQuery = dataQuery.lte('salary_max', filters.salary_max);
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
        case 'created_at':
          dataQuery = dataQuery.order('created_at', { ascending: false });
          break;
        case 'salary':
          dataQuery = dataQuery.order('salary_max', { ascending: false });
          break;
        case 'title':
          dataQuery = dataQuery.order('title', { ascending: true });
          break;
        default:
          dataQuery = dataQuery.order('created_at', { ascending: false });
      }

      const { data, error } = await dataQuery;
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      console.log('Jobs fetched:', data?.length, 'Total count:', count, 'Page:', page);
      
      return {
        jobs: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * pageSize
      };
    },
    enabled: true
  });

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