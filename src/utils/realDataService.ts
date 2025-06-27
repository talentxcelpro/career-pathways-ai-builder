
import { supabase } from '@/integrations/supabase/client';

// Real data service to replace all mock data
export const realDataService = {
  // Jobs service
  async getFeaturedJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry
        )
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async getAllJobs(filters?: any) {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry
        )
      `)
      .eq('is_active', true);

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters?.title) {
      query = query.ilike('title', `%${filters.title}%`);
    }
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    if (filters?.is_remote !== undefined) {
      query = query.eq('is_remote', filters.is_remote);
    }

    const { data, error } = await query
      .order('posted_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  // Companies service
  async getAllCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Courses service
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPopularCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('enrolled_count', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  },

  // Learning paths service
  async getAllLearningPaths() {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // User profiles service
  async getPublicProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_profile_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  // Dashboard stats service
  async getDashboardStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [jobsCount, applicationsCount, savedJobsCount, profileViews] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
    ]);

    return {
      totalJobs: jobsCount.count || 0,
      appliedJobs: applicationsCount.count || 0,
      savedJobs: savedJobsCount.count || 0,
      profileViews: profileViews.count || 0,
    };
  },

  // Salary data service
  async getSalaryData(jobTitle?: string, location?: string) {
    let query = supabase.from('salary_data').select('*');
    
    if (jobTitle) {
      query = query.ilike('job_title', `%${jobTitle}%`);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  },
};
