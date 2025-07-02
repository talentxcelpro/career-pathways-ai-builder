
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
        { count: pendingEmployerRequests },
        { count: totalPosts },
        { count: totalResumes },
        { count: recentLogins }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('job_applications').select('*', { count: 'exact', head: true }),
        supabase.from('employer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('ai_resumes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('last_login_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Get additional analytics
      const [
        { data: topCompanies },
        { data: recentActivity },
        { data: growthData }
      ] = await Promise.all([
        supabase.from('companies')
          .select('name, id')
          .eq('is_verified', true)
          .limit(5),
        supabase.from('profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('job_applications')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeJobs: activeJobs || 0,
        totalCompanies: totalCompanies || 0,
        totalCourses: totalCourses || 0,
        totalApplications: totalApplications || 0,
        pendingEmployerRequests: pendingEmployerRequests || 0,
        totalPosts: totalPosts || 0,
        totalResumes: totalResumes || 0,
        recentLogins: recentLogins || 0,
        topCompanies: topCompanies || [],
        weeklyNewUsers: recentActivity?.length || 0,
        monthlyApplications: growthData?.length || 0
      };
    },
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });
};
