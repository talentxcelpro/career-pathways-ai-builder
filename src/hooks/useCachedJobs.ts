import { useQuery } from '@tanstack/react-query';
import { useRedisCache } from './useRedisCache';
import { supabase } from '@/integrations/supabase/client';
import { cacheManager } from '@/utils/cacheManager';

interface JobFilters {
  search?: string;
  location?: string;
  employmentTypes?: string[];
  experienceLevels?: string[];
  minSalary?: number;
  maxSalary?: number;
  isRemote?: boolean;
  skills?: string[];
  sortBy?: string;
  page?: number;
  limit?: number;
}

export function useCachedJobs(filters: JobFilters = {}) {
  // Create cache key from filters
  const cacheKey = `jobs:${JSON.stringify(filters)}`;
  
  const fetcher = async () => {
    // Check Redis cache first
    const cached = await cacheManager.getCachedJobs(filters);
    if (cached) {
      return cached;
    }

    // Fetch from Supabase if not cached
    let query = supabase
      .from('jobs')
      .select(`
        *,
        companies(name, logo_url, industry, is_verified)
      `)
      .eq('is_active', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString());

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    if (filters.location) {
      if (filters.location === 'Remote') {
        query = query.eq('is_remote', true);
      } else if (filters.location && filters.location !== 'All') {
        query = query.ilike('location', `%${filters.location}%`);
      } else {
        query = query.ilike('location', `%${filters.location}%`);
      }
    }

    if (filters.employmentTypes?.length) {
      query = query.in('employment_type', filters.employmentTypes);
    }

    if (filters.experienceLevels?.length) {
      query = query.in('experience_level', filters.experienceLevels);
    }

    if (filters.isRemote) {
      query = query.eq('is_remote', true);
    }

    if (filters.minSalary) {
      query = query.or(`salary_min.gte.${filters.minSalary},salary_max.gte.${filters.minSalary}`);
    }

    if (filters.maxSalary) {
      query = query.or(`salary_max.lte.${filters.maxSalary},salary_min.lte.${filters.maxSalary}`);
    }

    if (filters.skills?.length) {
      query = query.overlaps('skills_required', filters.skills);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'salary_max':
        query = query.order('salary_max', { ascending: false });
        break;
      case 'views_count':
        query = query.order('views_count', { ascending: false });
        break;
      case 'applications_count':
        query = query.order('applications_count', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const result = {
      jobs: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit
    };

    // Cache the result
    await cacheManager.cacheJobs(result.jobs, filters);

    return result;
  };

  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useTrendingJobs() {
  const cacheKey = 'jobs:trending';
  
  return useRedisCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url, industry, is_verified)
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('views_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    {
      ttl: 1800, // 30 minutes
      tags: ['jobs', 'trending']
    }
  );
}

export function useFeaturedJobs() {
  const cacheKey = 'jobs:featured';
  
  return useRedisCache(
    cacheKey,
    async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url, industry, is_verified)
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .eq('is_featured', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    {
      ttl: 3600, // 1 hour
      tags: ['jobs', 'featured']
    }
  );
}