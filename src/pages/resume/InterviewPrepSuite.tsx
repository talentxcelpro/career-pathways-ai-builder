import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Video, Mic, Brain, Target, Users, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sampleAnswer?: string;
  tips: string[];
}

const interviewQuestions: Question[] = [
  {
    id: '1',
    text: 'Tell me about yourself.',
    category: 'general',
    difficulty: 'easy',
    sampleAnswer: 'Focus on your professional journey, key achievements, and what drives you in your career.',
    tips: [
      'Keep it professional and relevant to the role',
      'Structure: Present -> Past -> Future',
      'Highlight 2-3 key achievements',
      'End with why you\'re interested in this role'
    ]
  },
  {
    id: '2',
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Focus on your specific contributions',
      'Quantify the impact where possible',
      'Show problem-solving skills'
    ]
  },
  {
    id: '3',
    text: 'How do you handle working with difficult team members?',
    category: 'behavioral',
    difficulty: 'medium',
    tips: [
      'Show emotional intelligence',
      'Focus on communication and conflict resolution',
      'Provide a specific example',
      'Emphasize positive outcomes'
    ]
  },
  {
    id: '4',
    text: 'Explain the difference between React hooks and class components.',
    category: 'technical',
    difficulty: 'hard',
    tips: [
      'Cover both lifecycle and state management',
      'Mention performance considerations',
      'Discuss when to use each approach',
      'Show deep understanding of React concepts'
    ]
  },
  {
    id: '5',
    text: 'Where do you see yourself in 5 years?',
    category: 'general',
    difficulty: 'easy',
    tips: [
      'Align with the company\'s growth path',
      'Show ambition but be realistic',
      'Focus on skill development',
      'Demonstrate long-term thinking'
    ]
  }
];

const mockAnalysis = {
  overallScore: 78,
  breakdown: {
    clarity: 85,
    confidence: 75,
    content: 82,
    pacing: 70
  },
  feedback: [
    'Good use of specific examples',
    'Consider slowing down your pace slightly',
    'Excellent eye contact and body language',
    'Could improve on quantifying achievements'
  ]
};

const InterviewPrepSuite = () => {
  const [selectedRole, setSelectedRole] = useState('software-engineer');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCompletedSession, setHasCompletedSession] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'mock' | 'questions' | 'salary'>('mock');

  const filteredQuestions = interviewQuestions.filter(q => {
    if (selectedRole === 'software-engineer') return q.category === 'technical' || q.category === 'general';
    if (selectedRole === 'product-manager') return q.category === 'behavioral' || q.category === 'general';
    return q.category === 'general';
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    toast.success('Recording started - answer the question naturally');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.success('Recording stopped - analyzing your response...');
    
    // Simulate analysis
    setTimeout(() => {
      setHasCompletedSession(true);
      toast.success('Analysis complete!');
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsRecording(false);
      setRecordingTime(0);
      setHasCompletedSession(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = filteredQuestions[currentQuestion];

  return (
    <>
      <Helmet>
        <title>AI Interview Practice | Mock Interviews & Prep | TalentXcel</title>
        <meta 
          name="description" 
          content="Practice interviews with AI feedback. Role-specific questions, mock interviews, salary negotiation, and performance analysis." 
        />
        <link rel="canonical" href="https://talentxcel.in/interview-prep" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Header */}
        <section className="pt-8 pb-6 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-extrabold border border-blue-500/20">
              <Brain className="h-3.5 w-3.5" />
              <span>Interactive Interview Simulation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              AI Interview Prep Suite
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Practice role-specific mock interviews with real-time AI evaluation, master behavioral questions, and negotiate compensation with confidence.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <Video className="h-3 w-3 text-blue-500" />
                Video Practice
              </div>
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <Brain className="h-3 w-3 text-purple-500" />
                AI Analysis
              </div>
              <div className="bg-card px-3 py-1 rounded-full border border-border/80 text-[11px] font-semibold text-foreground flex items-center gap-1.5 shadow-sm">
                <Target className="h-3 w-3 text-emerald-500" />
                Role-Specific
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <Tabs value={practiceMode} onValueChange={(value) => setPracticeMode(value as any)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="mock">Mock Interview</TabsTrigger>
              <TabsTrigger value="questions">Question Bank</TabsTrigger>
              <TabsTrigger value="salary">Salary Negotiation</TabsTrigger>
            </TabsList>

            <TabsContent value="mock" className="space-y-6">
              {/* Role Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium">Target Role:</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[250px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software-engineer">Software Engineer</SelectItem>
                        <SelectItem value="product-manager">Product Manager</SelectItem>
                        <SelectItem value="data-scientist">Data Scientist</SelectItem>
                        <SelectItem value="designer">UX Designer</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline">
                      {filteredQuestions.length} questions available
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Question Panel */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          Question {currentQuestion + 1} of {filteredQuestions.length}
                        </CardTitle>
                        <Badge 
                          variant={question?.difficulty === 'hard' ? 'destructive' : 
                                 question?.difficulty === 'medium' ? 'default' : 'secondary'}
                        >
                          {question?.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {question && (
                        <>
                          <div className="p-6 bg-muted/50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
                            <Badge variant="outline">{question.category}</Badge>
                          </div>

                          {/* Recording Controls */}
                          <div className="text-center space-y-4">
                            <div className="flex justify-center items-center gap-4">
                              {!isRecording ? (
                                <Button 
                                  onClick={handleStartRecording}
                                  size="lg"
                                  className="gap-2"
                                >
                                  <Play className="h-5 w-5" />
                                  Start Recording
                                </Button>
                              ) : (
                                <Button 
                                  onClick={handleStopRecording}
                                  variant="destructive"
                                  size="lg"
                                  className="gap-2"
                                >
                                  <Pause className="h-5 w-5" />
                                  Stop Recording
                                </Button>
                              )}
                              
                              <Button variant="outline" size="lg">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                              </Button>
                            </div>

                            {isRecording && (
                              <div className="space-y-2">
                                <div className="flex justify-center items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                  <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Speak naturally and take your time
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Navigation */}
                          <div className="flex justify-between">
                            <Button 
                              variant="outline" 
                              disabled={currentQuestion === 0}
                              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                            >
                              Previous Question
                            </Button>
                            <Button 
                              disabled={currentQuestion === filteredQuestions.length - 1}
                              onClick={handleNextQuestion}
                            >
                              Next Question
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Panel */}
                <div className="space-y-6">
                  {hasCompletedSession && (
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {mockAnalysis.overallScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(mockAnalysis.breakdown).map(([key, value]) => (
                            <div key={key}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{key}</span>
                                <span>{value}%</span>
                              </div>
                              <Progress value={value} className="h-2" />
                            </div>
                          ))}
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Feedback</h4>
                          <div className="space-y-1">
                            {mockAnalysis.feedback.map((item, index) => (
                              <p key={index} className="text-xs text-muted-foreground">
                                • {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Tips for This Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question?.tips && (
                        <div className="space-y-2">
                          {question.tips.map((tip, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {tip}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewQuestions.map((q) => (
                  <Card key={q.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant={q.difficulty === 'hard' ? 'destructive' : 
                                 q.difficulty === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {q.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.category}
                        </Badge>
                      </div>
                      <h3 className="font-medium mb-3 line-clamp-2">{q.text}</h3>
                      <Button variant="outline" size="sm" className="w-full">
                        Practice This
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Negotiation Scenarios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertDescription>
                        Practice common salary negotiation scenarios with AI feedback
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Initial Offer Negotiation
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Counteroffer Strategy
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Benefits Package Discussion
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Equity and Stock Options
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Data Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">$95,000</div>
                        <div className="text-sm text-muted-foreground">Average for your role</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="font-semibold">$75,000</div>
                          <div className="text-xs text-muted-foreground">25th percentile</div>
                        </div>
                        <div>
                          <div className="font-semibold">$125,000</div>
                          <div className="text-xs text-muted-foreground">75th percentile</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default InterviewPrepSuite;