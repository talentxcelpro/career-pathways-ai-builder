import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LearningAnalytics {
  id: string;
  user_id: string;
  course_id: string;
  total_time_spent: number;
  lessons_completed: number;
  quiz_scores: number[];
  engagement_score: number;
  completion_rate: number;
  last_accessed: string;
  analytics_data: {
    daily_progress?: Record<string, number>;
    skill_improvements?: Record<string, number>;
    learning_streaks?: number;
    preferred_learning_times?: string[];
  };
}

export const useLearningAnalytics = (userId?: string) => {
  return useQuery({
    queryKey: ['learning-analytics', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_learning_analytics')
        .select(`
          *,
          courses (
            title,
            duration_hours
          )
        `)
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) throw error;
      return data as LearningAnalytics[];
    },
    enabled: !!userId,
  });
};

export const useCourseAnalytics = (courseId: string, userId?: string) => {
  return useQuery({
    queryKey: ['course-analytics', courseId, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LearningAnalytics | null;
    },
    enabled: !!userId && !!courseId,
  });
};

export const useUserLearningStats = (userId?: string) => {
  return useQuery({
    queryKey: ['user-learning-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('user_learning_analytics')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Calculate aggregate stats
      const totalTimeSpent = data.reduce((sum, record) => sum + (record.total_time_spent || 0), 0);
      const totalLessonsCompleted = data.reduce((sum, record) => sum + (record.lessons_completed || 0), 0);
      const averageEngagementScore = data.length > 0 
        ? data.reduce((sum, record) => sum + (record.engagement_score || 0), 0) / data.length
        : 0;
      const coursesInProgress = data.filter(record => record.completion_rate < 100).length;
      const coursesCompleted = data.filter(record => record.completion_rate >= 100).length;

      return {
        totalTimeSpent,
        totalLessonsCompleted,
        averageEngagementScore,
        coursesInProgress,
        coursesCompleted,
        totalCourses: data.length,
        rawData: data
      };
    },
    enabled: !!userId,
  });
};