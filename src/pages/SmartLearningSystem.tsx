import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Users, TrendingUp, Plus, Search, Filter, Star } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  skills_taught: string[];
  duration_hours: number;
  course_type: string;
  company_sponsored: boolean;
  sponsoring_company_id?: string;
  placement_rate: number;
  average_salary_increase: number;
  instructor_name?: string;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  enrollment_date: string;
  course: Course;
}

export const SmartLearningSystem: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedCategory, selectedDifficulty],
    queryFn: async () => {
      // Mock courses data - replace with actual Supabase query
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Complete React Developer Course',
          description: 'Master React from basics to advanced concepts with real-world projects.',
          category: 'Web Development',
          difficulty_level: 'intermediate',
          skills_taught: ['React.js', 'JavaScript', 'HTML/CSS', 'Redux'],
          duration_hours: 40,
          course_type: 'self_paced',
          company_sponsored: true,
          sponsoring_company_id: 'tech-corp',
          placement_rate: 85,
          average_salary_increase: 35,
          instructor_name: 'Sarah Johnson'
        },
        {
          id: '2',
          title: 'Data Science with Python',
          description: 'Learn data science, machine learning, and analytics using Python.',
          category: 'Data Science',
          difficulty_level: 'beginner',
          skills_taught: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
          duration_hours: 60,
          course_type: 'live',
          company_sponsored: false,
          placement_rate: 78,
          average_salary_increase: 45
        },
        {
          id: '3',
          title: 'Full Stack JavaScript Development',
          description: 'Build complete web applications with Node.js, Express, and MongoDB.',
          category: 'Web Development',
          difficulty_level: 'advanced',
          skills_taught: ['Node.js', 'Express.js', 'MongoDB', 'JavaScript'],
          duration_hours: 80,
          course_type: 'hybrid',
          company_sponsored: true,
          sponsoring_company_id: 'startup-xyz',
          placement_rate: 92,
          average_salary_increase: 50
        }
      ];

      return mockCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
      });
    }
  });

  // Fetch user enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: async () => {
      // Mock enrollments data
      const mockEnrollments: Enrollment[] = [
        {
          id: '1',
          course_id: '1',
          progress_percentage: 65,
          is_completed: false,
          enrollment_date: '2024-01-15',
          course: courses?.[0] || {} as Course
        }
      ];
      return mockEnrollments;
    }
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Mock enrollment - replace with actual Supabase insert
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ['user-enrollments'] });
    },
    onError: (error) => {
      toast.error('Failed to enroll: ' + error.message);
    }
  });

  const categories = ['all', 'Web Development', 'Data Science', 'Mobile Development', 'AI/ML', 'DevOps'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourseTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return '🔴';
      case 'self_paced': return '⏰';
      case 'hybrid': return '🔄';
      default: return '📚';
    }
  };

  if (coursesLoading || enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Learning System</h1>
          <p className="text-muted-foreground">Job-focused courses with guaranteed placement support</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            {/* Course creation form would go here */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">Course creation form coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses ? Math.round(courses.reduce((acc, course) => acc + course.placement_rate, 0) / courses.length) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary Increase</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses ? Math.round(courses.reduce((acc, course) => acc + course.average_salary_increase, 0) / courses.length) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList>
          <TabsTrigger value="explore">Explore Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Enrollments</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getDifficultyColor(course.difficulty_level)}>
                          {course.difficulty_level}
                        </Badge>
                        <span className="text-sm">{getCourseTypeIcon(course.course_type)} {course.course_type}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{course.duration_hours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Placement Rate:</span>
                      <span className="font-medium text-green-600">{course.placement_rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Salary Increase:</span>
                      <span className="font-medium text-blue-600">+{course.average_salary_increase}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Skills you'll learn:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.skills_taught.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {course.skills_taught.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.skills_taught.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {course.company_sponsored && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-blue-700">🏢 Company Sponsored</p>
                      <p className="text-xs text-blue-600">Direct hiring opportunity available</p>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    onClick={() => enrollMutation.mutate(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-6">
          {enrollments && enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{enrollment.course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Enrolled on {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={enrollment.is_completed ? "default" : "secondary"}>
                          {enrollment.is_completed ? 'Completed' : 'In Progress'}
                        </Badge>
                        <div className="w-32">
                          <Progress value={enrollment.progress_percentage} />
                          <span className="text-xs text-muted-foreground">
                            {enrollment.progress_percentage}% complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Enrollments Yet</h3>
              <p className="text-muted-foreground">Start learning by enrolling in a course!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Recommendations Coming Soon</h3>
            <p className="text-muted-foreground">
              Personalized course recommendations based on your career goals and skill gaps.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};