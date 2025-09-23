import React, { useState } from 'react';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { CourseWithContent } from '@/components/learning/CourseWithContent';
import { useLearningData } from '@/hooks/useLearningData';
import { updateMetaTags } from '@/utils/metaTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Filter } from 'lucide-react';

const AllCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    courses,
    filteredCourses,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    isLoading
  } = useLearningData();

  React.useEffect(() => {
    updateMetaTags({
      title: 'All Courses | TalentXcel Learning',
      description: 'Browse our comprehensive catalog of courses across various categories and skill levels.'
    });
  }, []);

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.includes(courseId);
  };

  if (isLoading) {
    return (
      <LearningLayout>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout>
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600">
                Discover and enroll in courses to enhance your skills
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {filteredCourses.length} courses found
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Courses with Full Content */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse different categories.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {filteredCourses.map((course) => (
              <CourseWithContent
                key={course.id}
                course={course}
                isEnrolled={isEnrolled(course.id)}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}

        {/* Load More Button - Future Implementation */}
        {filteredCourses.length > 0 && (
          <div className="text-center pb-12">
            <p className="text-gray-500">
              Showing {filteredCourses.length} courses
            </p>
          </div>
        )}
    </LearningLayout>
  );
};

export default AllCourses;