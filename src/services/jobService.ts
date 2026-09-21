// Real-time job data service - production ready
import { supabase } from '@/integrations/supabase/client';
import { fetchProductionData, validateProductionData } from '@/utils/productionCleanup';
import { searchService } from '@/services/search/SearchService';

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

// Real-time job fetching with production filters via SearchService (with browser cache)
export const getJobs = async (
  page: number = 1,
  limit: number = 20,
  filters: JobFilters = {}
): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> => {
  return fetchProductionData(async () => {
    const result = await searchService.searchJobs({
      page,
      limit: Math.min(50, Math.max(1, limit || 20)),
      query: filters.search,
      location: filters.location,
      employment_types: filters.employment_types,
      experience_levels: filters.experience_levels,
      min_salary: filters.min_salary,
      max_salary: filters.max_salary,
      is_remote: filters.is_remote,
      skills: filters.skills,
      sortBy: 'created_at'
    });

    return {
      jobs: result.jobs as Job[],
      total: result.totalCount,
      hasMore: result.hasMore
    };
  }, { jobs: [], total: 0, hasMore: false });
};

const JOB_CARD_COLUMNS = 'id, title, company_name, location, description, salary_min, salary_max, salary_range, employment_type, experience_level, skills_required, is_remote, is_featured, is_active, job_status, views_count, applications_count, external_url, posted_at, expires_at, created_at';

export const getFeaturedJobs = async (limit: number = 6): Promise<Job[]> => {
  return fetchProductionData(async () => {
    console.log('🔍 Fetching featured jobs...');
    const { data, error } = await supabase
      .from('jobs')
      .select(JOB_CARD_COLUMNS)
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    console.log('🔍 Featured jobs query result:', { data, error, count: data?.length });
    if (error) throw error;
    return (data || []) as Job[];
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
    
    return data as Job;
  }, null);
};

export const getJobsByCompany = async (companyId: string): Promise<Job[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(JOB_CARD_COLUMNS)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as Job[];
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
      .select(JOB_CARD_COLUMNS)
      .neq('id', jobId)
      .eq('is_active', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .overlaps('skills_required', skills)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []) as Job[];
  }, []);
};