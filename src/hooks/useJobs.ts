import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Job {
  id: string;
  title: string;
  description: string;
  company_name: string;
  company_id?: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_range?: string;
  currency: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  experience_level: 'entry_level' | 'mid_level' | 'senior_level' | 'executive';
  remote_policy: 'office' | 'remote' | 'hybrid';
  is_remote: boolean;
  skills_required: string[];
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  posted_by?: string;
  job_status: 'draft' | 'open' | 'closed' | 'filled' | 'expired';
  is_active: boolean;
  is_featured: boolean;
  is_urgent: boolean;
  external_url?: string;
  seo_slug?: string;
  role_category?: string;
  views_count: number;
  applications_count: number;
  clicks_count: number;
  posted_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    is_verified: boolean;
  };
}

interface JobFilters {
  search?: string;
  location?: string;
  employment_types?: string[];
  experience_levels?: string[];
  min_salary?: number;
  max_salary?: number;
  is_remote?: boolean;
  skills?: string[];
  company?: string;
  sort_by?: 'created_at' | 'salary_max' | 'views_count' | 'applications_count';
  page?: number;
  limit?: number;
}

export const useJobs = (filters: JobFilters = {}) => {
  const queryClient = useQueryClient();

  const { data: jobsResponse, isLoading, error } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let query = supabase
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
        .gt('expires_at', new Date().toISOString());

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      if (filters.location) {
        if (filters.location === 'India') {
          query = query.ilike('location', '%india%');
        } else if (filters.location === 'International') {
          query = query.not('location', 'ilike', '%india%');
        } else {
          query = query.ilike('location', `%${filters.location}%`);
        }
      }

      if (filters.employment_types?.length) {
        query = query.in('employment_type', filters.employment_types);
      }

      if (filters.experience_levels?.length) {
        query = query.in('experience_level', filters.experience_levels);
      }

      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }

      if (filters.min_salary) {
        query = query.or(`salary_min.gte.${filters.min_salary},salary_max.gte.${filters.min_salary}`);
      }

      if (filters.max_salary) {
        query = query.or(`salary_max.lte.${filters.max_salary},salary_min.lte.${filters.max_salary}`);
      }

      if (filters.skills?.length) {
        query = query.overlaps('skills_required', filters.skills);
      }

      if (filters.company) {
        query = query.ilike('company_name', `%${filters.company}%`);
      }

      // Sorting
      const sortBy = filters.sort_by || 'created_at';
      if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'salary_max') {
        query = query.order('salary_max', { ascending: false, nullsFirst: false });
      } else {
        query = query.order(sortBy, { ascending: false, nullsFirst: false });
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        jobs: data as Job[],
        totalCount: count || 0,
        hasMore: data ? data.length === limit : false
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    jobs: jobsResponse?.jobs || [],
    totalCount: jobsResponse?.totalCount || 0,
    hasMore: jobsResponse?.hasMore || false,
    isLoading,
    error,
  };
};

export const useJob = (jobId: string) => {
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            description,
            website_url,
            industry,
            company_size,
            location,
            is_verified
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data as Job;
    },
    enabled: !!jobId,
  });

  return { job, isLoading, error };
};

export const useJobApplication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const applyToJob = useMutation({
    mutationFn: async ({ 
      jobId, 
      coverLetter, 
      resumeUrl, 
      portfolioUrl 
    }: { 
      jobId: string; 
      coverLetter?: string; 
      resumeUrl?: string; 
      portfolioUrl?: string; 
    }) => {
      if (!user) throw new Error('Must be logged in to apply');

      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl,
          portfolio_url: portfolioUrl,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;

      // Increment applications count on job
      const { data: jobData } = await supabase
        .from('jobs')
        .select('applications_count')
        .eq('id', jobId)
        .single();

      if (jobData) {
        await supabase
          .from('jobs')
          .update({ 
            applications_count: (jobData.applications_count || 0) + 1
          })
          .eq('id', jobId);
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['job', data.job_id] });
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('You have already applied to this job');
      } else {
        toast.error('Failed to submit application: ' + error.message);
      }
    },
  });

  const getMyApplications = useQuery({
    queryKey: ['job-applications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company_name,
            location,
            employment_type,
            job_status
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    applyToJob,
    applications: getMyApplications.data || [],
    isLoadingApplications: getMyApplications.isLoading,
    isApplying: applyToJob.isPending,
  };
};

export const useCreateJob = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      if (!user) throw new Error('Must be logged in to create jobs');

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          posted_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Job posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create job: ' + error.message);
    },
  });
};

export const useJobStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['job-stats'],
    queryFn: async () => {
      // Get active jobs count
      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      // Get companies count
      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Get recent jobs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      return {
        activeJobs: activeJobs || 0,
        companies: companiesCount || 0,
        recentJobs: recentJobs || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { stats, isLoading };
};