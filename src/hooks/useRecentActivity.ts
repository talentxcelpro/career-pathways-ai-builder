
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: applications } = await supabase
        .from('job_applications')
        .select(`
          applied_at,
          profiles!fk_job_applications_user_id(full_name),
          jobs!fk_job_applications_job_id(title)
        `)
        .order('applied_at', { ascending: false })
        .limit(10);

      return applications?.map(app => ({
        profiles: app.profiles as { full_name: string } | null,
        jobs: app.jobs as { title: string } | null,
        applied_at: app.applied_at
      })) || [];
    }
  });
};
