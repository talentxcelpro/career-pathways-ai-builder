import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';

const fetcher = async (url: string) => {
  const { data, error } = await supabase
    .from('ai_tools_config')
    .select('*')
    .eq('is_enabled', true)
    .order('category');

  if (error) throw error;
  return data;
};

export function useAutoRefreshTools() {
  const { data, error, isLoading, mutate } = useSWR('ai-tools', fetcher, {
    refreshInterval: 15000, // 15 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
  });

  return {
    tools: data || [],
    error,
    isLoading,
    refresh: mutate
  };
}