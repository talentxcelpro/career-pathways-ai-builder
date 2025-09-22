import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  Star,
  Award,
  Volume2,
  Settings,
  Maximize,
  List
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProgress } from '@/hooks/useCourses';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  completed: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  duration_minutes: number;
  content_url?: string;
  content_text?: string;
  resources?: Resource[];
  completed: boolean;
  video_transcript?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'link' | 'image';
  url: string;
  description?: string;
}

interface CoursePlayerProps {
  courseId: string;
  enrollmentId: string;
  modules: Module[];
  currentProgress: number;
  onProgressUpdate: (progress: number) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  courseId,
  enrollmentId,
  modules,
  currentProgress,
  onProgressUpdate
}) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const updateProgress = useUpdateProgress();

  const currentModule = modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const completedLessons = modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.completed).length, 0
  );

  const goToNextLesson = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(modules[currentModuleIndex - 1].lessons.length - 1);
    }
  };

  const markLessonComplete = () => {
    const newProgress = Math.round(((completedLessons + 1) / totalLessons) * 100);
    updateProgress.mutate({
      enrollmentId,
      progressPercentage: newProgress
    });
    onProgressUpdate(newProgress);
  };

  const jumpToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Course Content */}
      {sidebarOpen && (
        <div className="w-80 bg-card border-r overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Course Content</h3>
              <Badge variant="secondary">
                {completedLessons}/{totalLessons}
              </Badge>
            </div>
            <Progress value={(completedLessons / totalLessons) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {Math.round((completedLessons / totalLessons) * 100)}% Complete
            </p>
          </div>

          <div className="p-4">
            <Accordion type="single" collapsible className="space-y-2">
              {modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        module.completed ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                      }`}>
                        {moduleIndex + 1}
                      </div>
                      <div>
                        <div className="font-medium">{module.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {module.lessons.filter(l => l.completed).length}/{module.lessons.length} lessons
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 ml-8">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            currentModuleIndex === moduleIndex && currentLessonIndex === lessonIndex
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => jumpToLesson(moduleIndex, lessonIndex)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {lesson.content_type === 'video' && <Play className="h-3 w-3" />}
                              {lesson.content_type === 'text' && <FileText className="h-3 w-3" />}
                              {lesson.content_type === 'quiz' && <CheckCircle className="h-3 w-3" />}
                              {lesson.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">{lesson.title}</div>
                              <div className="text-xs opacity-70">
                                {lesson.duration_minutes} min
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="font-semibold">{currentLesson?.title}</h2>
              <p className="text-sm text-muted-foreground">
                Module {currentModuleIndex + 1}: {currentModule?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Resources
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Q&A
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                {currentLesson?.video_transcript && (
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="content" className="h-full m-0">
                <div className="h-full flex flex-col">
                  {/* Video Player or Content */}
                  {currentLesson?.content_type === 'video' && (
                    <div className="bg-black aspect-video flex items-center justify-center relative">
                      {currentLesson.content_url ? (
                        <video
                          src={currentLesson.content_url}
                          controls
                          className="w-full h-full"
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Video content will be loaded here</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson?.content_type === 'text' && (
                    <div className="p-6 max-w-4xl mx-auto">
                      <div className="prose prose-lg max-w-none">
                        {currentLesson.content_text ? (
                          <div dangerouslySetInnerHTML={{ __html: currentLesson.content_text }} />
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Lesson content will be displayed here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentLesson?.content_type === 'quiz' && (
                    <div className="p-6">
                      <QuizComponent lessonId={currentLesson.id} />
                    </div>
                  )}

                  {/* Lesson Controls */}
                  <div className="border-t p-4 bg-background">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                      <Button
                        variant="outline"
                        onClick={goToPreviousLesson}
                        disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-2">
                        {!currentLesson?.completed && (
                          <Button onClick={markLessonComplete}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          onClick={goToNextLesson}
                          disabled={
                            currentModuleIndex === modules.length - 1 &&
                            currentLessonIndex === currentModule?.lessons.length - 1
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Your Notes</h3>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes while learning..."
                    className="min-h-[400px]"
                  />
                  <Button className="mt-4">Save Notes</Button>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Lesson Resources</h3>
                  {currentLesson?.resources?.length > 0 ? (
                    <div className="grid gap-4">
                      {currentLesson.resources.map((resource) => (
                        <Card key={resource.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{resource.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {resource.description}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {resource.type.toUpperCase()}
                                </Badge>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No resources available for this lesson</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {currentLesson?.video_transcript && (
                <TabsContent value="transcript" className="p-6">
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold mb-4">Video Transcript</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {currentLesson.video_transcript}
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Quiz Component
const QuizComponent: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Mock quiz data - in real app, fetch from database
  const quiz = {
    questions: [
      {
        id: '1',
        question: 'What is the main benefit of cloud computing?',
        options: [
          'Lower costs',
          'Scalability and flexibility',
          'Better security',
          'Faster internet'
        ],
        correctAnswer: 'Scalability and flexibility',
        explanation: 'Cloud computing provides scalability and flexibility as its main benefits.'
      },
      {
        id: '2',
        question: 'Which AWS service is used for object storage?',
        options: ['EC2', 'S3', 'RDS', 'Lambda'],
        correctAnswer: 'S3',
        explanation: 'Amazon S3 (Simple Storage Service) is used for object storage.'
      }
    ]
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [quiz.questions[currentQuestion].id]: answer
    }));
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  if (showResults) {
    const correctAnswers = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{score}%</div>
            <p className="text-muted-foreground">
              You got {correctAnswers} out of {quiz.questions.length} questions correct
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-primary pl-4">
                <p className="font-medium">{question.question}</p>
                <p className="text-sm text-muted-foreground">
                  Your answer: {answers[question.id]}
                </p>
                <p className="text-sm text-green-600">
                  Correct answer: {question.correctAnswer}
                </p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            ))}
          </div>

          <Button className="w-full">Continue to Next Lesson</Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </CardTitle>
        <Progress value={(currentQuestion + 1) / quiz.questions.length * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-medium">{currentQ.question}</h3>
        
        <div className="space-y-2">
          {currentQ.options.map((option, index) => (
            <Button
              key={index}
              variant={answers[currentQ.id] === option ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={submitQuiz} disabled={!answers[currentQ.id]}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[currentQ.id]}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};