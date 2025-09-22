// Real-time dashboard data service
import { supabase } from '@/integrations/supabase/client';
import { fetchProductionData } from '@/utils/productionCleanup';

export interface DashboardStats {
  coursesCompleted: number;
  resumeViews: number;
  appliedJobs: number;
  profileViews: number;
  newConnections: number;
  messagesReceived: number;
  skillsVerified: number;
  certificationsEarned: number;
}

export interface FeaturedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_range?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  is_remote: boolean;
  posted_at: string;
  companies?: {
    name: string;
    logo_url?: string;
    location?: string;
    is_verified: boolean;
  };
}

export interface PopularCourse {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  price: string;
  thumbnail: string;
  description: string;
  category: string;
  subcategory: string;
  is_active: boolean;
  // Compatibility with Course interface
  instructor_name?: string;
  difficulty_level?: string;
  duration_hours?: number;
  enrolled_count?: number;
  is_free?: boolean;
  skills_taught?: string[];
  thumbnail_url?: string;
}

// Real-time user dashboard stats
export const getDashboardStats = async (userId?: string): Promise<DashboardStats> => {
  if (!userId) {
    return {
      coursesCompleted: 0,
      resumeViews: 0,
      appliedJobs: 0,
      profileViews: 0,
      newConnections: 0,
      messagesReceived: 0,
      skillsVerified: 0,
      certificationsEarned: 0
    };
  }

  return fetchProductionData(async () => {
    const [
      { count: appliedJobs },
      { count: profileViews },
      { count: newConnections },
      { count: coursesCompleted },
      { count: resumeViews },
      { count: skillsVerified }
    ] = await Promise.all([
      supabase.from('job_applications').select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase.from('profile_views').select('*', { count: 'exact', head: true })
        .eq('profile_id', userId),
      supabase.from('connections').select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted'),
      supabase.from('user_course_progress').select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed'),
      supabase.from('ai_resumes').select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase.from('user_skills').select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_verified', true)
    ]);

    return {
      coursesCompleted: coursesCompleted || 0,
      resumeViews: resumeViews || 0,
      appliedJobs: appliedJobs || 0,
      profileViews: profileViews || 0,
      newConnections: newConnections || 0,
      messagesReceived: 0, // Would come from messages system
      skillsVerified: skillsVerified || 0,
      certificationsEarned: 0 // Would come from certification system
    };
  }, {
    coursesCompleted: 0,
    resumeViews: 0,
    appliedJobs: 0,
    profileViews: 0,
    newConnections: 0,
    messagesReceived: 0,
    skillsVerified: 0,
    certificationsEarned: 0
  });
};

// Real-time featured jobs
export const getFeaturedJobs = async (): Promise<FeaturedJob[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        company_name,
        location,
        salary_range,
        salary_min,
        salary_max,
        employment_type,
        is_remote,
        posted_at,
        companies (
          name,
          logo_url,
          location,
          is_verified
        )
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('job_status', 'open')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    return (data || []).map(job => ({
      ...job,
      companies: job.companies && Array.isArray(job.companies) && job.companies.length > 0 
        ? job.companies[0] 
        : undefined
    }));
  }, []);
};

// Real-time popular courses
export const getPopularCourses = async (): Promise<PopularCourse[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        instructor,
        rating,
        students,
        duration,
        level,
        price,
        thumbnail,
        description,
        category,
        subcategory,
        is_active
      `)
      .eq('is_active', true)
      .order('students', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time course data for learning section
export const getAllCourses = async (): Promise<PopularCourse[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        instructor,
        rating,
        students,
        duration,
        level,
        price,
        thumbnail,
        description,
        category,
        subcategory,
        is_active
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time learning paths
export const getAllLearningPaths = async () => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time job-focused courses
export const getJobFocusedCourses = async (filters?: { industry?: string; skill?: string }) => {
  return fetchProductionData(async () => {
    let query = supabase
      .from('job_focused_courses')
      .select('*')
      .eq('is_active', true)
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
  }, []);
};

// Real-time skill demand trends
export const getSkillDemandTrends = async (location = 'India') => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('skill_demand_trends')
      .select('*')
      .eq('location', location)
      .order('growth_rate', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time user course progress
export const getUserCourseProgress = async (userId?: string) => {
  if (!userId) return [];
  
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, []);
};