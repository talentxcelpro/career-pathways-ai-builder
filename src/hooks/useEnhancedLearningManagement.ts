import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnhancedLearningManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Enhanced courses query with more data
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['enhanced-courses', searchTerm, categoryFilter, difficultyFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          course_enrollments(count),
          course_lessons(count),
          course_reviews(avg(rating)),
          instructors:profiles!courses_instructor_id_fkey(
            full_name,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty_level', difficultyFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Enhanced learning paths with course data
  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ['enhanced-learning-paths', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('learning_paths')
        .select(`
          *,
          learning_path_courses(
            courses(title, duration_hours)
          ),
          learning_path_enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Comprehensive learning statistics
  const { data: learningStats } = useQuery({
    queryKey: ['enhanced-learning-stats'],
    queryFn: async () => {
      const [
        { count: totalCourses },
        { count: activeCourses },
        { count: totalPaths },
        { count: totalEnrollments },
        { count: totalLessons },
        { count: totalAssessments },
        { count: certificatesIssued },
        { data: categories },
        { data: recentActivity }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('learning_paths').select('*', { count: 'exact', head: true }),
        supabase.from('course_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('course_lessons').select('*', { count: 'exact', head: true }),
        supabase.from('course_assessments').select('*', { count: 'exact', head: true }),
        supabase.from('course_certificates').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('category').not('category', 'is', null),
        supabase.from('course_enrollments')
          .select('*, courses(title), profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
      
      // Calculate revenue (if courses have pricing)
      const { data: courseRevenue } = await supabase
        .from('course_enrollments')
        .select('courses(price)')
        .not('courses.price', 'is', null);
      
      const totalRevenue = courseRevenue?.reduce((sum, enrollment) => {
        return sum + ((enrollment.courses as any)?.price || 0);
      }, 0) || 0;

      return {
        totalCourses: totalCourses || 0,
        activeCourses: activeCourses || 0,
        totalPaths: totalPaths || 0,
        totalEnrollments: totalEnrollments || 0,
        totalLessons: totalLessons || 0,
        totalAssessments: totalAssessments || 0,
        certificatesIssued: certificatesIssued || 0,
        totalRevenue,
        categories: uniqueCategories,
        recentActivity: recentActivity || []
      };
    }
  });

  // Course management mutations
  const createCourse = useMutation({
    mutationFn: async (courseData: any) => {
      const { error } = await supabase
        .from('courses')
        .insert(courseData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create course');
    }
  });

  const updateCourse = useMutation({
    mutationFn: async ({ courseId, updates }: { courseId: string; updates: any }) => {
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update course');
    }
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete course');
    }
  });

  // Learning path management
  const createLearningPath = useMutation({
    mutationFn: async (pathData: any) => {
      const { error } = await supabase
        .from('learning_paths')
        .insert(pathData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Learning path created successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-learning-paths'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create learning path');
    }
  });

  // Bulk operations
  const bulkEnrollUsers = useMutation({
    mutationFn: async ({ courseId, userIds }: { courseId: string; userIds: string[] }) => {
      const enrollments = userIds.map(userId => ({
        course_id: courseId,
        user_id: userId,
        enrolled_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('course_enrollments')
        .insert(enrollments);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Users enrolled successfully');
      queryClient.invalidateQueries({ queryKey: ['enhanced-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to enroll users');
    }
  });

  return {
    // State
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    statusFilter,
    setStatusFilter,
    
    // Data
    courses,
    learningPaths,
    learningStats,
    isLoading: coursesLoading || pathsLoading,
    
    // Mutations
    createCourse,
    updateCourse,
    deleteCourse,
    createLearningPath,
    bulkEnrollUsers
  };
};