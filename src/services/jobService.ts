// Real-time job data service - production ready
import { supabase } from '@/integrations/supabase/client';
import { fetchProductionData, validateProductionData } from '@/utils/productionCleanup';

export interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_range?: string;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  is_remote: boolean;
  is_featured: boolean;
  is_active: boolean;
  job_status: string;
  views_count: number;
  applications_count: number;
  external_url?: string;
  posted_at: string;
  expires_at: string;
  created_at: string;
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    is_verified: boolean;
  };
}

export interface JobFilters {
  search?: string;
  location?: string;
  employment_types?: string[];
  experience_levels?: string[];
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  skills?: string[];
}

// Real-time job fetching with production filters
export const getJobs = async (
  page: number = 1,
  limit: number = 20,
  filters: JobFilters = {}
): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
      p_page: page,
      p_limit: limit,
      p_search: filters.search || '',
      p_location: filters.location || '',
      p_employment_types: filters.employment_types || [],
      p_experience_levels: filters.experience_levels || [],
      p_min_salary: filters.min_salary || 0,
      p_max_salary: filters.max_salary || 0,
      p_is_remote: filters.is_remote || false,
      p_skills: filters.skills || [],
      p_sort_by: 'created_at'
    });

    if (error) throw error;
    
    // Filter jobs to ensure we only show valid, non-expired jobs
    const validJobs = (data?.jobs || []).filter((job: Job) => {
      const isNotExpired = new Date(job.expires_at) > new Date();
      const hasValidData = job.id && job.title && job.company_name;
      return isNotExpired && hasValidData;
    });
    
    return {
      jobs: validJobs,
      total: data?.total_count || 0,
      hasMore: data?.has_more || false
    };
  }, { jobs: [], total: 0, hasMore: false });
};

export const getFeaturedJobs = async (limit: number = 6): Promise<Job[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }, []);
};

export const getJobById = async (id: string): Promise<Job | null> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    return data;
  }, null);
};

export const getJobsByCompany = async (companyId: string): Promise<Job[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);
};

export const getJobCategories = async () => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase.rpc('get_job_categories_with_counts');
    
    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time subscription for job updates
export const subscribeToJobUpdates = (callback: (jobs: Job[]) => void) => {
  const channel = supabase
    .channel('jobs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs'
      },
      async () => {
        const result = await getJobs(1, 20);
        if (validateProductionData(result.jobs, 'job updates')) {
          callback(result.jobs);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Production-ready job application tracking
export const trackJobView = async (jobId: string) => {
  try {
    await supabase.rpc('increment_job_views', { job_uuid: jobId });
  } catch (error) {
    console.warn('Failed to track job view:', error);
  }
};

export const getRelatedJobs = async (jobId: string, skills: string[] = []): Promise<Job[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .neq('id', jobId)
      .eq('is_active', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .overlaps('skills_required', skills)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  }, []);
};