
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedCourseCard } from "./EnhancedCourseCard";
import { LearningPathCard } from "./LearningPathCard";
import { MyLearningCard } from "./MyLearningCard";
import { EmptyMyLearning } from "./EmptyMyLearning";

interface LearningTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredCourses: any[];
  coursesLoading: boolean;
  learningPaths: any[];
  pathsLoading: boolean;
  userCourses: any[];
  isEnrolled: (courseId: string) => boolean;
  enrollInCourse: (courseId: string) => void;
}

export const LearningTabs: React.FC<LearningTabsProps> = ({
  activeTab,
  setActiveTab,
  filteredCourses,
  coursesLoading,
  learningPaths,
  pathsLoading,
  userCourses,
  isEnrolled,
  enrollInCourse
}) => {
  // Get user progress for enrolled courses
  const getUserProgress = (courseId: string) => {
    const userCourse = userCourses.find(uc => uc.course_id === courseId);
    return userCourse?.progress_percentage || 0;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="paths">Learning Paths</TabsTrigger>
        <TabsTrigger value="my-learning">My Learning</TabsTrigger>
      </TabsList>

      {/* Courses Tab */}
      <TabsContent value="courses">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesLoading ? (
            <div className="col-span-3 text-center py-8">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No courses found matching your criteria
            </div>
          ) : (
            filteredCourses.map((course) => (
              <EnhancedCourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                onEnroll={enrollInCourse}
                userProgress={getUserProgress(course.id)}
                showProgress={isEnrolled(course.id)}
              />
            ))
          )}
        </div>
      </TabsContent>

      {/* Learning Paths Tab */}
      <TabsContent value="paths">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pathsLoading ? (
            <div className="col-span-2 text-center py-8">Loading learning paths...</div>
          ) : learningPaths.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No learning paths available yet
            </div>
          ) : (
            learningPaths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))
          )}
        </div>
      </TabsContent>

      {/* My Learning Tab */}
      <TabsContent value="my-learning">
        {userCourses.length === 0 ? (
          <EmptyMyLearning onBrowseCourses={() => setActiveTab('courses')} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.map((userCourse) => (
                <MyLearningCard key={userCourse.id} userCourse={userCourse} />
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
