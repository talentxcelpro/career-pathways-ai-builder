
import React, { useState, useEffect } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { SearchAndFilters } from '@/components/learning/SearchAndFilters';
import { LearningContent } from '@/components/learning/LearningContent';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  const {
    courses,
    filteredCourses,
    filteredLearningPaths,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    isLoading
  } = useLearningData();

  // Update meta tags for SEO
  useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel - Advance Your Career',
      description: 'Discover courses, learning paths, and AI-powered recommendations to boost your skills and advance your career.',
      url: `${window.location.origin}/learning`,
    });
  }, []);

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    console.log('Enrolled in course:', courseId);
  };

  const handleBrowseCourses = () => {
    setActiveTab('courses');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600 font-medium">Loading learning content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LearningHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            {['courses', 'paths', 'my-learning'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <SearchAndFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            categories={categories}
          />
        </div>

        <LearningContent
          activeTab={activeTab}
          filteredCourses={filteredCourses}
          filteredLearningPaths={filteredLearningPaths}
          enrolledCourses={enrolledCourses}
          courses={courses}
          onEnroll={handleEnroll}
          onBrowseCourses={handleBrowseCourses}
        />
      </div>
    </div>
  );
};

export default Learning;
