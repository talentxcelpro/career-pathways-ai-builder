/**
 * Critical path optimization hook for jobs page
 * Focuses on loading essential data first, then progressive enhancement
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { searchService } from '@/services/search/SearchService';
import { useEffect, useState, useRef } from 'react';

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
    seo_slug: 'senior-financial-analyst-jpmorgan-chase-mumbai',
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
    description: 'Lead quarterly financial forecasting, valuation modeling, and capital expenditure analysis for Asia-Pacific operations.',
    companies: {
      name: 'JPMorgan Chase & Co.',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Finance & Banking',
      is_verified: true
    }
  },
  {
    id: 'job-hsp-01',
    seo_slug: 'hotel-operations-manager-taj-hotels-new-delhi',
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
    description: 'Manage luxury resort operations, guest satisfaction metrics, room inventory logistics, and front office teams.',
    companies: {
      name: 'Taj Hotels & Resorts',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Hospitality & Tourism',
      is_verified: true
    }
  },
  {
    id: 'job-hr-01',
    seo_slug: 'hr-analytics-specialist-deloitte-bengaluru',
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
    description: 'Transform workforce data into strategic insights using Power BI turnover dashboards, compensation models, and retention analytics.',
    companies: {
      name: 'Deloitte Consulting',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Consulting & Corporate Strategy',
      is_verified: true
    }
  },
  {
    id: 'job-hlth-01',
    seo_slug: 'healthcare-operations-administrator-apollo-hospitals-hyderabad',
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
    description: 'Oversee hospital department workflow, patient discharge efficiency, clinical quality audit compliance, and facility staffing.',
    companies: {
      name: 'Apollo Hospitals Group',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Healthcare & Life Sciences',
      is_verified: true
    }
  },
  {
    id: 'job-cld-01',
    seo_slug: 'cloud-solutions-architect-aws-remote-india',
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
    description: 'Architect secure, resilient enterprise cloud infrastructure on AWS for enterprise financial and healthcare clients.',
    companies: {
      name: 'Amazon Web Services (AWS)',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Technology & Cloud',
      is_verified: true
    }
  },
  {
    id: 'job-scm-01',
    seo_slug: 'supply-chain-logistics-manager-dhl-pune',
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
    description: 'Drive end-to-end supply chain optimization, fulfillment center logistics, carrier negotiation, and demand forecasting.',
    companies: {
      name: 'DHL Supply Chain',
      logo_url: '/talentxcel-official-logo.png',
      industry: 'Supply Chain & Logistics',
      is_verified: true
    }
  }
];

export const useJobsCriticalPath = (filters: JobFilters, sortBy: string = 'posted_at') => {
  const queryClient = useQueryClient();
  const [isEnhancementLoaded, setIsEnhancementLoaded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [accumulatedJobs, setAccumulatedJobs] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 24;

  // Track filter changes to reset accumulated jobs and page
  const filterSignature = JSON.stringify({ filters, sortBy });
  const prevSignature = useRef(filterSignature);

  useEffect(() => {
    if (prevSignature.current !== filterSignature) {
      prevSignature.current = filterSignature;
      setCurrentPage(1);
      setAccumulatedJobs([]);
    }
  }, [filterSignature]);

  // Normalize experience levels to database enum representation
  const getMappedLevels = () => (filters.experience_level || []).map(lvl => {
    const l = lvl.toLowerCase();
    if (l.includes('entry') || l.includes('fresher') || l.includes('0-1')) return 'fresher';
    if (l.includes('mid') || l.includes('1-3') || l.includes('2-5')) return 'mid-level';
    if (l.includes('senior') || l.includes('3-5') || l.includes('5-10')) return 'senior-level';
    if (l.includes('lead') || l.includes('exec') || l.includes('10+')) return 'executive';
    return lvl;
  });

  // Step 1: Load initial page of active jobs via SearchService
  const criticalQuery = useQuery({
    queryKey: ['jobs-critical', filters, sortBy],
    queryFn: async () => {
      console.log('🚀 Loading active database jobs via SearchService (batch: 24)...');
      const mappedLevels = getMappedLevels();

      try {
        const searchResult = await searchService.searchJobs({
          query: filters.search,
          location: filters.location,
          employment_types: filters.employment_type,
          experience_levels: mappedLevels,
          min_salary: filters.salary_min,
          max_salary: filters.salary_max,
          is_remote: filters.is_remote,
          skills: filters.skills,
          page: 1,
          limit: pageSize,
          sortBy
        });

        const data = searchResult.jobs || [];
        const count = searchResult.totalCount || data.length;

        if (!data || data.length === 0) {
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
          is_featured: job.is_featured || (!isSearchActive && index < 6),
          companies: job.companies || {
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
      } catch (error: any) {
        console.warn("Jobs DB query warning:", error?.message || error);
        return { jobs: FALLBACK_JOBS, totalCount: FALLBACK_JOBS.length };
      }
    },
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Keep accumulated jobs in sync with page 1
  useEffect(() => {
    if (criticalQuery.data?.jobs) {
      setAccumulatedJobs(criticalQuery.data.jobs);
      setCurrentPage(1);
    }
  }, [criticalQuery.data]);

  const jobsData = criticalQuery.data;
  const initialJobs = jobsData?.jobs || [];
  const displayJobs = accumulatedJobs.length > 0 ? accumulatedJobs : initialJobs;
  const totalCount = jobsData?.totalCount || displayJobs.length;
  const hasMore = displayJobs.length < totalCount;

  // Progressive loading function to fetch subsequent pages
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);

    try {
      const mappedLevels = getMappedLevels();
      const nextResult = await searchService.searchJobs({
        query: filters.search,
        location: filters.location,
        employment_types: filters.employment_type,
        experience_levels: mappedLevels,
        min_salary: filters.salary_min,
        max_salary: filters.salary_max,
        is_remote: filters.is_remote,
        skills: filters.skills,
        page: nextPage,
        limit: pageSize,
        sortBy
      });

      const nextBatch = nextResult.jobs || [];
      if (nextBatch.length > 0) {
        const normalizedBatch = nextBatch.map((job: any) => ({
          ...job,
          is_featured: false,
          companies: job.companies || {
            name: job.company_name || 'TalentXcel Services (Client Partner)',
            logo_url: job.organization_logo_url || '/talentxcel-official-logo.png',
            industry: job.industry || 'Technology & Enterprise Services',
            is_verified: true
          }
        }));

        setAccumulatedJobs(prev => {
          const seen = new Set(prev.map(j => j.id));
          const uniqueNew = normalizedBatch.filter(j => !seen.has(j.id));
          return [...prev, ...uniqueNew];
        });
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.warn('Load more jobs error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    jobs: displayJobs,
    isLoading: criticalQuery.isLoading && displayJobs.length === 0,
    isLoadingMore,
    isEnhancing: false,
    isEnhancementLoaded: true,
    totalCount,
    hasMore,
    currentPage,
    loadMore,
    refetch: () => {
      setCurrentPage(1);
      setAccumulatedJobs([]);
      return criticalQuery.refetch();
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
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      const { count: featuredJobs } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open')
        .eq('is_featured', true);

      return { totalJobs: totalJobs || 0, featuredJobs: featuredJobs || 0 };
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};