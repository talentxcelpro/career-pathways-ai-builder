
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
        .select(`
          *,
          youtube_video_id,
          youtube_playlist_id,
          youtube_channel_name,
          video_duration,
          view_count,
          like_count,
          content_type,
          external_url,
          language
        `)
        .eq('is_active', true)
        .order('enrolled_count', { ascending: false })
        .limit(6);

      return courses || [];
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      return [];
    }
  },

  getAllCourses: async () => {
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select(`
          *,
          youtube_video_id,
          youtube_playlist_id,
          youtube_channel_name,
          video_duration,
          view_count,
          like_count,
          content_type,
          external_url,
          language
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return courses || [];
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  },

  getAllLearningPaths: async () => {
    try {
      const { data: learningPaths } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      return learningPaths || [];
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      return [];
    }
  },

  // Job-focused learning services
  getJobFocusedCourses: async (filters?: { industry?: string; skill?: string }) => {
    try {
      let query = supabase
        .from('job_focused_courses')
        .select('*')
        .order('job_relevance_score', { ascending: false });

      if (filters?.industry) {
        query = query.contains('industry_alignment', [filters.industry]);
      }

      if (filters?.skill) {
        query = query.contains('skills_taught', [filters.skill]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching job-focused courses:', error);
      return [];
    }
  },

  getSkillDemandTrends: async (location = 'India') => {
    try {
      const { data, error } = await supabase
        .from('skill_demand_trends')
        .select('*')
        .eq('location', location)
        .order('growth_rate', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching skill demand trends:', error);
      return [];
    }
  },

  getUserCourseProgress: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user course progress:', error);
      return [];
    }
  }
};
