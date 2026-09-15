import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, Clock, TrendingUp, Play, CheckCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LearningDashboard = () => {
  // Fetch user's enrolled courses
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['user-enrollments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            instructor_name,
            thumbnail_url,
            category,
            difficulty_level,
            duration_hours
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch learning statistics
  const { data: stats } = useQuery({
    queryKey: ['learning-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Calculate total courses, completed courses, total hours
      const totalCourses = enrollments?.length || 0;
      const completedCourses = enrollments?.filter(e => e.progress_percentage >= 100).length || 0;
      const totalHours = enrollments?.reduce((acc, e) => acc + (e.courses?.duration_hours || 0), 0) || 0;
      const averageProgress = enrollments?.length > 0 
        ? enrollments.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / enrollments.length 
        : 0;

      return {
        totalCourses,
        completedCourses,
        totalHours,
        averageProgress: Math.round(averageProgress)
      };
    },
    enabled: !!enrollments
  });

  // Fetch recommended courses
  const { data: recommendations } = useQuery({
    queryKey: ['course-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('rating', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const recentCourses = enrollments?.slice(0, 3) || [];
  const inProgressCourses = enrollments?.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalCourses || 0}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.completedCourses || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalHours || 0}h</p>
                <p className="text-sm text-muted-foreground">Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.averageProgress || 0}%</p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Continue Learning</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    {enrollment.courses?.thumbnail_url && (
                      <img
                        src={enrollment.courses.thumbnail_url}
                        alt={enrollment.courses.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{enrollment.courses?.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {enrollment.courses?.instructor_name}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(enrollment.progress_percentage || 0)}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage || 0} />
                      </div>
                      <Button asChild size="sm" className="mt-2">
                        <Link to={`/courses/${enrollment.courses?.id}`}>
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No courses in progress</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start learning by enrolling in a course
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.length > 0 ? (
              recentCourses.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{enrollment.courses?.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {enrollment.courses?.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {enrollment.progress_percentage >= 100 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className="text-sm font-medium">
                      {Math.round(enrollment.progress_percentage || 0)}%
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Recommended for You</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations?.map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-32 rounded-lg object-cover mb-4"
                  />
                )}
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  by {course.instructor_name}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary">{course.category}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{course.rating}</span>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link to={`/courses/${course.id}`}>
                    View Course
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};