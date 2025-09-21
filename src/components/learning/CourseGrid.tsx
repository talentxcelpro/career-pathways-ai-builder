import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, Star, Award, Search, Filter, BookOpen, Play, CheckCircle } from 'lucide-react';
import { useCourses, Course } from '@/hooks/useCourses';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { EnrollmentForm } from './EnrollmentForm';
import { Skeleton } from "@/components/ui/skeleton";

interface CourseGridProps {
  categoryFilter?: string;
  searchQuery?: string;
  limit?: number;
}

export const CourseGrid: React.FC<CourseGridProps> = ({
  categoryFilter,
  searchQuery,
  limit
}) => {
  const [search, setSearch] = useState(searchQuery || '');
  const [category, setCategory] = useState(categoryFilter || '');
  const [difficulty, setDifficulty] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);

  const { displayName } = useCurrentUserProfile();
  const { courses, isLoading } = useCourses({
    category: category && category !== 'all' ? category : undefined,
    difficulty: difficulty && difficulty !== 'all' ? difficulty : undefined,
    search: search || undefined,
    limit
  });

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree || price === 0) return "Free";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnrollClick = (course: Course) => {
    if (!displayName) {
      // Redirect to login or show login modal
      return;
    }
    setSelectedCourse(course);
    setShowEnrollment(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology & IT">Technology & IT</SelectItem>
              <SelectItem value="Business & Finance">Business & Finance</SelectItem>
              <SelectItem value="Marketing & Sales">Marketing & Sales</SelectItem>
              <SelectItem value="Design & Creative">Design & Creative</SelectItem>
              <SelectItem value="Healthcare & Medical">Healthcare & Medical</SelectItem>
              <SelectItem value="Education & Training">Education & Training</SelectItem>
              <SelectItem value="Engineering & Manufacturing">Engineering & Manufacturing</SelectItem>
              <SelectItem value="Hospitality & Tourism">Hospitality & Tourism</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(value) => setDifficulty(value === 'all' ? '' : value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {courses?.length ? `${courses.length} courses found` : 'No courses found'}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative overflow-hidden">
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/50" />
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-card/90 text-foreground font-semibold">
                  {formatPrice(course.price, course.is_free)}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={getDifficultyColor(course.difficulty_level)}>
                  {course.difficulty_level}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium ml-1">{course.rating}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolled_count.toLocaleString()}
                </div>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary" className="text-xs">
                  {course.category}
                </Badge>
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {course.instructor_name}</p>
              
              {course.skills_taught && course.skills_taught.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.skills_taught.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills_taught.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills_taught.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration_hours}h
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  Certificate
                </div>
              </div>

              <Button 
                onClick={() => handleEnrollClick(course)}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {courses?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Enrollment Form */}
      {selectedCourse && (
        <EnrollmentForm
          course={selectedCourse}
          isOpen={showEnrollment}
          onClose={() => {
            setShowEnrollment(false);
            setSelectedCourse(null);
          }}
          onEnrollSuccess={() => {
            // Optionally refresh the course list or navigate somewhere
          }}
        />
      )}
    </div>
  );
};