
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { realDataService } from '@/utils/realDataService';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    duration: '',
  });

  // Auto-refresh for learning content
  const { manualRefresh } = useAutoRefresh({
    queryKeys: ['courses', 'learning_paths', 'popular_courses'],
    interval: 10 * 60 * 1000, // 10 minutes
  });

  // Meta tags
  useEffect(() => {
    updateMetaTags({
      title: 'Learn & Grow | TalentXcel Learning Platform',
      description: 'Advance your career with expert-led courses, learning paths, and skill development programs. Learn in-demand skills at your own pace.',
      url: `${window.location.origin}/learning`,
    });
  }, []);

  // Fetch learning data
  const { data: courses = [], isLoading: coursesLoading, dataUpdatedAt } = useQuery({
    queryKey: ['courses'],
    queryFn: realDataService.getAllCourses,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: realDataService.getAllLearningPaths,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user's enrolled courses
  const { data: userCourses = [] } = useQuery({
    queryKey: ['user_courses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = coursesLoading || pathsLoading;

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesDifficulty = !filters.difficulty || course.difficulty_level === filters.difficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const isEnrolled = (courseId: string) => {
    return userCourses.some(uc => uc.course_id === courseId);
  };

  const enrollInCourse = async (courseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <LearningHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Hub</h1>
            <p className="text-gray-600 mt-1">Discover courses and learning paths to advance your career</p>
          </div>
          <DataFreshness 
            lastUpdated={new Date(dataUpdatedAt || Date.now())}
            onRefresh={manualRefresh}
            isRefreshing={isLoading}
          />
        </div>

        <LearningTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredCourses={filteredCourses}
          coursesLoading={coursesLoading}
          learningPaths={learningPaths}
          pathsLoading={pathsLoading}
          userCourses={userCourses}
          isEnrolled={isEnrolled}
          enrollInCourse={enrollInCourse}
        />
      </div>
    </div>
  );
};

export default Learning;
