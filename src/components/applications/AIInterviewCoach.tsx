import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  Star,
  Clock,
  Target,
  Settings,
  Lightbulb,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  expectedDuration: number;
  tips?: string[];
}

interface InterviewSession {
  id: string;
  job_role: string;
  interview_type: string;
  duration_minutes: number;
  questions: InterviewQuestion[];
  current_question: number;
  responses: string[];
  ai_feedback?: any;
  overall_score?: number;
  strengths?: string[];
  improvement_areas?: string[];
  practice_recommendations?: string[];
  completed_at?: string;
}

interface SessionSettings {
  job_role: string;
  interview_type: 'behavioral' | 'technical' | 'situational' | 'general';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  include_video: boolean;
  include_audio: boolean;
}

export function AIInterviewCoach() {
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    job_role: '',
    interview_type: 'behavioral',
    duration: 30,
    difficulty: 'medium',
    include_video: false,
    include_audio: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (sessionTimer) {
        clearInterval(sessionTimer);
      }
    };
  }, [sessionTimer]);

  const mockQuestions: { [key: string]: InterviewQuestion[] } = {
    behavioral: [
      {
        id: '1',
        question: 'Tell me about a time when you faced a significant challenge at work. How did you handle it?',
        type: 'behavioral',
        difficulty: 'medium',
        category: 'Problem Solving',
        expectedDuration: 3,
        tips: ['Use the STAR method', 'Focus on your specific actions', 'Highlight the positive outcome']
      },
      {
        id: '2',
        question: 'Describe a situation where you had to work with a difficult team member. How did you handle it?',
        type: 'behavioral',
        difficulty: 'medium',
        category: 'Teamwork',
        expectedDuration: 3,
        tips: ['Show emotional intelligence', 'Focus on resolution', 'Demonstrate professional maturity']
      },
      {
        id: '3',
        question: 'Tell me about a time when you had to meet a tight deadline. What was your approach?',
        type: 'behavioral',
        difficulty: 'easy',
        category: 'Time Management',
        expectedDuration: 2,
        tips: ['Explain your prioritization process', 'Show stress management', 'Highlight successful delivery']
      }
    ],
    technical: [
      {
        id: '4',
        question: 'Explain the difference between REST and GraphQL APIs. When would you use each?',
        type: 'technical',
        difficulty: 'medium',
        category: 'System Design',
        expectedDuration: 4,
        tips: ['Compare key features', 'Provide real-world examples', 'Discuss trade-offs']
      },
      {
        id: '5',
        question: 'How would you optimize a slow-performing database query?',
        type: 'technical',
        difficulty: 'hard',
        category: 'Database',
        expectedDuration: 5,
        tips: ['Mention indexing strategies', 'Discuss query analysis tools', 'Consider caching solutions']
      }
    ],
    situational: [
      {
        id: '6',
        question: 'If you disagreed with your manager\'s decision on a project direction, what would you do?',
        type: 'situational',
        difficulty: 'medium',
        category: 'Leadership',
        expectedDuration: 3,
        tips: ['Show respect for hierarchy', 'Demonstrate constructive communication', 'Focus on business impact']
      }
    ]
  };

  const startSession = async () => {
    if (!sessionSettings.job_role.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a job role to start the interview",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate questions based on settings
      const questionPool = mockQuestions[sessionSettings.interview_type] || mockQuestions.behavioral;
      const filteredQuestions = questionPool.filter(q => q.difficulty === sessionSettings.difficulty);
      const selectedQuestions = filteredQuestions.slice(0, Math.ceil(sessionSettings.duration / 5));

      const newSession: InterviewSession = {
        id: Date.now().toString(),
        job_role: sessionSettings.job_role,
        interview_type: sessionSettings.interview_type,
        duration_minutes: sessionSettings.duration,
        questions: selectedQuestions,
        current_question: 0,
        responses: []
      };

      setCurrentSession(newSession);
      setTimeElapsed(0);
      
      // Start timer
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      setSessionTimer(timer);

      // Initialize camera if video is enabled
      if (sessionSettings.include_video) {
        await initializeCamera();
      }

      toast({
        title: "Interview Started",
        description: `Ready to practice ${sessionSettings.interview_type} questions`,
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start interview session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsVideoOn(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Continuing without video.",
        variant: "destructive",
      });
    }
  };

  const submitResponse = () => {
    if (!currentSession || !currentResponse.trim()) return;

    const updatedSession = {
      ...currentSession,
      responses: [...currentSession.responses, currentResponse]
    };

    setCurrentSession(updatedSession);
    setCurrentResponse("");

    // Move to next question or finish
    if (updatedSession.current_question < updatedSession.questions.length - 1) {
      setCurrentSession({
        ...updatedSession,
        current_question: updatedSession.current_question + 1
      });
    } else {
      finishSession(updatedSession);
    }
  };

  const finishSession = async (session: InterviewSession) => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }

    // Generate AI feedback (mock)
    const aiFeedback = generateAIFeedback(session);
    
    const completedSession = {
      ...session,
      ai_feedback: aiFeedback,
      overall_score: aiFeedback.overall_score,
      strengths: aiFeedback.strengths,
      improvement_areas: aiFeedback.improvement_areas,
      practice_recommendations: aiFeedback.practice_recommendations,
      completed_at: new Date().toISOString()
    };

    setCurrentSession(completedSession);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save session to database (mock implementation)
        console.log('Saving session:', completedSession);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }

    toast({
      title: "Interview Completed!",
      description: `Your overall score: ${aiFeedback.overall_score}/100`,
    });
  };

  const generateAIFeedback = (session: InterviewSession) => {
    // Mock AI feedback generation
    const scores = [75, 82, 68, 91, 77];
    const randomScore = scores[Math.floor(Math.random() * scores.length)];
    
    return {
      overall_score: randomScore,
      question_scores: session.responses.map((_, index) => ({
        question_index: index,
        score: Math.floor(Math.random() * 40) + 60,
        feedback: 'Good response with clear structure. Consider adding more specific examples.',
        strengths: ['Clear communication', 'Structured thinking'],
        improvements: ['Add more quantifiable results', 'Include stakeholder impact']
      })),
      strengths: [
        'Clear and confident communication',
        'Good use of specific examples',
        'Structured approach to problem-solving'
      ],
      improvement_areas: [
        'Include more quantifiable results in your examples',
        'Speak more slowly for better clarity',
        'Add more detail about your decision-making process'
      ],
      practice_recommendations: [
        'Practice the STAR method for behavioral questions',
        'Research common technical questions for your role',
        'Record yourself to improve your delivery'
      ]
    };
  };

  const resetSession = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
    setCurrentSession(null);
    setCurrentResponse("");
    setTimeElapsed(0);
    setIsRecording(false);
    setIsVideoOn(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentQuestion = () => {
    if (!currentSession) return null;
    return currentSession.questions[currentSession.current_question];
  };

  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    return ((currentSession.current_question + 1) / currentSession.questions.length) * 100;
  };

  const isSessionCompleted = () => {
    return currentSession?.completed_at !== undefined;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Interview Coach
          </h2>
          <p className="text-muted-foreground">
            Practice interviews with AI-powered feedback and real-time coaching
          </p>
        </div>
        
        {!currentSession && (
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Start Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Interview Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Role</label>
                  <Input
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={sessionSettings.job_role}
                    onChange={(e) => setSessionSettings(prev => ({ ...prev, job_role: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Interview Type</label>
                  <Select
                    value={sessionSettings.interview_type}
                    onValueChange={(value: any) => setSessionSettings(prev => ({ ...prev, interview_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="situational">Situational</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                  <Select
                    value={sessionSettings.duration.toString()}
                    onValueChange={(value) => setSessionSettings(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                  <Select
                    value={sessionSettings.difficulty}
                    onValueChange={(value: any) => setSessionSettings(prev => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Video Practice</label>
                    <Button
                      variant={sessionSettings.include_video ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionSettings(prev => ({ ...prev, include_video: !prev.include_video }))}
                    >
                      {sessionSettings.include_video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable Audio Recording</label>
                    <Button
                      variant={sessionSettings.include_audio ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionSettings(prev => ({ ...prev, include_audio: !prev.include_audio }))}
                    >
                      {sessionSettings.include_audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={startSession} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Starting..." : "Start Interview"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Session Interface */}
      {currentSession && !isSessionCompleted() && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video/Question Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Session Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentSession.job_role} Interview</h3>
                    <p className="text-sm text-muted-foreground">
                      Question {currentSession.current_question + 1} of {currentSession.questions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {formatTime(timeElapsed)}
                    </div>
                    <Button variant="outline" size="sm" onClick={resetSession}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
                <Progress value={getProgressPercentage()} className="w-full" />
              </CardHeader>
            </Card>

            {/* Video Panel */}
            {sessionSettings.include_video && (
              <Card>
                <CardContent className="p-4">
                  <div className="relative bg-gray-100 rounded-lg aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                      <Button
                        variant={isVideoOn ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                      >
                        {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Current Question</h3>
                  {getCurrentQuestion() && (
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(getCurrentQuestion()!.difficulty)}>
                        {getCurrentQuestion()!.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {getCurrentQuestion()!.expectedDuration}m
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {getCurrentQuestion() && (
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed">
                      {getCurrentQuestion()!.question}
                    </p>
                    
                    {getCurrentQuestion()!.tips && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          Tips for a great answer:
                        </h4>
                        <ul className="text-sm space-y-1">
                          {getCurrentQuestion()!.tips!.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Input */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Response</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your response here..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="min-h-[120px]"
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {currentResponse.length} characters
                  </p>
                  <Button 
                    onClick={submitResponse}
                    disabled={!currentResponse.trim()}
                  >
                    {currentSession.current_question === currentSession.questions.length - 1 
                      ? "Finish Interview" 
                      : "Next Question"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Progress</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentSession.questions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className={`p-3 rounded-lg border ${
                      index === currentSession.current_question 
                        ? 'border-primary bg-primary/5' 
                        : index < currentSession.current_question 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Q{index + 1}</span>
                      {index < currentSession.current_question && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {index === currentSession.current_question && (
                        <Clock className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {question.category}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {currentSession && isSessionCompleted() && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Interview Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {currentSession.overall_score}/100
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {currentSession.questions.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatTime(timeElapsed)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.floor(timeElapsed / currentSession.questions.length / 60)}m
                  </div>
                  <p className="text-sm text-muted-foreground">Avg per Question</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {currentSession.strengths?.map((strength, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Areas */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {currentSession.improvement_areas?.map((area, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600">⚠</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Practice Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Practice Recommendations
                </h4>
                <ul className="space-y-2">
                  {currentSession.practice_recommendations?.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 mt-6">
                <Button onClick={() => setShowSettings(true)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Practice Again
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!currentSession && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to Practice?</h3>
          <p className="text-muted-foreground mb-6">
            Start an AI-powered interview session to improve your skills and confidence.
          </p>
          <Button onClick={() => setShowSettings(true)} size="lg">
            <Play className="w-4 h-4 mr-2" />
            Start Your First Interview
          </Button>
        </div>
      )}
    </div>
  );
}