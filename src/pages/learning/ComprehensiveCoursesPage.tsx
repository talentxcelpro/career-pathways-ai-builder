import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LearningLayout } from '@/components/learning/LearningLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Filter, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Play, 
  Award, 
  TrendingUp,
  Brain,
  Code,
  Briefcase,
  Palette,
  BarChart3,
  Heart,
  Building,
  GraduationCap,
  Globe,
  Lightbulb,
  Cpu,
  Zap,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { updateMetaTags } from '@/utils/metaTags';
import { SimpleCourseCompletion } from '@/components/learning/SimpleCourseCompletion';
import { toast } from 'sonner';

// Enhanced course categories with professional icons and descriptions
const courseCategories = [
  { 
    id: 'technology', 
    name: 'Technology', 
    icon: Code, 
    color: 'bg-blue-500',
    description: 'Programming, AI, Data Science, Web Development',
    courses: '2,500+',
    trending: true
  },
  { 
    id: 'business', 
    name: 'Business', 
    icon: Briefcase, 
    color: 'bg-green-500',
    description: 'Leadership, Strategy, Finance, Entrepreneurship',
    courses: '1,800+',
    trending: false
  },
  { 
    id: 'design', 
    name: 'Design', 
    icon: Palette, 
    color: 'bg-purple-500',
    description: 'UI/UX, Graphics, Product Design, Creative Arts',
    courses: '1,200+',
    trending: false
  },
  { 
    id: 'data-science', 
    name: 'Data Science', 
    icon: BarChart3, 
    color: 'bg-orange-500',
    description: 'Analytics, Machine Learning, Statistics, Research',
    courses: '1,500+',
    trending: true
  },
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: Building, 
    color: 'bg-pink-500',
    description: 'Digital Marketing, Brand Strategy, Social Media',
    courses: '1,100+',
    trending: false
  },
  { 
    id: 'health', 
    name: 'Health & Wellness', 
    icon: Heart, 
    color: 'bg-red-500',
    description: 'Mental Health, Fitness, Nutrition, Medical',
    courses: '800+',
    trending: false
  },
  { 
    id: 'personal-development', 
    name: 'Personal Development', 
    icon: GraduationCap, 
    color: 'bg-indigo-500',
    description: 'Communication, Productivity, Leadership Skills',
    courses: '900+',
    trending: false
  },
  { 
    id: 'language', 
    name: 'Languages', 
    icon: Globe, 
    color: 'bg-teal-500',
    description: 'English, Spanish, French, Mandarin, More',
    courses: '600+',
    trending: false
  }
];

const difficultyLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const sortOptions = [
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'duration-asc', label: 'Shortest First' },
  { value: 'duration-desc', label: 'Longest First' }
];

export default function ComprehensiveCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'most-popular');
  const [user, setUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Fetch courses with advanced filtering
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses-comprehensive', selectedCategory, selectedDifficulty, sortBy, searchTerm],
    queryFn: async () => {
      console.log('🔍 Fetching courses with filters:', { selectedCategory, selectedDifficulty, sortBy, searchTerm });
      
      let query = supabase
        .from('courses')
        .select(`
          *,
          course_modules(
            id,
            title,
            module_order,
            course_lessons(id, title, duration_minutes, lesson_order)
          )
        `)
        .eq('is_active', true);

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.ilike('category', selectedCategory);
      }

      // Apply difficulty filter
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,instructor_name.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'highest-rated':
          query = query.order('rating', { ascending: false });
          break;
        case 'duration-asc':
          query = query.order('duration_hours', { ascending: true });
          break;
        case 'duration-desc':
          query = query.order('duration_hours', { ascending: false });
          break;
        default:
          query = query.order('enrolled_count', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) {
        console.error('❌ Error fetching courses:', error);
        throw error;
      }
      
      console.log('✅ Fetched courses:', data?.length, 'courses');
      console.log('📊 First course modules:', data?.[0]?.course_modules?.length || 0);
      console.log('📚 Sample course:', data?.[0]?.title);
      
      return data;
    }
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
    if (sortBy !== 'most-popular') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, setSearchParams]);

  // Update meta tags
  useEffect(() => {
    const categoryName = courseCategories.find(c => c.id === selectedCategory)?.name || 'All Categories';
    updateMetaTags({
      title: `${categoryName} Courses | TalentXcel Learning`,
      description: `Explore comprehensive ${categoryName.toLowerCase()} courses with interactive content, expert instructors, and industry-recognized certifications.`
    });
  }, [selectedCategory]);

  const CourseCard = ({ course }: { course: any }) => {
    const totalLessons = course.course_modules?.reduce((total: number, module: any) => 
      total + (module.course_lessons?.length || 0), 0
    ) || 0;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg p-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              {course.category?.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                by {course.instructor_name}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating || 4.8}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{course.enrolled_count || 0} enrolled</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              <span>{totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="capitalize">{course.difficulty_level}</span>
            </div>
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <Separator className="mb-4" />
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {course.is_free ? (
                <span className="text-green-600 font-semibold">Free</span>
              ) : (
                <span className="text-lg font-bold">₹{course.price || 2999}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/learning/courses/${course.id}`}>
                  Preview
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/learning/courses/${course.id}`}>
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <LearningLayout>
      <div className="space-y-8">
        {/* Hero Section with Quick Course Completion */}
        <div className="text-center py-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl relative">
          <h1 className="text-4xl font-bold mb-4">
            Discover Your Next Learning Adventure
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access thousands of courses from industry experts. Learn at your own pace with interactive content and hands-on projects.
          </p>
          
          {/* Quick Access to Course Completion */}
          <div className="mb-6">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
              onClick={() => {
                const element = document.getElementById('course-factory');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Zap className="h-5 w-5 mr-2" />
              🚀 Complete All 50 Courses Now!
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>10,000+ Courses</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>500K+ Students</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Industry Certificates</span>
            </div>
          </div>
        </div>

        {/* Course Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {courseCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {category.courses}
                      </Badge>
                      {category.trending && (
                        <Badge variant="default" className="text-xs">
                          <TrendingUp className="h-2 w-2 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {courseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Course Management - Always Visible for Testing */}
        <Card id="course-factory" className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              🚀 SuperCharged Course Factory
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete all 50 courses with comprehensive content - Available for all users
            </p>
          </CardHeader>
          <CardContent>
            <SimpleCourseCompletion />
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCategory === 'all' ? 'All Courses' : 
                 courseCategories.find(c => c.id === selectedCategory)?.name + ' Courses'}
              </h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${courses.length} courses found`}
              </p>
            </div>
            
            {courses.length > 0 && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSortBy('most-popular');
              }}>
                Clear Filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or browse different categories.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}>
                Browse All Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* Load More / Pagination - Phase 3 Feature */}
        {courses.length > 0 && (
          <div className="text-center py-8">
            <Button variant="outline" size="lg">
              Load More Courses
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {courses.length} of 10,000+ courses
            </p>
          </div>
        )}
      </div>
    </LearningLayout>
  );
}