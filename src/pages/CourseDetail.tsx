import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseDetailHeader } from '@/components/learning/CourseDetailHeader';
import { CourseCurriculum } from '@/components/learning/CourseCurriculum';
import { CourseLesson } from '@/components/learning/CourseLesson';
import { useEnrollInCourse, useUpdateProgress } from '@/hooks/useCourses';
import { useToast } from '@/hooks/use-toast';
import { Play, BookOpen, Award, Users, Clock, Star } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const enrollMutation = useEnrollInCourse();
  const updateProgressMutation = useUpdateProgress();

  // Fetch course details
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
    },
    enabled: !!id
  });

  // Fetch course modules and lessons
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', id)
        .order('order_index');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Check enrollment status
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Get current lesson
  const { data: currentLesson } = useQuery({
    queryKey: ['lesson', currentLessonId],
    queryFn: async () => {
      if (!currentLessonId) return null;
      
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', currentLessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentLessonId
  });

  const handleEnroll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !course) {
      toast({
        title: "Authentication required",
        description: "Please sign in to enroll in courses",
        variant: "destructive"
      });
      return;
    }

    enrollMutation.mutate({
      courseId: course.id,
      userId: user.id
    });
  };

  const handleLessonComplete = async (lessonId: string) => {
    if (!enrollment) return;
    
    // Calculate progress (simplified)
    const totalLessons = modules?.reduce((acc, module) => acc + (module.course_lessons?.length || 0), 0) || 1;
    const currentProgress = enrollment.progress_percentage || 0;
    const progressIncrement = (1 / totalLessons) * 100;
    const newProgress = Math.min(currentProgress + progressIncrement, 100);

    updateProgressMutation.mutate({
      enrollmentId: enrollment.id,
      progressPercentage: newProgress
    });
  };

  if (courseLoading || modulesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const curriculumData = modules?.map(module => ({
    id: module.id,
    title: module.title,
    duration_minutes: module.duration_minutes || 0,
    lessons: module.course_lessons?.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      type: lesson.lesson_type || 'video',
      duration_minutes: lesson.duration_minutes || 0,
      is_completed: false, // TODO: Track completion
      is_free: lesson.is_free || false,
      order: lesson.order_index || 0
    })).sort((a, b) => a.order - b.order) || []
  })).sort((a, b) => (modules.find(m => m.id === a.id)?.order_index || 0) - (modules.find(m => m.id === b.id)?.order_index || 0)) || [];

  return (
    <div className="min-h-screen bg-background">
      <CourseDetailHeader
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        userProgress={enrollment?.progress_percentage}
      />

      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="lessons" disabled={!isEnrolled}>Lessons</TabsTrigger>
                <TabsTrigger value="resources" disabled={!isEnrolled}>Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">What You'll Learn</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.skills_taught?.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{course.duration_hours}h</div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{course.enrolled_count}</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{course.rating}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{course.difficulty_level}</div>
                        <div className="text-sm text-muted-foreground">Level</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <CourseCurriculum 
                  modules={curriculumData}
                  isEnrolled={isEnrolled}
                />
              </TabsContent>

              <TabsContent value="lessons">
                {currentLesson ? (
                  <CourseLesson
                    lesson={currentLesson}
                    isEnrolled={isEnrolled}
                    onComplete={() => handleLessonComplete(currentLesson.id)}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Select a Lesson</h3>
                      <p className="text-muted-foreground">
                        Choose a lesson from the curriculum to start learning
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Course Materials</h4>
                        <p className="text-sm text-muted-foreground">
                          Download additional resources and materials
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Discussion Forum</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect with other students and instructors
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

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
                        <span>Course Progress</span>
                        <span>{Math.round(enrollment?.progress_percentage || 0)}%</span>
                      </div>
                      <Progress value={enrollment?.progress_percentage || 0} />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        const firstLesson = modules?.[0]?.course_lessons?.[0];
                        if (firstLesson) {
                          setCurrentLessonId(firstLesson.id);
                        }
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Instructor</div>
                  <div className="font-semibold">{course.instructor_name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-semibold">{course.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="font-semibold">
                    {new Date(course.updated_at).toLocaleDateString()}
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

export default CourseDetail;