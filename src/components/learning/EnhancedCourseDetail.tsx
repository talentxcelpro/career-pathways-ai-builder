
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CourseDetailHeader } from './CourseDetailHeader';
import { CourseLessonComponent } from './CourseLesson';
import { CourseAssessment } from './CourseAssessment';
import { BookOpen, Award, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['course_modules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', id)
        .order('module_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['course_assessments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_assessments')
        .select('*')
        .eq('course_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: userCourse, refetch: refetchUserCourse } = useQuery({
    queryKey: ['user_course', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('user_courses')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .single();
      
      return data;
    }
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user_lesson_progress', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const lessonIds = modules.flatMap(module => 
        module.course_lessons.map((lesson: any) => lesson.id)
      );

      if (lessonIds.length === 0) return [];

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userCourse && modules.length > 0
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['user_certificates', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userCourse
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: id,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in course!');
      refetchUserCourse();
    },
    onError: () => {
      toast.error('Failed to enroll in course');
    }
  });

  if (courseLoading || !course) {
    return <div className="min-h-screen bg-gray-50 p-8">Loading course details...</div>;
  }

  const isEnrolled = !!userCourse;
  const totalLessons = modules.reduce((acc, module) => acc + module.course_lessons.length, 0);
  const completedLessons = userProgress.filter(p => p.is_completed).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const hasCertificate = certificates.length > 0;

  const handleLessonComplete = (lessonId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user_lesson_progress'] });
    
    // Update course progress
    const newProgress = Math.round(((completedLessons + 1) / totalLessons) * 100);
    supabase
      .from('user_courses')
      .update({ 
        progress_percentage: newProgress,
        ...(newProgress === 100 && { completed_at: new Date().toISOString() })
      })
      .eq('id', userCourse?.id);
  };

  const handleAssessmentComplete = (passed: boolean, score: number) => {
    queryClient.invalidateQueries({ queryKey: ['user_certificates'] });
    if (passed) {
      toast.success('🎉 Congratulations! You earned a certificate!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CourseDetailHeader
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={() => enrollMutation.mutate()}
        userProgress={progressPercentage}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="space-y-6">
              <TabsList>
                <TabsTrigger value="curriculum">Course Content</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="space-y-6">
                {modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Module {moduleIndex + 1}: {module.title}
                      </CardTitle>
                      {module.description && (
                        <p className="text-gray-600">{module.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {module.course_lessons.map((lesson: any) => {
                        const lessonProgress = userProgress.find(p => p.lesson_id === lesson.id);
                        return (
                          <CourseLessonComponent
                            key={lesson.id}
                            lesson={{
                              ...lesson,
                              is_completed: lessonProgress?.is_completed || false
                            }}
                            isEnrolled={isEnrolled}
                            onComplete={handleLessonComplete}
                          />
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="assessments" className="space-y-6">
                {assessments.map((assessment) => (
                  <CourseAssessment
                    key={assessment.id}
                    assessment={assessment}
                    courseId={course.id}
                    isEnrolled={isEnrolled}
                    onComplete={handleAssessmentComplete}
                  />
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
                      
                      {course.skills_taught && course.skills_taught.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {course.skills_taught.map((skill: string, index: number) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
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

            {/* Certificate Status */}
            {hasCertificate && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="h-5 w-5" />
                    Certificate Earned!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 text-sm mb-3">
                    Congratulations! You've successfully completed this course.
                  </p>
                  <Button variant="outline" className="w-full text-green-700 border-green-300">
                    Download Certificate
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-semibold">{course.enrolled_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{course.duration_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modules</span>
                    <span className="font-semibold">{modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons</span>
                    <span className="font-semibold">{totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assessments</span>
                    <span className="font-semibold">{assessments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
