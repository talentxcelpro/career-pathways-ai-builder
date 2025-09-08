import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobFocusedCourse {
  id: string;
  title: string;
  description: string;
  provider: string;
  duration_hours: number;
  difficulty_level: string;
  skills_taught: string[];
  job_relevance_score: number;
  industry_alignment: string[];
  certification_available: boolean;
  cost: number;
  is_free: boolean;
  external_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillDemandTrend {
  id: string;
  skill_name: string;
  industry: string;
  location: string;
  demand_level: string;
  growth_rate: number;
  avg_salary_min: number;
  avg_salary_max: number;
  job_openings_count: number;
  trend_date: string;
  data_source: string;
  confidence_score: number;
  related_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_type: 'platform' | 'job_focused';
  progress_percentage: number;
  lessons_completed: number;
  total_lessons: number;
  time_spent_hours: number;
  current_lesson_id?: string;
  completion_date?: string;
  certificate_earned: boolean;
  skills_acquired: string[];
  performance_score: number;
  created_at: string;
  updated_at: string;
}

export const useLearningJobIntegration = () => {
  const [jobFocusedCourses, setJobFocusedCourses] = useState<JobFocusedCourse[]>([]);
  const [skillTrends, setSkillTrends] = useState<SkillDemandTrend[]>([]);
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch job-focused courses
  const fetchJobFocusedCourses = async (industry?: string, skillRequired?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('job_focused_courses')
        .select('*')
        .order('job_relevance_score', { ascending: false });

      if (industry) {
        query = query.contains('industry_alignment', [industry]);
      }

      if (skillRequired) {
        query = query.contains('skills_taught', [skillRequired]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobFocusedCourses(data || []);
    } catch (error) {
      console.error('Error fetching job-focused courses:', error);
      toast.error('Failed to load job-focused courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch skill demand trends
  const fetchSkillTrends = async (location = 'India') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('skill_demand_trends')
        .select('*')
        .eq('location', location)
        .order('growth_rate', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSkillTrends(data || []);
    } catch (error) {
      console.error('Error fetching skill trends:', error);
      toast.error('Failed to load skill trends');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's learning progress
  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_course_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast.error('Failed to load learning progress');
    } finally {
      setIsLoading(false);
    }
  };

  // Update course progress
  const updateCourseProgress = async (courseId: string, progressData: Partial<UserCourseProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...progressData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      await fetchUserProgress(); // Refresh progress
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  // Get course recommendations based on job market
  const getJobBasedRecommendations = async (targetRole?: string, industry?: string) => {
    try {
      // Get high-demand skills for the target role/industry
      let skillsQuery = supabase
        .from('skill_demand_trends')
        .select('skill_name, demand_level, growth_rate')
        .eq('demand_level', 'high')
        .order('growth_rate', { ascending: false });

      if (industry) {
        skillsQuery = skillsQuery.eq('industry', industry);
      }

      const { data: demandSkills } = await skillsQuery.limit(10);

      if (!demandSkills) return [];

      // Find courses that teach these high-demand skills
      const skillNames = demandSkills.map(skill => skill.skill_name);
      const { data: recommendedCourses } = await supabase
        .from('job_focused_courses')
        .select('*')
        .overlaps('skills_taught', skillNames)
        .order('job_relevance_score', { ascending: false })
        .limit(5);

      return recommendedCourses || [];
    } catch (error) {
      console.error('Error getting job-based recommendations:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchJobFocusedCourses();
    fetchSkillTrends();
    fetchUserProgress();
  }, []);

  return {
    jobFocusedCourses,
    skillTrends,
    userProgress,
    isLoading,
    fetchJobFocusedCourses,
    fetchSkillTrends,
    fetchUserProgress,
    updateCourseProgress,
    getJobBasedRecommendations
  };
};