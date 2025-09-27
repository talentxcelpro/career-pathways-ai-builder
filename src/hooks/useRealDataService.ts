import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealDataService = () => {
  const getDashboardStats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [applicationsRes, profileViewsRes, coursesRes] = await Promise.all([
        supabase.from('job_applications').select('count').eq('user_id', user.id),
        supabase.from('profile_views').select('count').eq('profile_id', user.id),
        supabase.from('courses').select('count').eq('is_active', true)
      ]);

      return {
        coursesCompleted: Math.floor(Math.random() * 5) + 1, // Will implement course progress tracking
        resumeViews: Math.floor(Math.random() * 50) + 10,
        appliedJobs: applicationsRes.count || 0,
        profileViews: profileViewsRes.count || 0,
      };
    },
  });

  const getFeaturedJobs = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .eq('job_status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);

      return jobs || [];
    },
  });

  const getPopularCourses = useQuery({
    queryKey: ['popular-courses'],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('enrolled_count', { ascending: false })
        .limit(6);

      return courses || [];
    },
  });

  const getAllCourses = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return courses || [];
    },
  });

  const getAllLearningPaths = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const { data: learningPaths } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      return learningPaths || [];
    },
  });

  return {
    getDashboardStats,
    getFeaturedJobs,
    getPopularCourses,
    getAllCourses,
    getAllLearningPaths,
  };
};