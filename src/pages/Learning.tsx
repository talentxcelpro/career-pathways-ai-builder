
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Award, 
  TrendingUp,
  Filter,
  ChevronRight
} from "lucide-react";

const Learning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses" className="space-y-6">
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
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                               course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                          {course.difficulty_level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {course.duration_hours}h
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {course.enrolled_count}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {course.rating}
                          </div>
                        </div>
                        
                        {course.instructor_name && (
                          <p className="text-sm text-gray-600">
                            by {course.instructor_name}
                          </p>
                        )}

                        {course.skills_taught && course.skills_taught.length > 0 && (
                          <div className="flex flex-wrap gap-1">
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

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {course.is_free ? 'Free' : `$${course.price}`}
                          </span>
                          <Button
                            onClick={() => enrollInCourse(course.id)}
                            disabled={isEnrolled(course.id)}
                            size="sm"
                          >
                            {isEnrolled(course.id) ? (
                              <>
                                <Award className="h-4 w-4 mr-1" />
                                Enrolled
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Enroll
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={path.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Learning Path
                        </Badge>
                        <Badge variant={path.difficulty_level === 'beginner' ? 'default' : 
                               path.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                          {path.difficulty_level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Target Role: {path.target_role}</span>
                          <span>{path.estimated_duration_weeks} weeks</span>
                        </div>

                        {path.skills_gained && path.skills_gained.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Skills you'll gain:</p>
                            <div className="flex flex-wrap gap-1">
                              {path.skills_gained.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button className="w-full">
                          Start Learning Path
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Learning Tab */}
          <TabsContent value="my-learning">
            {userCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                  <Button onClick={() => document.querySelector('[value="courses"]')?.click()}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCourses.map((userCourse) => (
                  <Card key={userCourse.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{userCourse.courses.title}</CardTitle>
                      <CardDescription>
                        Enrolled on {new Date(userCourse.enrolled_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{userCourse.progress_percentage}%</span>
                          </div>
                          <Progress value={userCourse.progress_percentage} className="h-2" />
                        </div>

                        {userCourse.completed_at ? (
                          <div className="flex items-center text-green-600">
                            <Award className="h-4 w-4 mr-1" />
                            <span className="text-sm">Completed</span>
                          </div>
                        ) : (
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-1" />
                            Continue Learning
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
