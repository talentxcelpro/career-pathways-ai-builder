import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  BookOpen,
  MessageSquare,
  Award,
  ArrowLeft,
  ArrowRight,
  Menu
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { QuizInterface } from './QuizInterface';
import { CourseDiscussions } from './CourseDiscussions';
import { LearningAnalyticsDashboard } from './LearningAnalyticsDashboard';
import { useLearningProgressTracking } from '@/hooks/useLearningProgressTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  lesson_order: number;
  is_free: boolean;
  content?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  duration_hours: number;
  difficulty_level: string;
  rating: number;
  enrolled_count: number;
  thumbnail_url?: string;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

export const CourseViewer: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'discussions' | 'analytics'>('lesson');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const {
    progress,
    updateProgress,
    trackVideoProgress,
    markLessonComplete,
    getCourseProgress
  } = useLearningProgressTracking();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      checkEnrollment();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order');

      if (lessonsError) throw lessonsError;

      // Fetch quizzes
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('course_id', courseId);

      if (quizzesError) throw quizzesError;

      const courseWithContent = {
        ...courseData,
        lessons: lessonsData || [],
        quizzes: quizzesData || []
      };

      setCourse(courseWithContent);
      
      // Set first lesson as current if available
      if (lessonsData && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: enrollment } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      setIsEnrolled(!!enrollment);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to enroll');
        return;
      }

      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'active'
        });

      if (error) throw error;

      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const handleVideoProgress = (progressPercentage: number, positionSeconds: number) => {
    if (currentLesson && isEnrolled) {
      trackVideoProgress(currentLesson.id, positionSeconds, progressPercentage);
    }
  };

  const handleLessonComplete = async () => {
    if (currentLesson && course && isEnrolled) {
      await markLessonComplete(currentLesson.id, course.id);
      toast.success('Lesson completed!');
      
      // Move to next lesson
      const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson.id) || 0;
      const nextLesson = course.lessons?.[currentIndex + 1];
      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }
    }
  };

  const handleQuizComplete = async (answers: Record<string, any>, score: number, passed: boolean) => {
    if (currentQuiz && isEnrolled) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('user_quiz_attempts')
          .insert({
            user_id: user.id,
            quiz_id: currentQuiz.id,
            answers,
            score,
            passed,
            completed_at: new Date().toISOString()
          });

        if (error) throw error;

        if (passed) {
          toast.success(`Quiz passed with ${score}%!`);
        }
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setActiveTab('lesson');
  };

  const selectQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setActiveTab('quiz');
  };

  const getNextItem = () => {
    if (!course) return null;
    
    if (activeTab === 'lesson' && currentLesson) {
      const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson.id) || 0;
      return course.lessons?.[currentIndex + 1] || course.quizzes?.[0];
    }
    
    if (activeTab === 'quiz' && currentQuiz) {
      const currentIndex = course.quizzes?.findIndex(q => q.id === currentQuiz.id) || 0;
      return course.quizzes?.[currentIndex + 1];
    }
    
    return null;
  };

  const getPreviousItem = () => {
    if (!course) return null;
    
    if (activeTab === 'lesson' && currentLesson) {
      const currentIndex = course.lessons?.findIndex(l => l.id === currentLesson.id) || 0;
      return course.lessons?.[currentIndex - 1];
    }
    
    if (activeTab === 'quiz' && currentQuiz) {
      const currentIndex = course.quizzes?.findIndex(q => q.id === currentQuiz.id) || 0;
      const prevQuiz = course.quizzes?.[currentIndex - 1];
      return prevQuiz || course.lessons?.[course.lessons.length - 1];
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <Button onClick={() => navigate('/learning')} className="mt-4">
          Back to Learning
        </Button>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{course.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{course.description}</p>
              </div>
              {course.thumbnail_url && (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{course.enrolled_count} students</span>
                </div>
                <Badge variant="secondary">{course.difficulty_level}</Badge>
              </div>
              
              <div className="space-y-4">
                <p><strong>Instructor:</strong> {course.instructor_name}</p>
                <p><strong>Rating:</strong> {course.rating}/5</p>
                
                <Button onClick={handleEnroll} size="lg" className="w-full">
                  Enroll in Course
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 bg-white border-r",
        showSidebar ? "w-80" : "w-0"
      )}>
        {showSidebar && (
          <div className="h-full overflow-y-auto p-4">
            <div className="mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/learning')}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Learning
              </Button>
              <h2 className="font-bold text-lg truncate">{course.title}</h2>
              <p className="text-sm text-muted-foreground">
                by {course.instructor_name}
              </p>
            </div>

            {/* Course Progress */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Course Progress</h3>
              <Progress value={60} className="mb-2" />
              <p className="text-sm text-muted-foreground">60% Complete</p>
            </div>

            {/* Lessons */}
            <div className="space-y-2">
              <h3 className="font-medium">Lessons</h3>
              {course.lessons?.map((lesson, index) => {
                const lessonProgress = progress[lesson.id];
                const isCompleted = lessonProgress?.status === 'completed';
                const isActive = currentLesson?.id === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => selectLesson(lesson)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lesson.title}</p>
                        <p className={cn(
                          "text-sm",
                          isActive ? "text-white/80" : "text-muted-foreground"
                        )}>
                          {lesson.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quizzes */}
              {course.quizzes && course.quizzes.length > 0 && (
                <>
                  <h3 className="font-medium mt-4">Quizzes</h3>
                  {course.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => selectQuiz(quiz)}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        currentQuiz?.id === quiz.id ? "bg-primary text-white" : "hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{quiz.title}</p>
                          <p className={cn(
                            "text-sm",
                            currentQuiz?.id === quiz.id ? "text-white/80" : "text-muted-foreground"
                          )}>
                            {quiz.questions.length} questions
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">
                {activeTab === 'lesson' && currentLesson?.title}
                {activeTab === 'quiz' && currentQuiz?.title}
                {activeTab === 'discussions' && 'Discussions'}
                {activeTab === 'analytics' && 'Analytics'}
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prev = getPreviousItem();
                if (prev) {
                  if ('video_url' in prev) {
                    selectLesson(prev as Lesson);
                  } else {
                    selectQuiz(prev as Quiz);
                  }
                }
              }}
              disabled={!getPreviousItem()}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = getNextItem();
                if (next) {
                  if ('video_url' in next) {
                    selectLesson(next as Lesson);
                  } else {
                    selectQuiz(next as Quiz);
                  }
                }
              }}
              disabled={!getNextItem()}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="lesson">Lesson</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="lesson" className="p-6 h-full">
              {currentLesson ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <VideoPlayer
                    src={currentLesson.video_url}
                    title={currentLesson.title}
                    onProgress={(progress) => handleVideoProgress(progress, 0)}
                    className="w-full max-w-4xl mx-auto"
                  />

                  {/* Lesson Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentLesson.title}</CardTitle>
                      <p className="text-muted-foreground">{currentLesson.description}</p>
                    </CardHeader>
                    {currentLesson.content && (
                      <CardContent>
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                      </CardContent>
                    )}
                  </Card>

                  {/* Complete Lesson Button */}
                  <div className="text-center">
                    <Button onClick={handleLessonComplete} size="lg">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Complete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No lesson selected</h3>
                  <p className="text-muted-foreground">Select a lesson from the sidebar to start learning</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="quiz" className="p-6">
              {currentQuiz ? (
                <QuizInterface
                  quiz={currentQuiz}
                  onComplete={handleQuizComplete}
                  className="max-w-4xl mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No quiz selected</h3>
                  <p className="text-muted-foreground">Select a quiz from the sidebar to test your knowledge</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="discussions" className="p-6">
              <CourseDiscussions 
                courseId={course.id}
                lessonId={currentLesson?.id}
                className="max-w-4xl mx-auto"
              />
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="max-w-6xl mx-auto">
                <LearningAnalyticsDashboard />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};