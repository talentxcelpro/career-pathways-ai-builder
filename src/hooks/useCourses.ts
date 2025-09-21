import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  thumbnail_url?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  status: 'active' | 'completed' | 'paused';
  last_accessed_at?: string;
}

export const useCourses = (filters?: {
  category?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
}) => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Course[];
    }
  });

  return { courses, isLoading, error };
};

export const useCourseEnrollments = (userId?: string) => {
  return useQuery({
    queryKey: ['course-enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            instructor_name,
            thumbnail_url,
            category,
            difficulty_level,
            duration_hours
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};

export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, userId }: { courseId: string; userId: string }) => {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        throw new Error('Already enrolled in this course');
      }

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll in course');
    }
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      enrollmentId, 
      progressPercentage 
    }: { 
      enrollmentId: string; 
      progressPercentage: number 
    }) => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .update({
          progress_percentage: progressPercentage,
          last_accessed_at: new Date().toISOString(),
          status: progressPercentage >= 100 ? 'completed' : 'active'
        })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-enrollments'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update progress');
    }
  });
};

export const useCourseCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });
};