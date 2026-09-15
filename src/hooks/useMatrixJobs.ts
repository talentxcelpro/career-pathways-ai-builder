// src/hooks/useMatrixJobs.ts
// Direct Database Query Hook for Matrix Landing Pages (/jobs/:role/:experience/:city)
// Queries jobs & scraped_jobs with PostgREST SQL filters and evaluates live indexability

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobRoleConfig } from '@/config/jobs/roles';
import { JobExperienceConfig } from '@/config/jobs/experiences';
import { JobLocationConfig } from '@/config/jobs/locations';
import { evaluateMatrixIndexability, IndexabilityDecision } from '@/config/jobs/indexability';

export interface MatrixJobCardData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  experience?: string;
  type: string;
  postedAt: string;
  url: string;
  isRemote?: boolean;
}

export function useMatrixJobs(
  role: JobRoleConfig | null,
  experience: JobExperienceConfig | null,
  location: JobLocationConfig | null
) {
  const [jobs, setJobs] = useState<MatrixJobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexability, setIndexability] = useState<IndexabilityDecision | null>(null);

  useEffect(() => {
    if (!role || !experience || !location) {
      setJobs([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchMatrixJobs() {
      try {
        setLoading(true);
        setError(null);

        // Build Title search pattern from role and top synonyms
        const titleTerms = [role.title, ...role.synonyms.slice(0, 3)];
        const titleOrClause = titleTerms.map(t => `title.ilike.%${t}%`).join(',');

        // Build Location search pattern from city and top aliases
        const locTerms = [location.cityName, ...location.aliases.slice(0, 3)];
        const locOrClause = locTerms.map(l => `location.ilike.%${l}%,location_city.ilike.%${l}%`).join(',');

        // Query jobs table
        let query = supabase
          .from('jobs')
          .select('id, title, company_name, location, location_city, salary_min, salary_max, salary_currency, min_experience, max_experience, experience_level, employment_type, created_at, posted_at, is_remote, seo_slug')
          .eq('is_active', true)
          .or(titleOrClause)
          .or(locOrClause);

        // Filter by experience level
        if (experience.slug === 'freshers') {
          query = query.lte('min_experience', 1);
        } else if (experience.slug === '1-3-years') {
          query = query.gte('max_experience', 1).lte('min_experience', 3);
        } else if (experience.slug === '3-5-years') {
          query = query.gte('max_experience', 3).lte('min_experience', 5);
        }

        const { data: dbJobs, error: dbError } = await query.limit(20);

        if (dbError) {
          console.warn('Matrix jobs query warning:', dbError);
        }

        const normalizedJobs: MatrixJobCardData[] = (dbJobs || []).map((j: any) => {
          let salaryStr = 'Best in Industry';
          if (j.salary_min && j.salary_max) {
            salaryStr = `₹${(j.salary_min / 100000).toFixed(1)}L - ₹${(j.salary_max / 100000).toFixed(1)}L`;
          } else if (j.salary_min) {
            salaryStr = `From ₹${(j.salary_min / 100000).toFixed(1)}L`;
          }

          return {
            id: j.id,
            title: j.title,
            company: j.company_name || 'Hiring Enterprise Partner',
            location: j.location || `${location.cityName}, ${location.countryName}`,
            salary: salaryStr,
            experience: `${j.min_experience ?? 0}-${j.max_experience ?? 2} yrs`,
            type: j.employment_type || 'Full Time',
            postedAt: j.posted_at || j.created_at || new Date().toISOString(),
            url: `/jobs/${j.seo_slug || j.id}`,
            isRemote: j.is_remote ?? false,
          };
        });

        if (isMounted) {
          setJobs(normalizedJobs);
          // Evaluate Indexability Gate based on real inventory
          const decision = evaluateMatrixIndexability(role, experience, location, normalizedJobs.length);
          setIndexability(decision);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to query matrix jobs');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMatrixJobs();

    return () => {
      isMounted = false;
    };
  }, [role?.slug, experience?.slug, location?.slug]);

  return {
    jobs,
    loading,
    error,
    totalCount: jobs.length,
    indexability,
  };
}
