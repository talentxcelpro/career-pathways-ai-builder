
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLearningManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'courses' | 'paths'>('courses');
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['admin-courses', searchTerm, categoryFilter, difficultyFilter],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('*')
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ['admin-learning-paths', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: learningStats } = useQuery({
    queryKey: ['learning-stats'],
    queryFn: async () => {
      const [
        { count: totalCourses },
        { count: activeCourses },
        { count: totalPaths },
        { data: categories }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('learning_paths').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('category').not('category', 'is', null)
      ]);

      const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))];
      const totalEnrollments = courses?.reduce((sum, course) => sum + (course.enrolled_count || 0), 0) || 0;

      return {
        totalCourses: totalCourses || 0,
        activeCourses: activeCourses || 0,
        totalPaths: totalPaths || 0,
        totalEnrollments,
        categories: uniqueCategories
      };
    }
  });

  const toggleCourseStatus = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('courses')
        .update({ is_active: isActive })
        .eq('id', courseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update course status');
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
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete course');
    }
  });

  const handleToggleCourseStatus = (courseId: string, isActive: boolean) => {
    toggleCourseStatus.mutate({ courseId, isActive });
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse.mutate(courseId);
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    activeTab,
    setActiveTab,
    courses,
    learningPaths,
    learningStats,
    isLoading: coursesLoading || pathsLoading,
    handleToggleCourseStatus,
    handleDeleteCourse
  };
};
