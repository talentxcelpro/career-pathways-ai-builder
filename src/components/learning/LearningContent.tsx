import React, { useRef } from 'react';
import { CourseCard } from './CourseCard';
import { LearningPathCard } from './LearningPathCard';
import { AIRecommendations } from './AIRecommendations';
import { EmptyMyLearning } from './EmptyMyLearning';
import { Course, LearningPath } from './types';
import { Badge } from '@/components/ui/badge';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { Sparkles, Grid3X3, TrendingUp, Award, Brain } from 'lucide-react';

interface LearningContentProps {
  activeTab: string;
  filteredCourses: Course[];
  filteredLearningPaths: LearningPath[];
  enrolledCourses: string[];
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onBrowseCourses: () => void;
}

export const LearningContent: React.FC<LearningContentProps> = ({
  activeTab,
  filteredCourses,
  filteredLearningPaths,
  enrolledCourses,
  courses,
  onEnroll,
  onBrowseCourses
}) => {
  const aiRecommendationsRef = useRef<HTMLDivElement>(null);
  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);
  
  // Get AI recommendations
  const { personalizedRecommendations, isLoading: recommendationsLoading } = useAIRecommendations();
  
  // Transform personalized recommendations to match AIRecommendation interface
  const transformedRecommendations = personalizedRecommendations.map((rec, index) => ({
    id: `ai-rec-${index}`,
    title: rec.title,
    description: rec.description,
    difficulty_level: 'intermediate',
    duration_hours: parseInt(rec.duration.split(' ')[0]) * 7 || 40, // Convert weeks to hours estimate
    rating: rec.rating,
    enrolled_count: parseInt(rec.enrolled.replace(/,/g, '')) || 0,
    skills_taught: rec.skills || [],
    match_score: rec.aiScore,
    reason: `${rec.aiScore}% AI match - Perfect for your learning goals`,
    badge: rec.aiScore > 95 ? 'Perfect Match' as const : 
          rec.aiScore > 85 ? 'Career Boost' as const : 'Skill Builder' as const
  }));

  if (activeTab === 'courses') {
    return (
      <div className="space-y-6">
        {/* AI Recommendations with Apple-inspired design */}
        <div ref={aiRecommendationsRef} data-ai-recommendations className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl p-6 border border-white/50 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">AI Recommended for You</h3>
              <p className="text-sm text-slate-600">Personalized based on your profile and goals</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 shadow-sm ml-auto">
              {transformedRecommendations.length} Matches
            </Badge>
          </div>
          
          {recommendationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-slate-600">Generating recommendations...</span>
            </div>
          ) : (
            <AIRecommendations 
              recommendations={transformedRecommendations}
              onEnroll={onEnroll}
              isEnrolled={isEnrolled}
            />
          )}
        </div>
        
        {/* All Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Grid3X3 className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                All Courses
              </h2>
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                {filteredCourses.length}
              </Badge>
            </div>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-600 text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course: Course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    ...course,
                    category: course.category || 'General',
                    skills_taught: course.skills_taught || []
                  }}
                  isEnrolled={enrolledCourses.includes(course.id)}
                  onEnroll={onEnroll}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'paths') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Learning Paths
            </h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              {filteredLearningPaths.length}
            </Badge>
          </div>
        </div>
        
        {filteredLearningPaths.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No learning paths found</h3>
              <p className="text-slate-600 text-sm">Check back later for new learning paths</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLearningPaths.map((path: LearningPath) => (
              <LearningPathCard 
                key={path.id} 
                path={{
                  ...path,
                  target_role: path.target_role || 'General Role',
                  skills_gained: path.skills_gained || []
                }} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'my-learning') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">My Learning</h2>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              {enrolledCourses.length}
            </Badge>
          </div>
        </div>
        
        {enrolledCourses.length === 0 ? (
          <EmptyMyLearning onBrowseCourses={onBrowseCourses} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses
              .filter((course: Course) => enrolledCourses.includes(course.id))
              .map((course: Course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    ...course,
                    category: course.category || 'General',
                    skills_taught: course.skills_taught || []
                  }}
                  isEnrolled={true}
                  onEnroll={onEnroll}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
