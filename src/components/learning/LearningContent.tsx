import React from 'react';
import { CourseCard } from './CourseCard';
import { LearningPathCard } from './LearningPathCard';
import { AIRecommendations } from './AIRecommendations';
import { EmptyMyLearning } from './EmptyMyLearning';
import { Course, LearningPath } from './types';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Grid3X3, TrendingUp, Award } from 'lucide-react';

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
  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  if (activeTab === 'courses') {
    return (
      <div className="space-y-6">
        {/* AI Recommendations with compact design */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">AI Recommended</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              Personalized
            </Badge>
          </div>
          <AIRecommendations 
            recommendations={filteredCourses.slice(0, 3).map(course => ({
              ...course,
              skills_taught: course.skills_taught || []
            }))}
            onEnroll={onEnroll}
            isEnrolled={isEnrolled}
          />
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
