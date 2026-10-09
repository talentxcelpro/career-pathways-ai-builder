/**
 * Critical path optimization hook for jobs page
 * Focuses on loading essential data first, then progressive enhancement
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { searchService } from '@/services/search/SearchService';
import { useEffect, useState, useRef } from 'react';
import { getCompanyLogo } from '@/utils/companyLogos';

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
  department?: string[];
  company_type?: string[];
  work_mode?: string[];
  industry?: string[];
  role_category?: string[];
  education?: string[];
  posted_by?: string[];
  freshness?: string[];
  company_id?: string;
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
      logo_url: '/assets/company-logos/jpmorgan.svg',
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
      logo_url: '/assets/company-logos/taj-hotels.svg',
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
      logo_url: '/assets/company-logos/deloitte.svg',
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
      logo_url: '/assets/company-logos/apollo-hospitals.svg',
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
      logo_url: '/assets/company-logos/aws.svg',
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
      logo_url: '/assets/company-logos/dhl.svg',
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
  const getMappedLevels = () => {
    const raw = filters.experience_level || [];
    const mapped = new Set<string>();

    raw.forEach(lvl => {
      const l = lvl.toLowerCase();
      if (l === 'fresher' || l.includes('entry') || l.includes('0-1')) {
        mapped.add('fresher');
      } else if (l === 'junior' || l.includes('1-3')) {
        mapped.add('mid-level');
      } else if (l === 'mid-level' || l.includes('3-7') || l.includes('2-5')) {
        mapped.add('mid-level');
      } else if (l === 'senior-level' || l.includes('5-10') || l.includes('senior') || l === 'manager' || l.includes('8+')) {
        mapped.add('senior-level');
      } else if (l === 'lead' || l === 'director' || l === 'executive' || l.includes('10+') || l.includes('12+') || l.includes('15+')) {
        mapped.add('executive');
      } else {
        mapped.add(lvl);
      }
    });

    return Array.from(mapped);
  };

  // Helper for applying secondary in-memory filters (department, work_mode, company_type, etc.)
  const applySecondaryFilters = (jobList: any[]) => {
    return jobList.filter(job => {
      // 1. Work Mode filter (remote, hybrid, office)
      if (filters.work_mode && filters.work_mode.length > 0) {
        const wantsRemote = filters.work_mode.includes('remote');
        const wantsHybrid = filters.work_mode.includes('hybrid');
        const wantsOffice = filters.work_mode.includes('office');

        const loc = (job.location || '').toLowerCase();
        const wm = (job.work_mode || '').toLowerCase();
        const isJobRemote = Boolean(job.is_remote || loc.includes('remote') || wm === 'remote');
        const isJobHybrid = Boolean(wm === 'hybrid' || loc.includes('hybrid'));
        const isJobOffice = Boolean((!job.is_remote && wm !== 'remote') || wm === 'onsite' || wm === 'office');

        const matchesMode = (wantsRemote && isJobRemote) || (wantsHybrid && isJobHybrid) || (wantsOffice && isJobOffice);
        if (!matchesMode) return false;
      }

      // 2. Department filter
      if (filters.department && filters.department.length > 0) {
        const deptMatches = filters.department.some(dept => {
          const text = `${job.department || ''} ${job.title || ''} ${job.description || ''} ${job.industry || ''}`.toLowerCase();
          return text.includes(dept.toLowerCase());
        });
        if (!deptMatches) return false;
      }

      // 3. Company Type filter
      if (filters.company_type && filters.company_type.length > 0) {
        const typeMatches = filters.company_type.some(ctype => {
          const comp = (job.company_name || job.companies?.name || '').toLowerCase();
          const ind = (job.companies?.industry || job.industry || '').toLowerCase();
          if (ctype === 'government') return ind.includes('government') || ['drdo', 'isro', 'upsc', 'rbi', 'iocl', 'cag'].some(c => comp.includes(c));
          if (ctype === 'mnc' || ctype === 'fortune-500') return ['google', 'microsoft', 'apple', 'amazon', 'aws', 'deloitte', 'mckinsey', 'jpmorgan'].some(c => comp.includes(c));
          if (ctype === 'startup') return ['zoho', 'stripe', 'crowdstrike'].some(c => comp.includes(c)) || job.is_hiring_fast;
          if (ctype === 'service') return ind.includes('service') || ind.includes('consulting');
          if (ctype === 'product') return !ind.includes('service') && !ind.includes('consulting');
          return true;
        });
        if (!typeMatches) return false;
      }

      // 4. Industry filter
      if (filters.industry && filters.industry.length > 0) {
        const indMatches = filters.industry.some(ind => {
          const text = `${job.companies?.industry || ''} ${job.industry || ''} ${job.industry_domain || ''} ${job.title || ''} ${job.description || ''}`.toLowerCase();
          return text.includes(ind.toLowerCase());
        });
        if (!indMatches) return false;
      }

      // 5. Role Category filter
      if (filters.role_category && filters.role_category.length > 0) {
        const roleMatches = filters.role_category.some(role => {
          const text = `${job.title || ''} ${(job.skills_required || []).join(' ')}`.toLowerCase();
          const keywords = role.split('-');
          return keywords.some(k => text.includes(k.toLowerCase()));
        });
        if (!roleMatches) return false;
      }

      // 6. Freshness filter
      if (filters.freshness && filters.freshness.length > 0) {
        const jobTime = new Date(job.posted_at || job.created_at).getTime();
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const freshnessMatches = filters.freshness.some(fresh => {
          if (fresh === 'today') return (now - jobTime) <= dayMs;
          if (fresh === 'week') return (now - jobTime) <= 7 * dayMs;
          if (fresh === 'month') return (now - jobTime) <= 30 * dayMs;
          if (fresh === '3months') return (now - jobTime) <= 90 * dayMs;
          return true;
        });
        if (!freshnessMatches) return false;
      }

      // 7. Education filter
      if (filters.education && filters.education.length > 0) {
        const eduMatches = filters.education.some(edu => {
          const text = `${job.minimum_education || ''} ${job.educational_qualification || ''} ${job.requirements || ''}`.toLowerCase();
          return text.includes(edu.toLowerCase());
        });
        if (!eduMatches) return false;
      }

      return true;
    });
  };

  // Step 1: Load initial page of active jobs via SearchService
  const criticalQuery = useQuery({
    queryKey: ['jobs-critical', filters, sortBy],
    queryFn: async () => {
      console.log('🚀 Loading active database jobs via SearchService...');
      const mappedLevels = getMappedLevels();
      const isRemoteEffective = filters.is_remote || (filters.work_mode?.includes('remote') ?? false);
      const hasSecondary = Boolean(
        (filters.department && filters.department.length > 0) ||
        (filters.company_type && filters.company_type.length > 0) ||
        (filters.work_mode && filters.work_mode.length > 0) ||
        (filters.industry && filters.industry.length > 0) ||
        (filters.role_category && filters.role_category.length > 0) ||
        (filters.education && filters.education.length > 0) ||
        (filters.posted_by && filters.posted_by.length > 0) ||
        (filters.freshness && filters.freshness.length > 0)
      );

      try {
        const searchResult = await searchService.searchJobs({
          query: filters.search,
          location: filters.location,
          employment_types: filters.employment_type,
          experience_levels: mappedLevels,
          min_salary: filters.salary_min,
          max_salary: filters.salary_max,
          is_remote: isRemoteEffective,
          skills: filters.skills,
          page: 1,
          limit: hasSecondary ? 60 : pageSize,
          sortBy
        });

        const data = searchResult.jobs || [];
        const count = searchResult.totalCount || data.length;

        if (!data || data.length === 0) {
          const isFiltered = Boolean(
            (filters.search && filters.search.trim()) ||
            (filters.location && filters.location.trim()) ||
            isRemoteEffective ||
            (filters.employment_type && filters.employment_type.length > 0) ||
            (filters.experience_level && filters.experience_level.length > 0) ||
            filters.salary_min > 0 ||
            hasSecondary
          );
          return {
            jobs: isFiltered ? [] : FALLBACK_JOBS,
            totalCount: count || (isFiltered ? 0 : FALLBACK_JOBS.length)
          };
        }

        // Filter out any Acme test jobs and apply secondary filters
        const isSearchActive = Boolean(filters.search || filters.location);
        let filteredData = data.filter((job: any) =>
          job.seo_slug !== 'senior-devops-architect-acme-corp-bengaluru' &&
          !job.company_name?.toLowerCase().includes('acme')
        );

        if (hasSecondary) {
          filteredData = applySecondaryFilters(filteredData);
        }

        const normalizedJobs = filteredData.map((job: any, index: number) => {
          const compName = job.companies?.name || job.company_name || 'TalentXcel Services';
          const resolvedLogo = getCompanyLogo(compName, job.companies?.logo_url || job.organization_logo_url);
          return {
            ...job,
            is_featured: job.is_featured || (!isSearchActive && index < 6),
            companies: {
              name: compName,
              logo_url: resolvedLogo,
              industry: job.companies?.industry || job.industry || 'Technology & Enterprise Services',
              is_verified: true
            }
          };
        });

        return {
          jobs: normalizedJobs,
          totalCount: hasSecondary ? normalizedJobs.length : (Math.max(0, count - (data.length - filteredData.length)) || normalizedJobs.length)
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
      const isRemoteEffective = filters.is_remote || (filters.work_mode?.includes('remote') ?? false);
      const hasSecondary = Boolean(
        (filters.department && filters.department.length > 0) ||
        (filters.company_type && filters.company_type.length > 0) ||
        (filters.work_mode && filters.work_mode.length > 0) ||
        (filters.industry && filters.industry.length > 0) ||
        (filters.role_category && filters.role_category.length > 0) ||
        (filters.education && filters.education.length > 0) ||
        (filters.posted_by && filters.posted_by.length > 0) ||
        (filters.freshness && filters.freshness.length > 0)
      );

      const nextResult = await searchService.searchJobs({
        query: filters.search,
        location: filters.location,
        employment_types: filters.employment_type,
        experience_levels: mappedLevels,
        min_salary: filters.salary_min,
        max_salary: filters.salary_max,
        is_remote: isRemoteEffective,
        skills: filters.skills,
        page: nextPage,
        limit: hasSecondary ? 60 : pageSize,
        sortBy
      });

      let nextBatch = (nextResult.jobs || []).filter((job: any) =>
        job.seo_slug !== 'senior-devops-architect-acme-corp-bengaluru' &&
        !job.company_name?.toLowerCase().includes('acme')
      );

      if (hasSecondary) {
        nextBatch = applySecondaryFilters(nextBatch);
      }
      if (nextBatch.length > 0) {
        const normalizedBatch = nextBatch.map((job: any) => {
          const compName = job.companies?.name || job.company_name || 'TalentXcel Services';
          const resolvedLogo = getCompanyLogo(compName, job.companies?.logo_url || job.organization_logo_url);
          return {
            ...job,
            is_featured: false,
            companies: {
              name: compName,
              logo_url: resolvedLogo,
              industry: job.companies?.industry || job.industry || 'Technology & Enterprise Services',
              is_verified: true
            }
          };
        });

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