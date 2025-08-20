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
    interval = 2000,
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
        .select('*')
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
        .select('*')
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
        .select('*')
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

export const REFRESH_INTERVALS = {
  FAST: 1000,
  NORMAL: 2000,
  SLOW: 5000,
  JOBS: 2000,
  COMPANIES: 3000,
  NETWORK: 1500
};