
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseDetailHeader } from './CourseDetailHeader';
import { CourseLesson } from './CourseLesson';
import { CourseAssessment } from './CourseAssessment';
import { CourseReviews } from './CourseReviews';
import { BookOpen, Award, Users, Clock, CheckCircle, ArrowLeft, Star, Play } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get('preview') === 'true';
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch course data from Supabase
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch course modules and lessons
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course_modules', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', id)
        .order('module_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  // Check if user is enrolled
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!id && !!user
  });

  const isEnrolled = !!enrollment;

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!id || !course) throw new Error('Course ID and data required');
      if (!user) throw new Error('Please log in to enroll in courses');
      
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: id,
          user_id: user.id,
          status: 'active'
        });
      
      if (error) throw new Error(error.message || 'Failed to enroll in course');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', id] });
      toast.success('Successfully enrolled in course!');
    },
    onError: (error: any) => {
      console.error('Enrollment error:', error);
      toast.error('Failed to enroll: ' + (error?.message || 'Unknown error'));
    }
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => navigate('/learning/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = courseLoading || modulesLoading;

  const totalLessons = modules.reduce((acc, module) => acc + (module.course_lessons?.length || 0), 0);
  const completedLessons = 0; // TODO: Implement progress tracking
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/learning')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="mb-4">Course Preview</Badge>
                <Button 
                  onClick={handleEnroll} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {course.rating}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolled_count.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration_hours}h
                </div>
                <Badge>{course.difficulty_level}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">What you'll learn:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {course.skills_taught.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Course Content:</h3>
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Module {index + 1}: {module.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      <div className="space-y-2">
                        {module.course_lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <Play className="h-3 w-3 mr-2 text-gray-400" />
                              {lesson.title}
                            </div>
                            <span className="text-gray-500">{lesson.duration_minutes}min</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            <div className="text-center">
              <Button 
                onClick={handleEnroll} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? 'Enrolling...' : 
                 course.is_free ? 'Enroll for Free' : 
                 `Enroll for ₹${course.price?.toLocaleString('en-IN') || 0}`}
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/learning')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{course.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                {course.rating}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course.enrolled_count.toLocaleString()} students
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration_hours}h
              </div>
              <Badge>{course.difficulty_level}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm">
                <strong>Debug Info:</strong> User: {user ? 'Logged in' : 'Not logged in'} | 
                Enrolled: {isEnrolled ? 'Yes' : 'No'} | 
                Enrollment data: {enrollment ? 'Found' : 'None'}
              </p>
            </div>
            
            {!isEnrolled ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Enroll in this course to access all content</p>
                <Button 
                  onClick={handleEnroll} 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 
                   course.is_free ? 'Enroll for Free' : 
                   `Enroll for ₹${course.price?.toLocaleString('en-IN') || 0}`}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  {isEnrolled && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Completion</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <Progress value={progressPercentage} />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="font-semibold text-lg">{completedLessons}</div>
                              <div className="text-sm text-gray-600">Completed</div>
                            </div>
                            <div>
                              <div className="font-semibold text-lg">{totalLessons}</div>
                              <div className="text-sm text-gray-600">Total Lessons</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {modules.map((module, moduleIndex) => (
                    <Card key={module.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Module {moduleIndex + 1}: {module.title}
                        </CardTitle>
                        <p className="text-gray-600">{module.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {module.course_lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center">
                                <Play className="h-4 w-4 mr-3 text-blue-600" />
                                <div>
                                  <div className="font-medium">{lesson.title}</div>
                                  <div className="text-sm text-gray-500">{lesson.duration_minutes} minutes</div>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  console.log('Play button clicked!');
                                  console.log('Course ID:', id);
                                  console.log('Lesson ID:', lesson.id);
                                  console.log('Lesson Title:', lesson.title);
                                  console.log('Navigate function:', typeof navigate);
                                  
                                  try {
                                    const playerUrl = `/learning/${id}/player?lesson=${lesson.id}`;
                                    console.log('About to navigate to:', playerUrl);
                                    navigate(playerUrl);
                                    console.log('Navigation completed');
                                  } catch (error) {
                                    console.error('Navigation failed:', error);
                                  }
                                }}
                              >
                                Play
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="text-gray-600 mb-6">{course.description}</p>
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {course.skills_taught.map((skill, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews courseId={id!} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
