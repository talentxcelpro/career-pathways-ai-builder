
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SearchAndFilters } from "@/components/learning/SearchAndFilters";
import { LearningHeader } from "@/components/learning/LearningHeader";
import { LearningTabs } from "@/components/learning/LearningTabs";

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
        <LearningHeader />
        
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          categories={categories}
        />

        <LearningTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredCourses={filteredCourses}
          coursesLoading={coursesLoading}
          learningPaths={learningPaths}
          pathsLoading={pathsLoading}
          userCourses={userCourses}
          isEnrolled={isEnrolled}
          enrollInCourse={enrollInCourse}
        />
      </div>
    </div>
  );
};

export default Learning;
