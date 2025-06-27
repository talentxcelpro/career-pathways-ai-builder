
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { DataFreshness } from '@/components/shared/DataFreshness';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { realDataService } from '@/utils/realDataService';
import { updateMetaTags } from '@/utils/metaTags';

const Learning = () => {
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

  const isLoading = coursesLoading || pathsLoading;

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
            lastUpdated={new Date(dataUpdatedAt)}
            onRefresh={manualRefresh}
            isRefreshing={isLoading}
          />
        </div>

        <LearningTabs 
          courses={courses} 
          learningPaths={learningPaths}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Learning;
