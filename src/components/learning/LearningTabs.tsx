
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "./CourseCard";
import { LearningPathCard } from "./LearningPathCard";
import { MyLearningCard } from "./MyLearningCard";
import { EmptyMyLearning } from "./EmptyMyLearning";
import { BookOpen, Target, GraduationCap } from "lucide-react";

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
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
        <TabsTrigger 
          value="courses" 
          className="flex items-center space-x-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
        >
          <BookOpen className="h-3 w-3" />
          <span>Courses</span>
        </TabsTrigger>
        <TabsTrigger 
          value="paths" 
          className="flex items-center space-x-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
        >
          <Target className="h-3 w-3" />
          <span>Learning Paths</span>
        </TabsTrigger>
        <TabsTrigger 
          value="my-learning" 
          className="flex items-center space-x-2 text-xs data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
        >
          <GraduationCap className="h-3 w-3" />
          <span>My Learning</span>
        </TabsTrigger>
      </TabsList>

      {/* Courses Tab */}
      <TabsContent value="courses">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48"></div>
              </div>
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria or browse our featured courses
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                onEnroll={enrollInCourse}
              />
            ))
          )}
        </div>
      </TabsContent>

      {/* Learning Paths Tab */}
      <TabsContent value="paths">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pathsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-32"></div>
              </div>
            ))
          ) : learningPaths.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No learning paths available</h3>
              <p className="text-sm text-gray-500">
                We're working on creating structured learning paths for you
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCourses.map((userCourse) => (
              <MyLearningCard key={userCourse.id} userCourse={userCourse} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
