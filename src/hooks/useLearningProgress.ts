import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  course_provider: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  current_streak: number;
  last_accessed: string;
  is_completed: boolean;
  completion_date?: string;
  certificate_url?: string;
  skill_tags: string[];
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface SkillGap {
  skill_name: string;
  current_level: number;
  target_level: number;
  recommended_courses: string[];
  priority: 'high' | 'medium' | 'low';
}

export const useLearningProgress = () => {
  const queryClient = useQueryClient();

  // Fetch learning progress
  const { data: progress = [], isLoading, error } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CourseProgress[];
    },
    retry: 1
  });

  // Fetch learning streak
  const { data: streak } = useQuery({
    queryKey: ['learning-streak'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Calculate streak from learning activities
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data, error } = await supabase
        .from('learning_progress')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', lastWeek.toISOString());

      if (error) throw error;

      // Calculate streak logic (simplified)
      const uniqueDates = new Set(
        data?.map(item => item.created_at.split('T')[0]) || []
      );

      return {
        current_streak: uniqueDates.size,
        longest_streak: uniqueDates.size, // Would be calculated from historical data
        last_activity_date: data?.[0]?.created_at || new Date().toISOString()
      } as LearningStreak;
    }
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      courseId, 
      progressPercentage, 
      completedLessons 
    }: {
      courseId: string;
      progressPercentage: number;
      completedLessons: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        progress_percentage: progressPercentage,
        completed_lessons: completedLessons,
        created_at: new Date().toISOString()
      };

      if (progressPercentage >= 100) {
        updateData.is_completed = true;
        updateData.completion_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updateData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      queryClient.invalidateQueries({ queryKey: ['learning-streak'] });
      
      if (data.is_completed) {
        toast.success(`Congratulations! You completed ${data.course_title}!`);
      } else {
        toast.success('Progress updated!');
      }
    },
    onError: (error) => {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  });

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (courseData: {
      course_id: string;
      course_title: string;
      course_provider: string;
      total_lessons: number;
      skill_tags: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('learning_progress')
        .insert({
          user_id: user.id,
          ...courseData,
          progress_percentage: 0,
          completed_lessons: 0,
          current_streak: 0,
          is_completed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
      toast.success('Course added to your learning path!');
    },
    onError: (error) => {
      console.error('Error adding course:', error);
      toast.error('Failed to add course');
    }
  });

  // Get course recommendations based on skill gaps
  const getRecommendations = () => {
    // This would typically call an AI service
    // For now, return mock data based on incomplete courses
    const incompleteCourses = progress.filter(course => !course.is_completed);
    const completedSkills = progress
      .filter(course => course.is_completed)
      .flatMap(course => course.skill_tags);

    return {
      skillGaps: [
        {
          skill_name: 'React Advanced',
          current_level: 3,
          target_level: 5,
          recommended_courses: ['Advanced React Patterns', 'React Performance'],
          priority: 'high' as const
        },
        {
          skill_name: 'TypeScript',
          current_level: 2,
          target_level: 4,
          recommended_courses: ['TypeScript Masterclass'],
          priority: 'medium' as const
        }
      ] as SkillGap[],
      recommendedCourses: [
        'Machine Learning Fundamentals',
        'Cloud Architecture',
        'System Design'
      ]
    };
  };

  return {
    progress,
    streak,
    isLoading,
    error,
    updateProgress: updateProgressMutation.mutate,
    addCourse: addCourseMutation.mutate,
    getRecommendations,
    isUpdating: updateProgressMutation.isPending,
    isAdding: addCourseMutation.isPending
  };
};