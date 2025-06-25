
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCourses = () => {
  const { data: userCourses = [], isLoading } = useQuery({
    queryKey: ['my_courses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading your courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {userCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by exploring our courses</p>
              <Link to="/learning">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Learning Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{userCourses.length}</div>
                  <p className="text-gray-600">Total Enrolled</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {userCourses.filter(uc => uc.completed_at).length}
                  </div>
                  <p className="text-gray-600">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {userCourses.filter(uc => !uc.completed_at && uc.progress_percentage > 0).length}
                  </div>
                  <p className="text-gray-600">In Progress</p>
                </CardContent>
              </Card>
            </div>

            {/* Courses Grid */}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-600">
                            <Award className="h-4 w-4 mr-1" />
                            <span className="text-sm">Completed</span>
                          </div>
                          <Badge variant="secondary">
                            {new Date(userCourse.completed_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link to={`/learning/${userCourse.course_id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              View Course
                            </Button>
                          </Link>
                          <Button className="flex-1">
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
