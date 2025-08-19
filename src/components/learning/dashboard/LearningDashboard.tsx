import React, { useState } from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningFilters } from './LearningFilters';
import { AIRecommendations } from './AIRecommendations';
import { SkillBasedLearning } from './SkillBasedLearning';
import { CommunityLearning } from './CommunityLearning';
import { TrendingCourses } from './TrendingCourses';
import { CourseCard } from './CourseCard';
import { useLearningData } from '@/hooks/useLearningData';

export const LearningDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const {
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

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
  };

  const handleWishlist = (courseId: string) => {
    setWishlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Don't change */}
      <LearningHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <LearningFilters
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* AI Recommendations */}
            <section data-ai-recommendations>
              <AIRecommendations 
                courses={filteredCourses.slice(0, 6)}
                onEnroll={handleEnroll}
                onWishlist={handleWishlist}
                enrolledCourses={enrolledCourses}
                wishlist={wishlist}
              />
            </section>

            {/* Skill-Based Learning */}
            <section>
              <SkillBasedLearning 
                courses={filteredCourses}
                onEnroll={handleEnroll}
                onWishlist={handleWishlist}
                enrolledCourses={enrolledCourses}
                wishlist={wishlist}
              />
            </section>

            {/* Community Learning */}
            <section>
              <CommunityLearning 
                courses={filteredCourses.filter(course => course.enrolled_count > 100)}
                onEnroll={handleEnroll}
                onWishlist={handleWishlist}
                enrolledCourses={enrolledCourses}
                wishlist={wishlist}
              />
            </section>

            {/* Trending Courses */}
            <section>
              <TrendingCourses 
                courses={filteredCourses.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0)).slice(0, 8)}
                onEnroll={handleEnroll}
                onWishlist={handleWishlist}
                enrolledCourses={enrolledCourses}
                wishlist={wishlist}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};