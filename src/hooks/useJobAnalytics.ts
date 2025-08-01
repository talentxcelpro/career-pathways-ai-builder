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

        // For now, use mock data for external redirects until types are updated
        // This will be replaced with actual data once the DB schema is synced
        const totalInternal = internalCount || 0;
        const totalExternal = Math.floor(Math.random() * 50); // Mock data
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