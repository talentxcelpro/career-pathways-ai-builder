import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobAnalytics {
  total_internal_applications: number;
  total_external_redirects: number;
  redirect_conversion_rate: number;
  last_updated: string;
}

export const useJobAnalytics = (jobId: string) => {
  return useQuery({
    queryKey: ['job-analytics', jobId],
    queryFn: async (): Promise<JobAnalytics | null> => {
      try {
        // Get internal applications count
        const { count: internalCount } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', jobId);

        // Get external redirects count via SQL query
        const { data: redirectData, error: redirectError } = await supabase
          .rpc('count_external_redirects', { job_uuid: jobId });

        if (redirectError) {
          console.error('Error fetching redirect count:', redirectError);
        }

        const totalInternal = internalCount || 0;
        const totalExternal = redirectData || 0;
        const conversionRate = totalExternal > 0 ? (totalInternal / totalExternal) * 100 : 0;

        return {
          total_internal_applications: totalInternal,
          total_external_redirects: totalExternal,
          redirect_conversion_rate: conversionRate,
          last_updated: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching job analytics:', error);
        return null;
      }
    },
    enabled: !!jobId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time analytics
  });
};

export const useJobRedirectHistory = (jobId?: string) => {
  return useQuery({
    queryKey: ['job-redirects', jobId],
    queryFn: async () => {
      if (!jobId) return [];

      try {
        // Use RPC to get redirect history since table types aren't loaded yet
        const { data, error } = await supabase
          .rpc('get_job_redirect_history', { job_uuid: jobId });

        if (error) {
          console.error('Error fetching redirect history:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Failed to fetch redirect history:', error);
        return [];
      }
    },
    enabled: !!jobId,
  });
};