
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { realDataService } from '@/utils/realDataService';
import { Course, LearningPath } from '@/components/learning/types';

export const useLearningData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch courses and learning paths
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: realDataService.getAllCourses,
  });

  const { data: learningPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning_paths'],
    queryFn: realDataService.getAllLearningPaths,
  });

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    return courses.filter((course: Course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, selectedCategory, selectedDifficulty]);

  // Get unique categories for filters
  const categories = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    const uniqueCategories = [...new Set(courses.map((course: Course) => course.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [courses]);

  // Filter learning paths
  const filteredLearningPaths = useMemo(() => {
    if (!Array.isArray(learningPaths)) return [];
    
    return learningPaths.filter((path: LearningPath) => {
      const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           path.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           path.target_role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedDifficulty === 'all' || path.difficulty_level === selectedDifficulty;
      
      return matchesSearch && matchesLevel;
    });
  }, [learningPaths, searchTerm, selectedDifficulty]);

  return {
    courses,
    learningPaths,
    filteredCourses,
    filteredLearningPaths,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    isLoading: coursesLoading || pathsLoading
  };
};
