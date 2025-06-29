
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningTabs } from '@/components/learning/LearningTabs';
import { SearchAndFilters } from '@/components/learning/SearchAndFilters';
import { CourseCard } from '@/components/learning/CourseCard';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import { AIRecommendations } from '@/components/learning/AIRecommendations';
import { EmptyMyLearning } from '@/components/learning/EmptyMyLearning';
import { realDataService } from '@/utils/realDataService';
import { updateMetaTags } from '@/utils/metaTags';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  difficulty_level: string;
  duration_hours: number;
  rating: number;
  enrolled_count: number;
  price: number;
  is_free: boolean;
  skills_taught?: string[];
  category?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  course_ids?: string[];
  skills_gained?: string[];
  target_role?: string;
}

const Learning = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  // Update meta tags for SEO
  useEffect(() => {
    updateMetaTags({
      title: 'Learning Hub | TalentXcel - Advance Your Career',
      description: 'Discover courses, learning paths, and AI-powered recommendations to boost your skills and advance your career.',
      url: `${window.location.origin}/learning`,
    });
  }, []);

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
  const filteredCourses = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    return courses.filter((course: Course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || course.difficulty_level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  // Get unique categories and levels for filters
  const categories = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    const uniqueCategories = [...new Set(courses.map((course: Course) => course.category).filter(Boolean))];
    return uniqueCategories as string[];
  }, [courses]);

  const levels = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    const uniqueLevels = [...new Set(courses.map((course: Course) => course.difficulty_level).filter(Boolean))];
    return uniqueLevels as string[];
  }, [courses]);

  // Filter learning paths
  const filteredLearningPaths = React.useMemo(() => {
    if (!Array.isArray(learningPaths)) return [];
    
    return learningPaths.filter((path: LearningPath) => {
      const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           path.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           path.target_role?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || path.difficulty_level === selectedLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [learningPaths, searchQuery, selectedLevel]);

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    // Here you would typically make an API call to enroll the user
    console.log('Enrolled in course:', courseId);
  };

  const isLoading = coursesLoading || pathsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600 font-medium">Loading learning content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LearningHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <LearningTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="mb-8">
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            categories={categories}
            levels={levels}
          />
        </div>

        {activeTab === 'courses' && (
          <div className="space-y-8">
            <AIRecommendations />
            
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
                      course={course}
                      isEnrolled={enrolledCourses.includes(course.id)}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'paths' && (
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
                  <LearningPathCard key={path.id} learningPath={path} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-learning' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Learning</h2>
            
            {enrolledCourses.length === 0 ? (
              <EmptyMyLearning />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter((course: Course) => enrolledCourses.includes(course.id))
                  .map((course: Course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={true}
                      onEnroll={handleEnroll}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
