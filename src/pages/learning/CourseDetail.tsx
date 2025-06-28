
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CourseDetailHeader } from '@/components/learning/CourseDetailHeader';
import { CourseCurriculum } from '@/components/learning/CourseCurriculum';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: course, isLoading } = useQuery({
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

  const handleEnroll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to enroll');
        return;
      }

      const { error } = await supabase
        .from('user_courses')
        .insert({ 
          user_id: user.id, 
          course_id: id,
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        });

      if (error) throw error;
      toast.success('Successfully enrolled in course!');
      refetchUserCourse();
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    }
  };

  // Mock curriculum data - in real app this would come from the database
  const mockCurriculum = [
    {
      id: '1',
      title: 'Introduction & Setup',
      duration_minutes: 120,
      lessons: [
        {
          id: '1-1',
          title: 'Course Overview',
          type: 'video' as const,
          duration_minutes: 15,
          is_free: true,
          is_completed: userCourse ? Math.random() > 0.5 : false
        },
        {
          id: '1-2',
          title: 'Environment Setup',
          type: 'video' as const,
          duration_minutes: 30,
          is_free: true,
          is_completed: userCourse ? Math.random() > 0.5 : false
        },
        {
          id: '1-3',
          title: 'Knowledge Check',
          type: 'quiz' as const,
          duration_minutes: 15,
          is_free: false,
          is_completed: userCourse ? Math.random() > 0.5 : false
        }
      ]
    },
    {
      id: '2',
      title: 'Core Concepts',
      duration_minutes: 240,
      lessons: [
        {
          id: '2-1',
          title: 'Fundamentals',
          type: 'video' as const,
          duration_minutes: 45,
          is_free: false,
          is_completed: userCourse ? Math.random() > 0.5 : false
        },
        {
          id: '2-2',
          title: 'Practical Examples',
          type: 'video' as const,
          duration_minutes: 60,
          is_free: false,
          is_completed: userCourse ? Math.random() > 0.5 : false
        },
        {
          id: '2-3',
          title: 'Hands-on Exercise',
          type: 'text' as const,
          duration_minutes: 90,
          is_free: false,
          is_completed: userCourse ? Math.random() > 0.5 : false
        },
        {
          id: '2-4',
          title: 'Module Assessment',
          type: 'quiz' as const,
          duration_minutes: 45,
          is_free: false,
          is_completed: userCourse ? Math.random() > 0.5 : false
        }
      ]
    }
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8">Loading course details...</div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-50 p-8">Course not found</div>;
  }

  const isEnrolled = !!userCourse;
  const userProgress = userCourse?.progress_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <CourseDetailHeader
          course={course}
          isEnrolled={isEnrolled}
          onEnroll={handleEnroll}
          userProgress={userProgress}
        />

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="curriculum" className="space-y-6">
              <TabsList>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <CourseCurriculum 
                  curriculum={mockCurriculum}
                  isEnrolled={isEnrolled}
                />
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
                          <ul className="space-y-2">
                            {course.skills_taught.map((skill, index) => (
                              <li key={index} className="flex items-center">
                                <ThumbsUp className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">
                          {course.instructor_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{course.instructor_name}</h3>
                        <p className="text-gray-600 mt-2">
                          {course.instructor_bio || 'Experienced instructor with expertise in this field. More details coming soon...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>
                      Based on {course.enrolled_count} student enrollments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-600">
                      <div className="flex items-center justify-center mb-4">
                        <Star className="h-8 w-8 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold ml-2">{course.rating}</span>
                        <span className="text-gray-500 ml-1">/ 5.0</span>
                      </div>
                      <p>Detailed reviews and ratings coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Course Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-semibold">{course.enrolled_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold">{course.duration_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {course.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-semibold capitalize">{course.difficulty_level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardHeader>
                <CardTitle>Join the Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span>Course Forum</span>
                    </div>
                    <span className="text-sm text-gray-600">24 discussions</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
                      <span>Q&A</span>
                    </div>
                    <span className="text-sm text-gray-600">12 questions</span>
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
