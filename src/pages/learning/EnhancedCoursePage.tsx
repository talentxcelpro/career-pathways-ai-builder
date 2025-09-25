import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Code, 
  Brain,
  ArrowLeft,
  Clock,
  Target,
  Award,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AITutorChat } from '@/components/learning/AITutorChat';
import { InteractiveCodeEditor } from '@/components/learning/InteractiveCodeEditor';
import { useInteractiveExercises, useTextToSpeech } from '@/hooks/useAdvancedLearning';
import { useEnrollInCourse, useCourseEnrollments } from '@/hooks/useCourses';
import { toast } from 'sonner';

export default function EnhancedCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const enrollMutation = useEnrollInCourse();
  const { data: enrollments } = useCourseEnrollments(user?.id);

  const { generateSpeech, isLoading: ttsLoading } = useTextToSpeech();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Fetch course with modules and lessons
  const { data: course, isLoading } = useQuery({
    queryKey: ['enhanced-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules(
            *,
            course_lessons(*)
          )
        `)
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  // Get exercises for the current lesson
  const firstLesson = course?.course_modules?.[0]?.course_lessons?.[0];
  const { data: exercises } = useInteractiveExercises(firstLesson?.id);

  // Text-to-speech functionality
  const handlePlayAudio = async (text: string, lessonId?: string) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    try {
      const response = await generateSpeech({
        text,
        voice: 'alloy', // Professional voice
        speed: 1.0,
        lessonId
      });

      const audioBlob = new Blob([Uint8Array.from(atob(response.audioContent), c => c.charCodeAt(0))], {
        type: 'audio/mp3'
      });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      setCurrentAudio(audio);
      await audio.play();
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      toast.error('Audio playback failed');
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => navigate('/learning')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Hub
          </Button>
        </div>
      </div>
    );
  }

  const totalLessons = course.course_modules?.reduce((total, module) => 
    total + (module.course_lessons?.length || 0), 0
  ) || 0;

  const isEnrolled = enrollments?.some(enrollment => 
    enrollment.courses.id === courseId
  ) || false;

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll in this course');
      return;
    }

    if (!courseId) {
      toast.error('Course not found');
      return;
    }

    try {
      await enrollMutation.mutateAsync({
        courseId: courseId,
        userId: user.id
      });
    } catch (error: any) {
      console.error('Enrollment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/learning')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">by {course.instructor_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {course.duration_hours}h
              </Badge>
              <Badge variant="outline">
                {course.difficulty_level}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={isAudioEnabled ? stopAudio : () => setIsAudioEnabled(true)}
              >
                {isAudioEnabled ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Practice
            </TabsTrigger>
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayAudio(course.description)}
                        disabled={ttsLoading}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{course.description}</p>
                  </CardContent>
                </Card>

                {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Outcomes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.learning_outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {course.course_modules && course.course_modules.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Modules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {course.course_modules.map((module, index) => (
                        <div key={module.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              Module {index + 1}: {module.title}
                            </h4>
                            <Badge variant="outline">
                              {module.course_lessons?.length || 0} lessons
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {module.description}
                          </p>
                          {module.course_lessons && module.course_lessons.length > 0 && (
                            <div className="space-y-1">
                              {module.course_lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center gap-2 text-sm">
                                  <Play className="h-3 w-3 text-muted-foreground" />
                                  <span>{lesson.title}</span>
                                  <span className="text-muted-foreground">
                                    ({lesson.duration_minutes}min)
                                  </span>
                                  {lesson.is_free && (
                                    <Badge variant="secondary" className="text-xs">Free</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>0/{totalLessons}</span>
                      </div>
                      <Progress value={0} className="w-full" />
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{course.duration_hours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <span className="capitalize">{course.difficulty_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lessons:</span>
                        <span>{totalLessons}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Category:</span>
                         <span>{course.category}</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Price:</span>
                         <span className="font-semibold text-primary">
                           {course.is_free ? 'Free' : `₹${course.price}`}
                         </span>
                       </div>
                     </div>
                    <Separator />
                    {isEnrolled ? (
                      <Button className="w-full" size="lg" asChild>
                        <Link to={`/learning/courses/${courseId}/player`}>
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {course.certification_available && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Earn a verified certificate upon successful completion
                      </p>
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="mt-6">
            <div className="space-y-6">
              {course.course_modules?.map((module, moduleIndex) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Module {moduleIndex + 1}: {module.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {module.course_lessons?.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lesson.duration_minutes} minutes
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.is_free && (
                              <Badge variant="secondary">Free</Badge>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handlePlayAudio(lesson.content || lesson.title, lesson.id)}
                              disabled={ttsLoading}
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              Listen
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/learning/courses/${courseId}/player?lesson=${lesson.id}`}>
                                <Play className="h-3 w-3 mr-1" />
                                Play
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        {lesson.video_url && (
                          <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                            {lesson.video_url.includes('youtube.com/embed') || lesson.video_url.includes('youtu.be') ? (
                              <iframe
                                src={lesson.video_url}
                                className="w-full h-full border-0"
                                title={lesson.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                loading="lazy"
                              />
                            ) : (
                              <video
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                                poster={lesson.thumbnail_url}
                              >
                                <source src={lesson.video_url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        )}
                        
                        {lesson.content && (
                          <div className="prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              
              {(!course.course_modules || course.course_modules.length === 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Lessons</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Access all video lessons and course materials
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No lessons available yet</p>
                      <p className="text-sm text-muted-foreground">
                        Course content will be added soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            {exercises && exercises.length > 0 ? (
              <div className="space-y-6">
                {exercises.map((exercise) => (
                  <InteractiveCodeEditor
                    key={exercise.id}
                    exercise={exercise}
                    userId={user?.id || ''}
                    onComplete={(score) => {
                      toast.success(`Exercise completed with ${score}% score!`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Exercises</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Practice with hands-on coding exercises
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No exercises available yet</p>
                    <p className="text-sm text-muted-foreground">
                      Interactive coding exercises will be added soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tutor" className="mt-6">
            {user ? (
              <AITutorChat
                userId={user.id}
                courseId={courseId!}
                courseName={course.title}
                learningObjectives={course.learning_outcomes || []}
                onInsightGenerated={(insight) => {
                  console.log('Learning insight:', insight);
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>AI Tutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Please sign in to access your personal AI tutor
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Course Community
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow learners and instructors
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Community features coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Discussion forums, study groups, and peer collaboration
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}