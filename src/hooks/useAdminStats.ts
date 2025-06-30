
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeJobs },
        { count: totalCompanies },
        { count: totalCourses },
        { count: totalApplications },
        { count: pendingEmployerRequests }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('employer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeJobs: activeJobs || 0,
        totalCompanies: totalCompanies || 0,
        totalCourses: totalCourses || 0,
        totalApplications: totalApplications || 0,
        pendingEmployerRequests: pendingEmployerRequests || 0
      };
    }
  });
};
