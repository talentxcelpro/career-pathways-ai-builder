
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SearchAndFilters } from "@/components/learning/SearchAndFilters";
import { CourseCard } from "@/components/learning/CourseCard";
import { LearningPathCard } from "@/components/learning/LearningPathCard";
import { MyLearningCard } from "@/components/learning/MyLearningCard";
import { EmptyMyLearning } from "@/components/learning/EmptyMyLearning";

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('courses');

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch learning paths
  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's enrolled courses
  const { data: userCourses = [] } = useQuery({
    queryKey: ['user_courses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select('*, courses(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to enroll in courses');
        return;
      }

      const { error } = await supabase
        .from('user_courses')
        .insert({ user_id: user.id, course_id: courseId });

      if (error) throw error;
      toast.success('Successfully enrolled in course!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
  const isEnrolled = (courseId: string) => userCourses.some(uc => uc.course_id === courseId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Hub</h1>
          <p className="text-gray-600">Advance your career with expert-led courses and learning paths</p>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          categories={categories}
        />

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCourses.map((userCourse) => (
                  <MyLearningCard key={userCourse.id} userCourse={userCourse} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Learning;
