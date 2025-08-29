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
        // Use unified analytics function for consistent data
        const { data: unifiedData, error } = await supabase.rpc('get_unified_analytics', { 
          p_job_id: jobId 
        });

        if (error) {
          console.error('Unified analytics error:', error);
          throw error;
        }

        const jobData = unifiedData?.[0];
        if (!jobData) return null;

        const totalInternal = Number(jobData.total_applications) || 0;
        const totalExternal = Number(jobData.total_external_redirects) || 0;
        const conversionRate = Number(jobData.conversion_rate) || 0;

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