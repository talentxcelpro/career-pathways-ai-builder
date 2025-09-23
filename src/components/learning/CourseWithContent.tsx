import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  difficulty_level?: string;
  duration_hours?: number;
  rating?: number;
  enrolled_count?: number;
  price?: number | string;
  is_free?: boolean;
  category?: string;
  skills_taught?: string[];
  thumbnail_url?: string;
}

interface CourseWithContentProps {
  course: Course;
  isEnrolled?: boolean;
  onEnroll?: (courseId: string) => void;
}

export const CourseWithContent: React.FC<CourseWithContentProps> = ({ 
  course, 
  isEnrolled = false, 
  onEnroll 
}) => {
  const navigate = useNavigate();

  // Fetch course modules and lessons
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ['course_modules', course.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', course.id)
        .order('module_order');
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalLessons = modules.reduce((acc, module) => acc + (module.course_lessons?.length || 0), 0);

  const handleViewCourse = () => {
    navigate(`/learning/${course.id}`);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{course.category}</Badge>
              <Badge variant="secondary">{course.difficulty_level}</Badge>
            </div>
            <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {course.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {course.rating}
                </div>
              )}
              {course.enrolled_count && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolled_count.toLocaleString()} students
                </div>
              )}
              {course.duration_hours && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration_hours}h
                </div>
              )}
            </div>
            {course.instructor_name && (
              <p className="text-sm text-gray-600 mb-3">
                Instructor: {course.instructor_name}
              </p>
            )}
            <p className="text-gray-700 mb-4">{course.description}</p>
          </div>
          <div className="ml-4 text-right">
            <div className="text-lg font-bold mb-2">
              {course.is_free ? 'Free' : 
               typeof course.price === 'string' ? course.price : 
               `₹${Number(course.price || 0).toLocaleString('en-IN')}`}
            </div>
            <Button 
              onClick={isEnrolled ? handleViewCourse : () => onEnroll?.(course.id)}
              className="mb-2"
            >
              {isEnrolled ? 'View Course' : 'Enroll Now'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Skills Section */}
        {course.skills_taught && course.skills_taught.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">What you'll learn:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {course.skills_taught.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-sm">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Content */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Course Content</h4>
            <span className="text-sm text-gray-500">
              {modules.length} modules • {totalLessons} lessons
            </span>
          </div>
          
          {modulesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium">
                      Module {index + 1}: {module.title}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {module.duration_hours}h
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  
                  {/* Learning Objectives */}
                  {module.learning_objectives && module.learning_objectives.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Learning Objectives:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {module.learning_objectives.map((objective, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Lessons */}
                  <div className="space-y-2">
                    {module.course_lessons?.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center">
                          <Play className="h-3 w-3 mr-2 text-blue-600" />
                          <span>{lessonIndex + 1}. {lesson.title}</span>
                        </div>
                        <span className="text-gray-500">{lesson.duration_minutes}min</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {modules.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Course content coming soon...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};