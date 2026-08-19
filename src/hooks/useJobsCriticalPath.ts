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

export const FALLBACK_JOBS = [
  {
    id: 'job-fin-01',
    title: 'Senior Financial Analyst',
    company_name: 'JPMorgan Chase & Co.',
    location: 'Mumbai • Hybrid',
    salary_min: 1400000,
    salary_max: 2200000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: true,
    department: 'Finance & Accounting',
    skills_required: ['Financial Modeling', 'Excel', 'Valuation', 'Financial Analysis'],
    description: 'Lead quarterly financial forecasting, valuation modeling, and capital expenditure analysis for Asia-Pacific operations.'
  },
  {
    id: 'job-hsp-01',
    title: 'Hotel Operations Manager',
    company_name: 'Taj Hotels & Resorts',
    location: 'New Delhi • On-site',
    salary_min: 1200000,
    salary_max: 1800000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: false,
    department: 'Hospitality & Tourism',
    skills_required: ['Hotel Operations', 'Guest Experience', 'Front Office', 'Revenue Strategy'],
    description: 'Manage luxury resort operations, guest satisfaction metrics, room inventory logistics, and front office teams.'
  },
  {
    id: 'job-hr-01',
    title: 'HR Analytics Specialist',
    company_name: 'Deloitte Consulting',
    location: 'Bangalore • Hybrid',
    salary_min: 1100000,
    salary_max: 1600000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: true,
    department: 'HR & People',
    skills_required: ['People Analytics', 'Power BI', 'HR Metrics', 'Recruitment'],
    description: 'Transform workforce data into strategic insights using Power BI turnover dashboards, compensation models, and retention analytics.'
  },
  {
    id: 'job-hlth-01',
    title: 'Healthcare Operations Administrator',
    company_name: 'Apollo Hospitals Group',
    location: 'Hyderabad • On-site',
    salary_min: 900000,
    salary_max: 1400000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: false,
    department: 'Healthcare & Life Sciences',
    skills_required: ['Healthcare Operations', 'Patient Flow', 'Clinical Quality', 'Compliance'],
    description: 'Oversee hospital department workflow, patient discharge efficiency, clinical quality audit compliance, and facility staffing.'
  },
  {
    id: 'job-cld-01',
    title: 'Cloud Solutions Architect',
    company_name: 'Amazon Web Services (AWS)',
    location: 'Remote • India',
    salary_min: 2800000,
    salary_max: 4200000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: true,
    department: 'Technology & IT',
    skills_required: ['AWS Architecture', 'Cloud Security', 'Kubernetes', 'Terraform IaC'],
    description: 'Architect secure, resilient enterprise cloud infrastructure on AWS for enterprise financial and healthcare clients.'
  },
  {
    id: 'job-scm-01',
    title: 'Supply Chain & Logistics Manager',
    company_name: 'DHL Supply Chain',
    location: 'Pune • On-site',
    salary_min: 1300000,
    salary_max: 2000000,
    posted_at: new Date().toISOString(),
    is_featured: true,
    employment_type: 'Full-time',
    is_remote: false,
    department: 'Supply Chain & Logistics',
    skills_required: ['Supply Chain', 'Demand Forecasting', 'Warehouse Logistics', 'Procurement'],
    description: 'Drive end-to-end supply chain optimization, fulfillment center logistics, carrier negotiation, and demand forecasting.'
  }
];

export const useJobsCriticalPath = (filters: JobFilters, sortBy: string = 'created_at') => {
  const queryClient = useQueryClient();
  const [isEnhancementLoaded, setIsEnhancementLoaded] = useState(false);

  // Step 1: Load critical job data
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
        .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
        .limit(20);

      if (error) {
        console.warn("Jobs DB query notice:", error.message);
        return FALLBACK_JOBS;
      }
      
      return (data && data.length > 0) ? data : FALLBACK_JOBS;
    },
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Step 2: Load enhanced data progressively
  const enhancedQuery = useQuery({
    queryKey: ['jobs-enhanced', filters, sortBy],
    queryFn: async () => {
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
        .order(sortBy === 'created_at' ? 'posted_at' : sortBy, { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        setIsEnhancementLoaded(true);
        return FALLBACK_JOBS;
      }

      setIsEnhancementLoaded(true);
      return data;
    },
    enabled: criticalQuery.isSuccess && !criticalQuery.isLoading,
    staleTime: 180000,
    refetchOnWindowFocus: false,
  });

  // Step 3: Prefetch next batch in background
  useEffect(() => {
    if (enhancedQuery.isSuccess && !enhancedQuery.isFetching) {
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['jobs-critical-page-2', filters, sortBy],
          queryFn: async () => {
            const { data } = await supabase
              .from('jobs')
              .select('id, title, company_name, location, salary_min, salary_max, posted_at, is_featured, employment_type')
              .eq('is_active', true)
              .range(20, 39);

            return data || FALLBACK_JOBS;
          },
          staleTime: 300000,
        });
      }, 2000);
    }
  }, [enhancedQuery.isSuccess, enhancedQuery.isFetching, queryClient, filters, sortBy]);

  // Return critical data first, then enhanced when available
  const dbJobs = enhancedQuery.data || criticalQuery.data;
  const jobs = (dbJobs && dbJobs.length > 0) ? dbJobs : FALLBACK_JOBS;
  const isLoading = criticalQuery.isLoading;
  const isEnhancing = enhancedQuery.isFetching;

  return {
    jobs,
    isLoading,
    isEnhancing,
    isEnhancementLoaded,
    totalCount: jobs.length,
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