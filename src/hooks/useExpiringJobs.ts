import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExpiringJob {
  id: string;
  title: string;
  daysLeft: number;
  applications_count: number;
  urgency: 'critical' | 'warning' | 'notice';
  posted_at: string;
  company_name: string;
}

export const useExpiringJobs = () => {
  return useQuery({
    queryKey: ['expiring-jobs'],
    queryFn: async () => {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, title, posted_at, applications_count, company_name')
        .eq('status', 'active')
        .gte('posted_at', new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()) // Last 10 days
        .order('posted_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      const expiringJobs: ExpiringJob[] = (jobs || []).map(job => {
        const postedDate = new Date(job.posted_at);
        const expiryDate = new Date(postedDate.getTime() + 10 * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        let urgency: 'critical' | 'warning' | 'notice' = 'notice';
        if (daysLeft <= 2) urgency = 'critical';
        else if (daysLeft <= 5) urgency = 'warning';

        return {
          id: job.id,
          title: job.title,
          daysLeft: Math.max(0, daysLeft),
          applications_count: job.applications_count || 0,
          urgency,
          posted_at: job.posted_at,
          company_name: job.company_name || 'Company'
        };
      }).filter(job => job.daysLeft <= 8); // Only show jobs expiring in 8 days or less

      return expiringJobs;
    },
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });
};