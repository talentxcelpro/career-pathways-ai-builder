import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLearningData } from '@/hooks/useLearningData';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  PlayCircle,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Award,
  Grid3X3,
  List,
  SortAsc
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseGridProps {
  courses: any[];
  viewMode: 'grid' | 'list';
}

const CourseGrid: React.FC<CourseGridProps> = ({ courses, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {courses.map((course) => (
          <Link key={course.id} to={`/learning/courses/${course.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {course.thumbnail || course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail || course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <PlayCircle className="h-8 w-8 text-primary/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {course.category && (
                            <Badge variant="outline" className="text-xs">
                              {course.category}
                            </Badge>
                          )}
                          {course.duration_hours && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration_hours}h</span>
                            </div>
                          )}
                          {course.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span>{course.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {course.price && parseFloat(String(course.price)) > 0 && !course.is_free ? (
                          <span className="font-semibold text-primary">
                            ₹{typeof course.price === 'string' ? parseFloat(course.price) || 0 : course.price}
                          </span>
                        ) : (
                          <span className="font-semibold text-green-600">Free</span>
                        )}
                        <Button size="sm" className="mt-2 ml-2">
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
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
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {course.is_free && (
                    <Badge className="bg-green-500">Free</Badge>
                  )}
                  {course.rating >= 4.5 && (
                    <Badge className="bg-yellow-500"><Award className="h-3 w-3 mr-1" />Top Rated</Badge>
                  )}
                </div>
                
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
                        <span>{(course.students || course.enrolled_count).toLocaleString()}</span>
                      </div>
                    )}
                    {course.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    )}
                  </div>

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
                      Start Learning
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const CategorizedCourseDisplay: React.FC = () => {
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Categorize courses
  const courseCategories = useMemo(() => {
    const categorized = {
      'Technology & IT': filteredCourses.filter(course => 
        course.category === 'Technology' || 
        course.title.toLowerCase().includes('programming') ||
        course.title.toLowerCase().includes('web') ||
        course.title.toLowerCase().includes('app') ||
        course.title.toLowerCase().includes('api') ||
        course.title.toLowerCase().includes('database')
      ),
      'AI & Machine Learning': filteredCourses.filter(course =>
        course.title.toLowerCase().includes('ai') ||
        course.title.toLowerCase().includes('machine learning') ||
        course.title.toLowerCase().includes('data')
      ),
      'Business & Management': filteredCourses.filter(course =>
        course.category === 'Business' ||
        course.title.toLowerCase().includes('management') ||
        course.title.toLowerCase().includes('business')
      ),
      'Creative & Design': filteredCourses.filter(course =>
        course.category === 'Design' ||
        course.title.toLowerCase().includes('design') ||
        course.title.toLowerCase().includes('css')
      ),
      'Personal Development': filteredCourses.filter(course =>
        course.category === 'Marketing' ||
        course.category === 'Finance' ||
        course.title.toLowerCase().includes('career')
      )
    };

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categorized).filter(([, courses]) => courses.length > 0)
    );
  }, [filteredCourses]);

  // Get trending courses (high ratings and enrollment)
  const trendingCourses = useMemo(() => {
    return filteredCourses
      .filter(course => course.rating >= 4.0)
      .sort((a, b) => (b.students || b.enrolled_count || 0) - (a.students || a.enrolled_count || 0))
      .slice(0, 6);
  }, [filteredCourses]);

  // Sort courses
  const sortedCourses = useMemo(() => {
    const sorted = [...filteredCourses];
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => (b.students || b.enrolled_count || 0) - (a.students || a.enrolled_count || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted; // No created_at field available, return as is
      case 'duration':
        return sorted.sort((a, b) => (a.duration_hours || 0) - (b.duration_hours || 0));
      default:
        return sorted;
    }
  }, [filteredCourses, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-8">
      {/* Header with Search and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">All Courses</h1>
            <p className="text-muted-foreground">
              {filteredCourses.length} courses found • Learn from industry experts
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, instructors, topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="duration">Shortest First</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearchTerm('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trending Courses */}
      {trendingCourses.length > 0 && !searchTerm && selectedCategory === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Trending Courses</h2>
            <Badge variant="secondary">Hot</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCourses.map((course) => (
              <Link key={course.id} to={`/learning/courses/${course.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-medium">
                    <Zap className="h-3 w-3 inline mr-1" />
                    TRENDING
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{course.rating}</span>
                        <span>•</span>
                        <span>{(course.students || course.enrolled_count || 0).toLocaleString()} students</span>
                      </div>
                      <Button size="sm">View</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Course Categories or All Courses */}
      {!searchTerm && selectedCategory === 'all' ? (
        <Tabs defaultValue={Object.keys(courseCategories)[0]} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            {Object.keys(courseCategories).map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs lg:text-sm">
                {category.split(' ')[0]}
                <Badge variant="secondary" className="ml-2">
                  {courseCategories[category].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(courseCategories).map(([category, courses]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">{category}</h3>
                <span className="text-muted-foreground">{courses.length} courses</span>
              </div>
              <CourseGrid courses={courses} viewMode={viewMode} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Courses'}
            </h3>
            <span className="text-muted-foreground">{sortedCourses.length} courses</span>
          </div>
          <CourseGrid courses={sortedCourses} viewMode={viewMode} />
        </div>
      )}

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search criteria or browse all categories.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}>
              Clear All Filters
            </Button>
            <Button asChild>
              <Link to="/learning">Back to Learning Hub</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};