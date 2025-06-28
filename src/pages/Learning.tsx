
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { AIRecommendations } from '@/components/learning/AIRecommendations';
import { EnhancedSearchFilters } from '@/components/learning/EnhancedSearchFilters';
import { LearningProgress } from '@/components/learning/LearningProgress';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { realDataService } from '@/utils/realDataService';
import { updateMetaTags } from '@/utils/metaTags';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    duration: '',
    skills: [] as string[],
  });

  // Auto-refresh for learning content
  const { manualRefresh } = useAutoRefresh({
    queryKeys: ['courses', 'learning_paths', 'user_courses'],
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
    staleTime: 10 * 60 * 1000,
  });

  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: realDataService.getAllLearningPaths,
    staleTime: 10 * 60 * 1000,
  });

  // Get user's enrolled courses
  const { data: userCourses = [], refetch: refetchUserCourses } = useQuery({
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

  // Generate AI recommendations based on user's profile and enrolled courses
  const { data: aiRecommendations = [] } = useQuery({
    queryKey: ['ai_recommendations', userCourses.length],
    queryFn: async () => {
      if (courses.length === 0) return [];
      
      // Simple AI recommendation logic based on enrolled courses and skills
      const enrolledCourseIds = userCourses.map(uc => uc.course_id);
      const enrolledSkills = userCourses.flatMap(uc => uc.courses?.skills_taught || []);
      
      // Recommend courses with similar skills or complementary skills
      const recommendations = courses
        .filter(course => !enrolledCourseIds.includes(course.id))
        .filter(course => {
          const courseSkills = course.skills_taught || [];
          return courseSkills.some(skill => enrolledSkills.includes(skill)) ||
                 (enrolledSkills.length === 0 && course.difficulty_level === 'beginner');
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
        
      return recommendations;
    },
    enabled: courses.length > 0,
  });

  const isLoading = coursesLoading || pathsLoading;

  // Get all available skills for filtering
  const availableSkills = [...new Set(courses.flatMap(course => course.skills_taught || []))];

  // Enhanced filtering logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesDifficulty = !filters.difficulty || course.difficulty_level === filters.difficulty;
    
    const matchesDuration = !filters.duration || (() => {
      const hours = course.duration_hours || 0;
      switch (filters.duration) {
        case 'short': return hours < 5;
        case 'medium': return hours >= 5 && hours <= 20;
        case 'long': return hours > 20;
        default: return true;
      }
    })();

    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.some(skill => course.skills_taught?.includes(skill));
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration && matchesSkills;
  });

  const isEnrolled = (courseId: string) => {
    return userCourses.some(uc => uc.course_id === courseId);
  };

  const enrollInCourse = async (courseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Successfully enrolled in course!');
      refetchUserCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
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

        {/* Learning Progress */}
        <LearningProgress userCourses={userCourses} />

        {/* AI Recommendations */}
        <AIRecommendations 
          recommendations={aiRecommendations}
          onEnroll={enrollInCourse}
          isEnrolled={isEnrolled}
        />

        {/* Enhanced Search and Filters */}
        <EnhancedSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableSkills={availableSkills}
        />

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
