
import React from 'react';
import { CourseCard } from './CourseCard';
import { LearningPathCard } from './LearningPathCard';
import { AIRecommendations } from './AIRecommendations';
import { EmptyMyLearning } from './EmptyMyLearning';
import { Course, LearningPath } from './types';

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
      <div className="space-y-8">
        <AIRecommendations 
          recommendations={filteredCourses.slice(0, 3)}
          onEnroll={onEnroll}
          isEnrolled={isEnrolled}
        />
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            All Courses ({filteredCourses.length})
          </h2>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No courses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Learning Paths ({filteredLearningPaths.length})
        </h2>
        
        {filteredLearningPaths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No learning paths found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLearningPaths.map((path: LearningPath) => (
              <LearningPathCard 
                key={path.id} 
                path={{
                  ...path,
                  target_role: path.target_role || 'General Role'
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6">My Learning</h2>
        
        {enrolledCourses.length === 0 ? (
          <EmptyMyLearning onBrowseCourses={onBrowseCourses} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
