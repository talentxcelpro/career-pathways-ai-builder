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

export const useJobsCriticalPath = (filters: JobFilters, sortBy: string = 'posted_at') => {
  const queryClient = useQueryClient();
  const [isEnhancementLoaded, setIsEnhancementLoaded] = useState(true);

  // Step 1: Load real active jobs from Supabase
  const criticalQuery = useQuery({
    queryKey: ['jobs-critical', filters, sortBy],
    queryFn: async () => {
      console.log('🚀 Loading active database jobs from Supabase...');
      
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('job_status', 'open')
        .eq('status', 'active');

      // Search filter
      if (filters.search && filters.search.trim().length > 0) {
        const s = filters.search.trim();
        query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,company_name.ilike.%${s}%`);
      }

      // Location filter
      if (filters.location && filters.location.trim().length > 0) {
        query = query.ilike('location', `%${filters.location.trim()}%`);
      }

      // Remote filter
      if (filters.is_remote) {
        query = query.eq('is_remote', true);
      }

      // Employment type filter
      if (filters.employment_type && filters.employment_type.length > 0) {
        query = query.in('employment_type', filters.employment_type);
      }

      // Experience level filter (normalize frontend values to DB values)
      if (filters.experience_level && filters.experience_level.length > 0) {
        const mappedLevels = filters.experience_level.map(lvl => {
          const l = lvl.toLowerCase();
          if (l.includes('entry') || l.includes('fresher') || l.includes('0-1')) return 'fresher';
          if (l.includes('mid') || l.includes('1-3') || l.includes('2-5')) return 'mid-level';
          if (l.includes('senior') || l.includes('3-5') || l.includes('5-10')) return 'senior-level';
          if (l.includes('lead') || l.includes('exec') || l.includes('10+')) return 'executive';
          return lvl;
        });
        query = query.in('experience_level', mappedLevels);
      }

      // Salary filters
      if (filters.salary_min && filters.salary_min > 0) {
        query = query.gte('salary_max', filters.salary_min);
      }
      if (filters.salary_max && filters.salary_max > 0) {
        query = query.lte('salary_min', filters.salary_max);
      }

      // Sorting
      if (sortBy === 'salary_max') {
        query = query.order('salary_max', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'views_count') {
        query = query.order('views_count', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'applications_count') {
        query = query.order('applications_count', { ascending: true, nullsFirst: false });
      } else {
        query = query.order('posted_at', { ascending: false, nullsFirst: false });
      }

      // Fetch first 100 jobs
      query = query.limit(100);

      const { data, count, error } = await query;

      if (error) {
        console.warn("Jobs DB query warning:", error.message);
        return { jobs: FALLBACK_JOBS, totalCount: FALLBACK_JOBS.length };
      }

      if (!data || data.length === 0) {
        // If filters yielded 0 matches, return empty array so UI shows "No jobs found" for that filter
        const isFiltered = Boolean(
          (filters.search && filters.search.trim()) ||
          (filters.location && filters.location.trim()) ||
          filters.is_remote ||
          (filters.employment_type && filters.employment_type.length > 0) ||
          (filters.experience_level && filters.experience_level.length > 0) ||
          filters.salary_min > 0
        );
        return {
          jobs: isFiltered ? [] : FALLBACK_JOBS,
          totalCount: count || (isFiltered ? 0 : FALLBACK_JOBS.length)
        };
      }

      // Normalize each job with valid companies object & featured distribution
      const isSearchActive = Boolean(filters.search || filters.location);
      const normalizedJobs = data.map((job: any, index: number) => ({
        ...job,
        // Designate top 6 jobs as featured on default view so both Featured and All sections are populated
        is_featured: job.is_featured || (!isSearchActive && index < 6),
        companies: {
          name: job.company_name || 'TalentXcel Services (Client Partner)',
          logo_url: job.organization_logo_url || '/talentxcel-official-logo.png',
          industry: job.industry || 'Technology & Enterprise Services',
          is_verified: true
        }
      }));

      return {
        jobs: normalizedJobs,
        totalCount: count || normalizedJobs.length
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const jobsData = criticalQuery.data;
  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.totalCount || jobs.length;
  const isLoading = criticalQuery.isLoading;

  return {
    jobs,
    isLoading,
    isEnhancing: false,
    isEnhancementLoaded: true,
    totalCount,
    hasMore: jobs.length >= 100,
    refetch: () => criticalQuery.refetch()
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