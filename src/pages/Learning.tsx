
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
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

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

  // Update meta tags and structured data for SEO
  useEffect(() => {
    updateMetaTags({
      title: 'Free Online Courses & Skill Development | TalentXcel Learning Hub',
      description: 'Learn new skills with free online courses. Programming, Data Science, AI/ML, Digital Marketing, and more. Get certified and boost your career prospects with AI-powered learning paths.',
      url: `${window.location.origin}/learning`,
      keywords: ['online courses', 'free courses', 'skill development', 'programming courses', 'data science', 'certification', 'upskilling', 'AI learning', 'career development'],
      type: 'website',
      image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    });

    // Add Course/EducationalOccupationalProgram structured data
    const learningSchema = {
      "@context": "https://schema.org/",
      "@type": "EducationalOccupationalProgram",
      "name": "TalentXcel Learning Hub",
      "description": "Comprehensive learning platform with AI-powered course recommendations",
      "url": `${window.location.origin}/learning`,
      "provider": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      },
      "educationalCredentialAwarded": "Certificate of Completion",
      "timeToComplete": "P1M",
      "applicationStartDate": new Date().toISOString(),
      "occupationalCategory": "Technology, Business, Design"
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(learningSchema);
    script.id = 'learning-schema';
    
    const existing = document.getElementById('learning-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('learning-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    console.log('Enrolled in course:', courseId);
  };

  const handleBrowseCourses = () => {
    setActiveTab('courses');
  };

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    if (aiFilters) {
      // Apply AI-parsed filters
      setSearchTerm(aiFilters.query || query);
      if (aiFilters.category) setSelectedCategory(aiFilters.category);
      if (aiFilters.difficulty_level) setSelectedDifficulty(aiFilters.difficulty_level);
    } else {
      setSearchTerm(query);
    }
  };

  // Handler for clicking feature cards
  const handleFeatureCardClick = (feature: string) => {
    switch (feature) {
      case 'ai-recommendations':
        // Scroll to AI recommendations section
        setActiveTab('courses');
        setTimeout(() => {
          const aiSection = document.querySelector('[data-ai-recommendations]');
          aiSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        break;
      case 'skill-based':
        // Reset filters and focus on skill-based learning
        setActiveTab('courses');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
        setSearchTerm('');
        break;
      case 'community':
        // Show community/popular courses
        setActiveTab('courses');
        setSearchTerm('');
        // Could sort by enrolled_count or add community filter
        break;
    }
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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E2A78] via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-12 w-12 rounded-lg"
              />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <Badge className="bg-white/20 text-white border-white/30 px-2 py-1 text-xs">
                  AI Learning
                </Badge>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Accelerate Your Career with Smart Learning
            </h1>
            <p className="text-sm text-blue-100 mb-4 max-w-md mx-auto">
              Master skills with AI recommendations, personalized paths, and industry insights.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Modern Tab Navigation */}
        <div className="mb-4">
          <div className="flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-white/50">
              <div className="flex space-x-1.5">
                {['courses', 'paths', 'my-learning'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
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

        {/* AI-Powered Learning Search */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <UniversalSearchBar
              searchType="learning"
              onSearch={handleUniversalSearch}
              placeholder="Try: 'free Python courses for beginners with certificates'"
              showSuggestions={true}
              showFilters={true}
              className="mb-4"
            />
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
            <Card 
              onClick={() => handleFeatureCardClick('ai-recommendations')}
              className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-blue-900 mb-2">AI Recommendations</h3>
                <p className="text-blue-700 text-xs mb-3">Personalized course suggestions</p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-800 text-xs group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              onClick={() => handleFeatureCardClick('skill-based')}
              className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-purple-900 mb-2">Skill-Based Learning</h3>
                <p className="text-purple-700 text-xs mb-3">Target specific skills</p>
                <Button variant="ghost" className="text-purple-600 hover:text-purple-800 text-xs group-hover:translate-x-1 transition-transform">
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              onClick={() => handleFeatureCardClick('community')}
              className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-xl transition-all duration-300 group cursor-pointer hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">Community Learning</h3>
                <p className="text-emerald-700 text-xs mb-3">Learn with peers</p>
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-800 text-xs group-hover:translate-x-1 transition-transform">
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
        
        {/* Footer Note */}
        <div className="text-center py-8 mt-12">
          <p className="text-sm text-text-secondary">
            Powered by TalentXcel AI – India's Intelligent Career Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Learning;
