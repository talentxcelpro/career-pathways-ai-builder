import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { 
  Brain, 
  Video, 
  Clock, 
  Target, 
  CheckCircle, 
  Star,
  Play,
  Pause,
  RotateCcw,
  Mic,
  Camera,
  Users,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Lightbulb
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  suggested_answer?: string;
  tips: string[];
  follow_up_questions?: string[];
}

interface MockInterview {
  id: string;
  user_id: string;
  job_role: string;
  company_name: string;
  duration_minutes: number;
  questions: InterviewQuestion[];
  user_responses: Record<string, string>;
  ai_feedback: Record<string, any>;
  overall_score: number;
  completed_at?: string;
  status: 'draft' | 'in_progress' | 'completed';
}

interface InterviewAnalytics {
  total_sessions: number;
  average_score: number;
  strong_areas: string[];
  improvement_areas: string[];
  progress_trend: number[];
}

export const InterviewPreparationSystem: React.FC = () => {
  const user = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('practice');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [response, setResponse] = useState('');
  const [interviewSetup, setInterviewSetup] = useState({
    role: '',
    company: '',
    experience_level: '',
    interview_type: ''
  });

  // Sample questions database
  const questionBank: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your background.',
      category: 'behavioral',
      difficulty: 'easy',
      tips: [
        'Keep it professional and relevant to the role',
        'Follow the present-past-future structure',
        'Highlight your key achievements',
        'Keep it under 2 minutes'
      ],
      follow_up_questions: [
        'What motivated you to apply for this role?',
        'How does this position align with your career goals?'
      ]
    },
    {
      id: '2',
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      category: 'behavioral',
      difficulty: 'medium',
      tips: [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Focus on your specific contributions',
        'Quantify the impact where possible',
        'Show problem-solving skills'
      ],
      follow_up_questions: [
        'What would you do differently if you faced a similar situation again?',
        'How did this experience change your approach to future projects?'
      ]
    },
    {
      id: '3',
      question: 'Explain the concept of closures in JavaScript.',
      category: 'technical',
      difficulty: 'medium',
      suggested_answer: 'A closure is when a function retains access to variables from its outer scope even after the outer function has finished executing.',
      tips: [
        'Start with a simple definition',
        'Provide a practical example',
        'Explain the use cases',
        'Mention memory implications'
      ]
    },
    {
      id: '4',
      question: 'How would you handle a situation where you disagree with your manager\'s approach?',
      category: 'situational',
      difficulty: 'medium',
      tips: [
        'Show respect for hierarchy',
        'Demonstrate communication skills',
        'Focus on constructive solutions',
        'Show willingness to compromise'
      ]
    },
    {
      id: '5',
      question: 'Why do you want to work at our company specifically?',
      category: 'company-specific',
      difficulty: 'easy',
      tips: [
        'Research the company thoroughly',
        'Mention specific values or initiatives',
        'Connect your goals with company mission',
        'Show genuine enthusiasm'
      ]
    }
  ];

  // Fetch user's mock interviews
  const { data: mockInterviews = [] } = useQuery({
    queryKey: ['mock-interviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MockInterview[];
    },
    enabled: !!user?.id
  });

  // Fetch interview analytics
  const { data: analytics } = useQuery({
    queryKey: ['interview-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const completed = mockInterviews.filter(i => i.status === 'completed');
      const totalSessions = completed.length;
      const averageScore = totalSessions > 0 
        ? completed.reduce((acc, i) => acc + i.overall_score, 0) / totalSessions 
        : 0;
      
      return {
        total_sessions: totalSessions,
        average_score: averageScore,
        strong_areas: ['Communication', 'Technical Knowledge'],
        improvement_areas: ['Confidence', 'Storytelling'],
        progress_trend: completed.slice(-5).map(i => i.overall_score)
      } as InterviewAnalytics;
    },
    enabled: !!user?.id && mockInterviews.length > 0
  });

  // Start mock interview mutation
  const startInterviewMutation = useMutation({
    mutationFn: async (setup: typeof interviewSetup) => {
      const selectedQuestions = questionBank
        .filter(q => {
          if (setup.interview_type === 'technical') return q.category === 'technical';
          if (setup.interview_type === 'behavioral') return q.category === 'behavioral';
          return true; // Mixed interview includes all types
        })
        .slice(0, 5);

      const { data, error } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: user?.id,
          job_role: setup.role,
          company_name: setup.company,
          duration_minutes: 30,
          questions: selectedQuestions,
          user_responses: {},
          ai_feedback: {},
          overall_score: 0,
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-interviews'] });
      toast.success('Mock interview started!');
      setCurrentQuestion(0);
      setTimeElapsed(0);
    }
  });

  // Submit interview response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async ({ interviewId, questionId, response }: {
      interviewId: string;
      questionId: string;
      response: string;
    }) => {
      const interview = mockInterviews.find(i => i.id === interviewId);
      if (!interview) throw new Error('Interview not found');

      const updatedResponses = {
        ...interview.user_responses,
        [questionId]: response
      };

      const { error } = await supabase
        .from('mock_interviews')
        .update({ user_responses: updatedResponses })
        .eq('id', interviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Response saved!');
      setResponse('');
      if (currentQuestion < questionBank.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Store timer ID to clear it later
    setTimeout(() => {
      setIsRecording(false);
      clearInterval(timer);
    }, 120000); // Auto-stop after 2 minutes
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestionData = questionBank[currentQuestion];
  const inProgressInterview = mockInterviews.find(i => i.status === 'in_progress');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Interview Preparation System</h1>
        <p className="text-muted-foreground">
          Practice with AI-powered mock interviews and get personalized feedback
        </p>
      </div>

      {/* Stats Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{analytics.total_sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{analytics.average_score.toFixed(1)}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Skill Level</p>
                  <p className="text-2xl font-bold">Intermediate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="mock-interview">Mock Interview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Practice Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Categories */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Practice by Category</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { category: 'Behavioral', icon: Users, count: 25 },
                      { category: 'Technical', icon: Brain, count: 30 },
                      { category: 'Situational', icon: Target, count: 20 },
                      { category: 'Company', icon: FileText, count: 15 }
                    ].map((item) => (
                      <Card key={item.category} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4 text-center">
                          <item.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h4 className="font-medium">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">{item.count} questions</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Current Question</h3>
                    <Badge variant="secondary">
                      {currentQuestion + 1} of {questionBank.length}
                    </Badge>
                  </div>
                  
                  <Card className="border-primary">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={currentQuestionData?.difficulty === 'hard' ? 'destructive' : 'secondary'}>
                            {currentQuestionData?.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {currentQuestionData?.category}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium text-lg">{currentQuestionData?.question}</h4>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Tips:</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {currentQuestionData?.tips.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Area */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Your Response</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{formatTime(timeElapsed)}</span>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Type your response here or use voice recording..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                    />
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={handleStartRecording}
                        disabled={isRecording}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording ? 'Recording...' : 'Record Answer'}
                      </Button>
                      
                      <Button 
                        onClick={() => setCurrentQuestion(prev => Math.min(prev + 1, questionBank.length - 1))}
                        disabled={currentQuestion >= questionBank.length - 1}
                      >
                        Next Question
                      </Button>
                      
                      <Button variant="outline" onClick={() => setCurrentQuestion(0)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mock Interview Tab */}
        <TabsContent value="mock-interview" className="space-y-6">
          {!inProgressInterview ? (
            <Card>
              <CardHeader>
                <CardTitle>Start Full Mock Interview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job Role</label>
                      <Input
                        placeholder="e.g., Software Engineer"
                        value={interviewSetup.role}
                        onChange={(e) => setInterviewSetup(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        placeholder="e.g., Google"
                        value={interviewSetup.company}
                        onChange={(e) => setInterviewSetup(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Experience Level</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={interviewSetup.experience_level}
                        onChange={(e) => setInterviewSetup(prev => ({ ...prev, experience_level: e.target.value }))}
                      >
                        <option value="">Select level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="lead">Lead/Principal</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Interview Type</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={interviewSetup.interview_type}
                        onChange={(e) => setInterviewSetup(prev => ({ ...prev, interview_type: e.target.value }))}
                      >
                        <option value="">Select type</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="technical">Technical</option>
                        <option value="mixed">Mixed (Recommended)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What to expect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 5-7 questions based on your selected type</li>
                      <li>• 30-45 minute session with timing</li>
                      <li>• AI-powered feedback and scoring</li>
                      <li>• Personalized improvement recommendations</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => startInterviewMutation.mutate(interviewSetup)}
                    disabled={!interviewSetup.role || !interviewSetup.interview_type}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Mock Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Mock Interview in Progress</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge>Question {currentQuestion + 1} of {inProgressInterview.questions.length}</Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timeElapsed)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Progress value={((currentQuestion + 1) / inProgressInterview.questions.length) * 100} />
                  
                  <div className="p-6 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-4">{currentQuestionData?.question}</h3>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Speak naturally as if you're in a real interview..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={6}
                      />
                      
                      <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleStartRecording}>
                          <Camera className="h-4 w-4 mr-2" />
                          Record Video Response
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            if (inProgressInterview) {
                              submitResponseMutation.mutate({
                                interviewId: inProgressInterview.id,
                                questionId: currentQuestionData.id,
                                response
                              });
                            }
                          }}
                        >
                          Submit & Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interview Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {mockInterviews.filter(i => i.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No completed interviews yet</h3>
                  <p className="text-muted-foreground">Complete a mock interview to see detailed feedback</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <div className="text-2xl font-bold">{analytics?.average_score.toFixed(1)}</div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">+15%</div>
                        <p className="text-sm text-muted-foreground">Improvement</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-sm text-muted-foreground">Confidence Level</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strengths and Areas for Improvement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics?.strong_areas.map((area, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium">{area}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics?.improvement_areas.map((area, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Target className="h-5 w-5 text-orange-600" />
                              <span className="font-medium">{area}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Interview Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockInterviews.filter(i => i.status === 'completed').slice(0, 3).map((interview) => (
                          <div key={interview.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{interview.job_role}</h4>
                                <p className="text-sm text-muted-foreground">{interview.company_name}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{interview.overall_score}/10</div>
                                <p className="text-sm text-muted-foreground">
                                  {interview.completed_at && new Date(interview.completed_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm">
                              <Badge className="mr-2">
                                {interview.questions.length} questions
                              </Badge>
                              <Badge variant="secondary">
                                {interview.duration_minutes} minutes
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'STAR Method for Behavioral Questions',
                    'Technical Interview Preparation',
                    'Body Language and Presentation',
                    'Salary Negotiation Strategies',
                    'Common Interview Mistakes to Avoid'
                  ].map((guide, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{guide}</span>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Read
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Before the Interview</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Research the company and role thoroughly</li>
                      <li>• Prepare specific examples using STAR method</li>
                      <li>• Practice common questions out loud</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900">During the Interview</h4>
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      <li>• Listen carefully to each question</li>
                      <li>• Take a moment to think before answering</li>
                      <li>• Ask clarifying questions when needed</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900">After the Interview</h4>
                    <ul className="text-sm text-purple-700 mt-2 space-y-1">
                      <li>• Send a thank-you email within 24 hours</li>
                      <li>• Reflect on areas for improvement</li>
                      <li>• Follow up if you haven't heard back</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};