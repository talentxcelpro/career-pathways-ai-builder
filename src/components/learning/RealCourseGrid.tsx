import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLearningData } from '@/hooks/useLearningData';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  PlayCircle,
  ChevronRight
} from 'lucide-react';

interface RealCourseGridProps {
  title?: string;
  showFilters?: boolean;
  limit?: number;
  category?: string;
  className?: string;
}

export const RealCourseGrid: React.FC<RealCourseGridProps> = ({
  title = "Available Courses",
  showFilters = true,
  limit,
  category,
  className
}) => {
  const { 
    filteredCourses, 
    categories, 
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty
  } = useLearningData();

  const displayCourses = limit ? filteredCourses.slice(0, limit) : filteredCourses;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">
            {displayCourses.length} courses available
          </p>
        </div>
        {!limit && (
          <Button asChild variant="outline">
            <Link to="/learning/courses">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* Course Grid */}
      {displayCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or browse all courses.
          </p>
          <Button asChild>
            <Link to="/learning/courses">Browse All Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <Link key={course.id} to={`/learning/courses/${course.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-0">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20 rounded-t-lg">
                    {course.thumbnail || course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail || course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <PlayCircle className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                    {course.is_free && (
                      <Badge className="absolute top-3 left-3 bg-green-500">
                        Free
                      </Badge>
                    )}
                    {(course.level || course.difficulty_level) && (
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        {course.level || course.difficulty_level}
                      </Badge>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {/* Category */}
                      {course.category && (
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                      )}

                      {/* Title */}
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* Description */}
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {course.description}
                        </p>
                      )}

                      {/* Instructor */}
                      {(course.instructor_name) && (
                        <p className="text-sm text-muted-foreground">
                          By {course.instructor_name}
                        </p>
                      )}

                      {/* Course Stats */}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {course.duration_hours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration_hours}h</span>
                          </div>
                        )}
                        {(course.students || course.enrolled_count) && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students || course.enrolled_count}</span>
                          </div>
                        )}
                        {course.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span>{course.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {course.skills_taught && course.skills_taught.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.skills_taught.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {course.skills_taught.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{course.skills_taught.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        {course.price && parseFloat(String(course.price)) > 0 && !course.is_free ? (
                          <span className="font-bold text-lg text-primary">
                            ₹{typeof course.price === 'string' ? parseFloat(course.price) || 0 : course.price}
                          </span>
                        ) : (
                          <span className="font-bold text-lg text-green-600">Free</span>
                        )}
                        <Button 
                          size="sm" 
                          className="group-hover:bg-primary group-hover:text-primary-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/learning/courses/${course.id}`;
                          }}
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {limit && filteredCourses.length > limit && (
        <div className="text-center pt-6">
          <Button asChild variant="outline" size="lg">
            <Link to="/learning/courses">
              View All {filteredCourses.length} Courses
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};