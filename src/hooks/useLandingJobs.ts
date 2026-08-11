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

const norm = (v: unknown) => (typeof v === 'string' ? v.toLowerCase() : '');

/**
 * Live openings for a landing page. Filtering happens client-side because job
 * rows carry several legacy title/location columns.
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
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, title, job_title, company_name, location, location_city, location_state, description, job_description, salary_min, salary_max, employment_type, is_remote, created_at',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(300);

      if (cancelled) return;

      if (error || !data) {
        setJobs([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const keys = keyList ? keyList.split('|').filter(Boolean) : [];
      const locs = locList ? locList.split('|').filter(Boolean) : [];

      const matched = data.filter((row: Record<string, unknown>) => {
        const title = `${norm(row.title)} ${norm(row.job_title)}`;
        const body = `${title} ${norm(row.description)} ${norm(row.job_description)}`;
        const place = `${norm(row.location)} ${norm(row.location_city)} ${norm(row.location_state)}`;

        if (remoteOnly && !row.is_remote && !place.includes('remote')) return false;
        if (keys.length && !keys.some((k) => body.includes(k))) return false;
        if (locs.length && !locs.some((l) => place.includes(l))) return false;
        return true;
      });

      setTotal(matched.length);
      setJobs(
        matched.slice(0, limit).map((row: Record<string, any>) => ({
          id: String(row.id),
          title: row.title || row.job_title || 'Open role',
          company_name: row.company_name ?? null,
          location: row.location || row.location_city || null,
          salary_min: row.salary_min ?? null,
          salary_max: row.salary_max ?? null,
          employment_type: row.employment_type ?? null,
          is_remote: row.is_remote ?? null,
        })),
      );
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [keyList, locList, remoteOnly, limit]);

  return { jobs, total, loading };
}
