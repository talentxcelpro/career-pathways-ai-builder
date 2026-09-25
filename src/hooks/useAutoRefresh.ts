import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AutoRefreshOptions {
  interval?: number; // milliseconds, default 2000 (2s)
  enabled?: boolean; // default true
  dependencies?: any[]; // refresh when these change
}

/**
 * Auto-refresh hook with polling fallback for when realtime fails
 * Fetches fresh data every X seconds without reloading the URL
 */
export function useAutoRefresh<T>(
  fetchFunction: () => Promise<T>,
  options: AutoRefreshOptions = {}
) {
  const {
    interval = 60000, // raised from 2000ms — 2s default was creating unintentional polling storms
    enabled = true,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const fetchFunctionRef = useRef(fetchFunction);
  fetchFunctionRef.current = fetchFunction;

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchFunctionRef.current();
      setData(result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err as Error);
      console.error('Auto-refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, ...dependencies]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval, fetchData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh: fetchData
  };
}

/**
 * Auto-refresh jobs with polling fallback
 */
export function useAutoRefreshJobs(options: AutoRefreshOptions = {}) {
  return useAutoRefresh(
    async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, employment_type, salary_min, salary_max, is_remote, created_at, is_active, job_status')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    options
  );
}

/**
 * Auto-refresh posts with polling fallback
 */
export function useAutoRefreshPosts(options: AutoRefreshOptions = {}) {
  return useAutoRefresh(
    async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, author_id, created_at, likes_count, comments_count, post_type, media_url')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    options
  );
}

/**
 * Auto-refresh companies with polling fallback
 */
export function useAutoRefreshCompanies(options: AutoRefreshOptions = {}) {
  return useAutoRefresh(
    async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url, industry, location, size, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    options
  );
}

/**
 * Auto-refresh applications with polling fallback (requires auth)
 */
export function useAutoRefreshApplications(options: AutoRefreshOptions = {}) {
  return useAutoRefresh(
    async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs(title, company_name),
          profiles(full_name)
        `)
        .order('applied_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    options
  );
}

// Legacy exports for backward compatibility
export const useSmartAutoRefresh = <T>(
  fetchFunction: (() => Promise<T>) | (() => void),
  intervalOrOptions: number | AutoRefreshOptions = {}
) => {
  // Handle legacy number parameter
  const options: AutoRefreshOptions = typeof intervalOrOptions === 'number' 
    ? { interval: intervalOrOptions }
    : intervalOrOptions;

  // Wrap sync functions to be async
  const asyncFetch = useCallback(async () => {
    const result = fetchFunction();
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  }, [fetchFunction]);

  return useAutoRefresh(asyncFetch, options);
};

// Refresh interval constants — classified by operational need.
// Use realtime subscriptions for truly real-time data; these are polling fallbacks only.
export const REFRESH_INTERVALS = {
  CRITICAL_REALTIME: 5000,    // 5s  — live bid/auction counters, active video streams
  OPERATIONAL:       60000,   // 60s — job feeds, post feeds, notification counts
  ANALYTICS:         300000,  // 5m  — dashboards, statistics, admin panels
  STATIC:            Infinity, // ∞  — reference data, config, manual refresh only
  // Legacy aliases (kept for backward-compat — point to OPERATIONAL tier)
  FAST:    60000,
  NORMAL:  60000,
  SLOW:    300000,
  JOBS:    60000,
  COMPANIES: 300000,
  NETWORK: 60000,
};