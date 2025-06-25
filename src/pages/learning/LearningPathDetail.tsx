
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Target, Clock, Award, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const LearningPathDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: learningPath, isLoading } = useQuery({
    queryKey: ['learning_path_detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: pathCourses = [] } = useQuery({
    queryKey: ['learning_path_courses', id],
    queryFn: async () => {
      if (!learningPath?.course_ids) return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .in('id', learningPath.course_ids);
      
      if (error) throw error;
      return data;
    },
    enabled: !!learningPath?.course_ids
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user_path_progress', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !learningPath?.course_ids) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .in('course_id', learningPath.course_ids);
      
      if (error) throw error;
      return data;
    },
    enabled: !!learningPath?.course_ids
  });

  const handleStartPath = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to start this learning path');
        return;
      }

      // Enroll in all courses in the path
      if (pathCourses.length > 0) {
        const enrollments = pathCourses.map(course => ({
          user_id: user.id,
          course_id: course.id
        }));

        const { error } = await supabase
          .from('user_courses')
          .upsert(enrollments);

        if (error) throw error;
        toast.success('Successfully started learning path!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start learning path');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading learning path...</div>
        </div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Learning path not found</div>
        </div>
      </div>
    );
  }

  const completedCourses = userProgress?.filter(up => up.completed_at)?.length || 0;
  const totalCourses = pathCourses.length;
  const progressPercentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/learning/paths">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning Paths
            </Button>
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={learningPath.difficulty_level === 'beginner' ? 'default' : 
                         learningPath.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                    {learningPath.difficulty_level}
                  </Badge>
                  <Badge variant="outline">Learning Path</Badge>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{learningPath.title}</h1>
                <p className="text-lg text-gray-600 mb-6">{learningPath.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{learningPath.target_role}</div>
                    <div className="text-xs text-gray-500">Target Role</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{learningPath.estimated_duration_weeks} weeks</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{totalCourses}</div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{completedCourses}/{totalCourses}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
                
                {userProgress && userProgress.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Your Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
              </div>
              
              <div className="ml-8">
                <Button onClick={handleStartPath} size="lg">
                  {userProgress && userProgress.length > 0 ? 'Continue Path' : 'Start Learning Path'}
                </Button>
              </div>
            </div>
            
            {learningPath.skills_gained && learningPath.skills_gained.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Skills You'll Gain</h3>
                <div className="flex flex-wrap gap-2">
                  {learningPath.skills_gained.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Courses in this Path</h2>
          
          {pathCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses available in this path yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pathCourses.map((course, index) => {
                const userCourse = userProgress?.find(up => up.course_id === course.id);
                const isCompleted = !!userCourse?.completed_at;
                const isEnrolled = !!userCourse;
                
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isEnrolled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription className="mt-1">{course.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCompleted && <Award className="h-5 w-5 text-green-500" />}
                          <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                                 course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                            {course.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{course.duration_hours}h</span>
                          <span>{course.enrolled_count} students</span>
                          {course.rating && <span>⭐ {course.rating}</span>}
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/learning/${course.id}`}>
                            <Button variant="outline" size="sm">
                              View Course
                            </Button>
                          </Link>
                          {isEnrolled && !isCompleted && (
                            <Button size="sm">Continue</Button>
                          )}
                        </div>
                      </div>
                      
                      {userCourse && userCourse.progress_percentage > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{userCourse.progress_percentage}%</span>
                          </div>
                          <Progress value={userCourse.progress_percentage} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;
