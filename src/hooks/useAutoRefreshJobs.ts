import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';

const fetcher = async (url: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url,
        industry
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export function useAutoRefreshJobs() {
  const { data, error, isLoading, mutate } = useSWR('jobs', fetcher, {
    refreshInterval: 15000, // 15 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000, // Dedupe requests within 10s
  });

  return {
    jobs: data || [],
    error,
    isLoading,
    refresh: mutate
  };
}