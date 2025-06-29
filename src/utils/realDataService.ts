
import { supabase } from '@/integrations/supabase/client';

export const realDataService = {
  getDashboardStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's job applications
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id);

      // Get user's profile views
      const { data: profileViews } = await supabase
        .from('profile_views')
        .select('*')
        .eq('profile_id', user.id);

      // Mock courses completed (this would come from learning system)
      const coursesCompleted = Math.floor(Math.random() * 5) + 1;

      // Mock resume views (this would come from resume system)
      const resumeViews = Math.floor(Math.random() * 50) + 10;

      return {
        coursesCompleted,
        resumeViews,
        appliedJobs: applications?.length || 0,
        profileViews: profileViews?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        coursesCompleted: 0,
        resumeViews: 0,
        appliedJobs: 0,
        profileViews: 0,
      };
    }
  },

  getFeaturedJobs: async () => {
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            location
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      return jobs || [];
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      return [];
    }
  },

  getPopularCourses: async () => {
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('enrolled_count', { ascending: false })
        .limit(6);

      return courses || [];
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      return [];
    }
  },
};
