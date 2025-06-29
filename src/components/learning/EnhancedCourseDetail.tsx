
import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
import { BookOpen, Award, Users, Clock, CheckCircle, ArrowLeft, Star, Play } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get('preview') === 'true';
  const queryClient = useQueryClient();

  // Mock course data for now since we don't have actual Supabase data
  const mockCourse = {
    id: id || '',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the fundamentals of user interface and user experience design. This comprehensive course covers design principles, user research, wireframing, prototyping, and usability testing.',
    instructor_name: 'Emma Thompson',
    rating: 4.6,
    enrolled_count: 2156,
    duration_hours: 60,
    difficulty_level: 'beginner',
    price: 9999,
    is_free: false,
    skills_taught: ['UI Design', 'UX Research', 'Prototyping', 'Figma', 'User Testing'],
    category: 'Design'
  };

  const mockModules = [
    {
      id: 1,
      title: 'Introduction to UI/UX Design',
      description: 'Understanding the basics of user interface and user experience design',
      module_order: 1,
      course_lessons: [
        { id: 1, title: 'What is UI/UX Design?', duration_minutes: 15, lesson_order: 1 },
        { id: 2, title: 'Design Thinking Process', duration_minutes: 20, lesson_order: 2 },
        { id: 3, title: 'Tools Overview', duration_minutes: 25, lesson_order: 3 }
      ]
    },
    {
      id: 2,
      title: 'User Research & Analysis',
      description: 'Learn how to conduct user research and analyze user needs',
      module_order: 2,
      course_lessons: [
        { id: 4, title: 'User Personas', duration_minutes: 30, lesson_order: 1 },
        { id: 5, title: 'User Journey Mapping', duration_minutes: 35, lesson_order: 2 }
      ]
    }
  ];

  const [course] = useState(mockCourse);
  const [modules] = useState(mockModules);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress] = useState<any[]>([]);

  const totalLessons = modules.reduce((acc, module) => acc + module.course_lessons.length, 0);
  const completedLessons = userProgress.filter(p => p?.is_completed).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleEnroll = () => {
    setIsEnrolled(true);
    toast.success('Successfully enrolled in course!');
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
                <Button onClick={handleEnroll} className="bg-blue-600 hover:bg-blue-700">
                  Enroll Now
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
                <Button onClick={handleEnroll} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Enroll for ₹{course.price.toLocaleString('en-IN')}
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
            {!isEnrolled ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Enroll in this course to access all content</p>
                <Button onClick={handleEnroll} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Enroll for ₹{course.price.toLocaleString('en-IN')}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
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
                              <Button variant="outline" size="sm">
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
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
