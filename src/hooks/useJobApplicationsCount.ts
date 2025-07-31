import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useJobApplicationsCount = (userId?: string) => {
  return useQuery({
    queryKey: ['job-applications-count', userId],
    queryFn: async () => {
      if (!userId) return { total: 0, thisWeek: 0, thisMonth: 0 };

      const { data: applications, error } = await supabase
        .from('job_applications')
        .select('id, applied_at')
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching job applications count:', error);
        throw error;
      }

      const total = applications?.length || 0;
      
      // Calculate this week and month counts
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const thisWeek = applications?.filter(app => 
        new Date(app.applied_at) >= oneWeekAgo
      ).length || 0;

      const thisMonth = applications?.filter(app => 
        new Date(app.applied_at) >= oneMonthAgo
      ).length || 0;

      return { total, thisWeek, thisMonth };
    },
    enabled: !!userId,
  });
};