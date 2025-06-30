
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { LearningStatsCards } from '@/components/admin/learning/LearningStatsCards';
import { LearningFilters } from '@/components/admin/learning/LearningFilters';
import { CoursesList } from '@/components/admin/learning/CoursesList';
import { LearningPathsList } from '@/components/admin/learning/LearningPathsList';
import { useLearningManagement } from '@/hooks/useLearningManagement';

const LearningManagement = () => {
  const {
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
    isLoading,
    handleToggleCourseStatus,
    handleDeleteCourse
  } = useLearningManagement();

  return (
    <UnifiedAdminLayout 
      title="Learning Management" 
      description="Manage courses and learning paths"
    >
      <div className="space-y-8">
        <LearningStatsCards learningStats={learningStats} />

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'courses'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses ({courses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'paths'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Learning Paths ({learningPaths?.length || 0})
          </button>
        </div>

        <LearningFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          activeTab={activeTab}
          learningStats={learningStats}
          courses={courses || []}
          learningPaths={learningPaths || []}
        />

        {activeTab === 'courses' ? (
          <CoursesList
            courses={courses || []}
            isLoading={isLoading}
            onToggleStatus={handleToggleCourseStatus}
            onDeleteCourse={handleDeleteCourse}
          />
        ) : (
          <LearningPathsList
            learningPaths={learningPaths || []}
            isLoading={isLoading}
          />
        )}
      </div>
    </UnifiedAdminLayout>
  );
};

export default LearningManagement;
