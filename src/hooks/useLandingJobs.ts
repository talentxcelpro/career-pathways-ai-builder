import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LandingJob {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  is_remote: boolean | null;
}

interface Options {
  /** Matched against title / description. Empty = no keyword filter. */
  keywords?: string[];
  /** Matched against location fields. Empty = no location filter. */
  locationAliases?: string[];
  remoteOnly?: boolean;
  limit?: number;
}

const LOCATION_ALIAS_MAP: Record<string, string[]> = {
  'bangalore': ['bangalore', 'bengaluru', 'karnataka'],
  'bengaluru': ['bangalore', 'bengaluru', 'karnataka'],
  'delhi': ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'],
  'delhi-ncr': ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'],
  'ncr': ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'],
  'noida': ['noida', 'delhi', 'ncr', 'greater noida'],
  'gurgaon': ['gurgaon', 'gurugram', 'delhi', 'ncr', 'haryana'],
  'gurugram': ['gurgaon', 'gurugram', 'delhi', 'ncr', 'haryana'],
  'mumbai': ['mumbai', 'navi mumbai', 'thane', 'maharashtra'],
  'pune': ['pune', 'maharashtra', 'pcmc'],
  'hyderabad': ['hyderabad', 'secunderabad', 'telangana', 'cyberabad'],
  'chennai': ['chennai', 'tamil nadu'],
  'kolkata': ['kolkata', 'west bengal'],
  'ahmedabad': ['ahmedabad', 'gujarat'],
  'chandigarh': ['chandigarh', 'mohali', 'panchkula', 'punjab'],
  'jaipur': ['jaipur', 'rajasthan'],
};

/**
 * Expands a location into its comprehensive geographic aliases.
 */
function expandLocationAliases(locations: string[]): string[] {
  const result = new Set<string>();
  for (const loc of locations) {
    const clean = loc.toLowerCase().trim();
    if (!clean) continue;
    result.add(clean);
    if (LOCATION_ALIAS_MAP[clean]) {
      for (const alias of LOCATION_ALIAS_MAP[clean]) {
        result.add(alias);
      }
    }
  }
  return Array.from(result);
}

/**
 * Live openings for a landing page with database-level SQL filtering across jobs and scraped_jobs.
 */
export function useLandingJobs({ keywords = [], locationAliases = [], remoteOnly = false, limit = 12 }: Options) {
  const [jobs, setJobs] = useState<LandingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const keyList = keywords.join('|');
  const locList = locationAliases.join('|');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      const keys = keyList ? keyList.split('|').filter(Boolean) : [];
      const rawLocs = locList ? locList.split('|').filter(Boolean) : [];
      const locs = expandLocationAliases(rawLocs);
      const isNationalIndia = (rawLocs.length === 0 || (rawLocs.length === 1 && (rawLocs[0].toLowerCase() === 'india' || rawLocs[0].toLowerCase() === 'national')));

      try {
        // 1. Query manual jobs table with SQL filters
        let jobsQuery = supabase
          .from('jobs')
          .select('id, title, job_title, company_name, location, location_city, location_state, description, job_description, salary_min, salary_max, employment_type, is_remote, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (remoteOnly) {
          jobsQuery = jobsQuery.or('is_remote.eq.true,location.ilike.%remote%');
        } else if (!isNationalIndia && locs.length > 0) {
          const locFilter = locs.map((loc) => `location.ilike.%${loc.trim()}%,location_city.ilike.%${loc.trim()}%`).join(',');
          jobsQuery = jobsQuery.or(locFilter);
        }

        if (keys.length > 0) {
          const keyFilter = keys.map((k) => `title.ilike.%${k.trim()}%,job_title.ilike.%${k.trim()}%,description.ilike.%${k.trim()}%`).join(',');
          jobsQuery = jobsQuery.or(keyFilter);
        }

        const { data: manualData } = await jobsQuery.limit(limit);

        if (cancelled) return;

        let matched: any[] = (manualData || []).map((row: any) => ({
          id: String(row.id),
          title: row.title || row.job_title || 'Open role',
          company_name: row.company_name || 'TalentXcel Hiring Partner',
          location: row.location || row.location_city || 'India',
          salary_min: row.salary_min ?? null,
          salary_max: row.salary_max ?? null,
          employment_type: row.employment_type || 'Full-time',
          is_remote: row.is_remote ?? null,
        }));

        // 2. Query scraped_jobs table with direct SQL database-level filters
        let scrapedQuery = supabase
          .from('scraped_jobs')
          .select('id, job_title, company, location, salary, job_description, created_at')
          .order('created_at', { ascending: false });

        if (remoteOnly) {
          scrapedQuery = scrapedQuery.ilike('location', '%remote%');
        } else if (!isNationalIndia && locs.length > 0) {
          const locFilter = locs.map((loc) => `location.ilike.%${loc.trim()}%`).join(',');
          scrapedQuery = scrapedQuery.or(locFilter);
        }

        if (keys.length > 0) {
          const keyFilter = keys.map((k) => `job_title.ilike.%${k.trim()}%,job_description.ilike.%${k.trim()}%`).join(',');
          scrapedQuery = scrapedQuery.or(keyFilter);
        }

        const { data: scrapedData } = await scrapedQuery.limit(limit * 2);

        if (cancelled) return;

        if (scrapedData && scrapedData.length > 0) {
          const scrapedMatched = scrapedData.map((row: any) => ({
            id: String(row.id),
            title: row.job_title || 'Open role',
            company_name: row.company || 'Verified Employer',
            location: row.location || 'India',
            salary_min: null,
            salary_max: null,
            employment_type: 'Full-time',
            is_remote: norm(row.location).includes('remote'),
          }));

          const existingIds = new Set(matched.map((m: any) => String(m.id)));
          for (const s of scrapedMatched) {
            if (!existingIds.has(s.id)) {
              matched.push(s);
              existingIds.add(s.id);
            }
          }
        }

        setTotal(matched.length);
        setJobs(matched.slice(0, limit));
      } catch (err) {
        console.error('Error fetching landing jobs:', err);
        setJobs([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [keyList, locList, remoteOnly, limit]);

  return { jobs, total, loading };
}
