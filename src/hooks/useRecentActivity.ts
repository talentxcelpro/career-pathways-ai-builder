
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
          profiles!job_applications_user_id_fkey(full_name),
          jobs!job_applications_job_id_fkey(title)
        `)
        .order('applied_at', { ascending: false })
        .limit(10);

      return applications?.map(app => ({
        profiles: app.profiles as { full_name: string },
        jobs: app.jobs as { title: string },
        applied_at: app.applied_at
      })) || [];
    }
  });
};
