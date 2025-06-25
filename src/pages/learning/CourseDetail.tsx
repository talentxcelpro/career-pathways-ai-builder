
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Star, Award, Play } from 'lucide-react';
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

  const { data: isEnrolled } = useQuery({
    queryKey: ['user_enrolled', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('user_courses')
        .select('id')
        .eq('course_id', id)
        .eq('user_id', user.id)
        .single();
      
      return !!data;
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
        .insert({ user_id: user.id, course_id: id });

      if (error) throw error;
      toast.success('Successfully enrolled in course!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8">Loading course details...</div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-50 p-8">Course not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                       course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                  {course.difficulty_level}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration_hours} hours
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolled_count} students
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {course.rating} rating
                </div>
              </div>

              {course.instructor_name && (
                <p className="text-gray-700 mb-6">
                  <strong>Instructor:</strong> {course.instructor_name}
                </p>
              )}
            </div>

            <div className="lg:w-80">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {course.is_free ? 'Free' : `$${course.price}`}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mb-4" 
                    onClick={handleEnroll}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Enrolled
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </Button>

                  {course.skills_taught && course.skills_taught.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Skills you'll learn:</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.skills_taught.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>{course.description}</p>
                  {course.skills_taught && (
                    <div className="mt-6">
                      <h3>What you'll learn</h3>
                      <ul>
                        {course.skills_taught.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                {course.curriculum ? (
                  <div className="space-y-4">
                    {/* Render curriculum from JSON */}
                    <p>Curriculum content will be displayed here based on course.curriculum JSON structure</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Curriculum details coming soon...</p>
                )}
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
                      {course.instructor_bio || 'Instructor bio coming soon...'}
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
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Reviews coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;
