
import React, { useState, useEffect } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { SearchAndFilters } from '@/components/learning/SearchAndFilters';
import { LearningContent } from '@/components/learning/LearningContent';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'courses': return <BookOpen className="h-4 w-4" />;
      case 'paths': return <TrendingUp className="h-4 w-4" />;
      case 'my-learning': return <Award className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'courses': return filteredCourses.length;
      case 'paths': return filteredLearningPaths.length;
      case 'my-learning': return enrolledCourses.length;
      default: return 0;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Compact Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning Hub</h1>
              <p className="text-sm text-slate-600">Advance your career with expert-led courses</p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Live Content
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50 w-fit">
            {['courses', 'paths', 'my-learning'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab.replace('-', ' ')}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-1 text-xs ${
                    activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getTabCount(tab)}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Compact Search and Filters */}
        <div className="mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 p-4">
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
        </div>

        {/* Main Content */}
        <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-slate-200/50 p-6">
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
    </div>
  );
};

export default Learning;
