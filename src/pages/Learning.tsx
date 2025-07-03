
import React, { useState, useEffect } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { SearchAndFilters } from '@/components/learning/SearchAndFilters';
import { LearningContent } from '@/components/learning/LearningContent';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, Award, Sparkles, Target, Users, ArrowRight, Play, Clock, Star } from 'lucide-react';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';

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
    isLoading,
    refetch
  } = useLearningData();

  // Auto-refresh learning data every 30 seconds
  useSmartAutoRefresh(() => {
    if (refetch) refetch();
  }, REFRESH_INTERVALS.LEARNING);

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
      case 'courses': return <BookOpen className="h-3 w-3" />;
      case 'paths': return <TrendingUp className="h-3 w-3" />;
      case 'my-learning': return <Award className="h-3 w-3" />;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="h-6 w-6 text-blue-600 absolute top-3 left-3 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-slate-700">Loading your learning journey...</p>
          <p className="text-sm text-slate-500">Personalizing content just for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-center max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-3 w-3 text-yellow-300" />
              <Badge className="bg-white/20 text-white border-white/30 px-1.5 py-0.5 text-xs">
                AI Learning
              </Badge>
            </div>
            <h1 className="text-lg font-bold mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Accelerate Your Career
            </h1>
            <p className="text-xs text-blue-100 mb-2 max-w-xs mx-auto">
              Master skills with AI recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50">
              <div className="flex space-x-2">
                {['courses', 'paths', 'my-learning'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {getTabIcon(tab)}
                      <span className="capitalize font-semibold">{tab.replace('-', ' ')}</span>
                      <Badge 
                        className={`text-xs ${
                          isActive 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {getTabCount(tab)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <SearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              categories={categories}
            />
          </CardContent>
        </Card>

        {/* AI-Powered Features Showcase */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-blue-900 mb-2">AI Recommendations</h3>
                <p className="text-blue-700 text-xs mb-3">Personalized course suggestions</p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-800 text-xs">
                  Explore <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-purple-900 mb-2">Skill-Based Learning</h3>
                <p className="text-purple-700 text-xs mb-3">Target specific skills</p>
                <Button variant="ghost" className="text-purple-600 hover:text-purple-800 text-xs">
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">Community Learning</h3>
                <p className="text-emerald-700 text-xs mb-3">Learn with peers</p>
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-800 text-xs">
                  Join <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Area */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <LearningContent
              activeTab={activeTab}
              filteredCourses={filteredCourses}
              filteredLearningPaths={filteredLearningPaths}
              enrolledCourses={enrolledCourses}
              courses={courses}
              onEnroll={handleEnroll}
              onBrowseCourses={handleBrowseCourses}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Learning;
