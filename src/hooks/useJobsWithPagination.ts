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

      let query = supabase
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
        `, { count: 'exact' })
        .eq('is_active', true)
        .eq('job_status', 'open')
        .range(start, end);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,companies.name.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      }

      if (filters.experience_level.length > 0) {
        query = query.in('experience_level', filters.experience_level);
      }

      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }

      if (filters.salary_min > 0) {
        query = query.gte('salary_min', filters.salary_min);
      }

      if (filters.salary_max > 0) {
        query = query.lte('salary_max', filters.salary_max);
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
        case 'created_at':
          query = query.order('created_at', { ascending: false });
          break;
        case 'salary':
          query = query.order('salary_max', { ascending: false });
          break;
        case 'company':
          query = query.order('companies(name)', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return {
        jobs: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > page * pageSize
      };
    },
    enabled: true
  });

  // Update accumulated jobs when new data arrives
  React.useEffect(() => {
    if (data?.jobs) {
      if (page === 1) {
        setAllJobs(data.jobs);
      } else {
        setAllJobs(prev => [...prev, ...data.jobs]);
      }
    }
  }, [data, page]);

  // Reset when filters change
  React.useEffect(() => {
    setPage(1);
    setAllJobs([]);
  }, [filters, sortBy]);

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
    currentPage: page
  };
};