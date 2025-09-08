import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  StopCircle, 
  MessageSquare, 
  Brain, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Lightbulb,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useInterviewSimulator } from '@/hooks/useInterviewSimulator';
import { toast } from 'sonner';

const AIInterviewSimulator: React.FC = () => {
  const [setupStep, setSetupStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const {
    currentSession,
    isLoading,
    error,
    startInterviewSession,
    submitAnswer,
    getCurrentQuestion,
    endSession,
    resetSession
  } = useInterviewSimulator();

  const handleStartInterview = async () => {
    if (!jobTitle || !company || !jobDescription || !interviewType) {
      toast.error('Please fill in all required fields');
      return;
    }

    const session = await startInterviewSession(jobTitle, company, jobDescription, interviewType);
    if (session) {
      setSetupStep(2);
      toast.success('Interview session started! Good luck!');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    const evaluation = await submitAnswer(currentAnswer);
    if (evaluation) {
      setCurrentAnswer('');
      toast.success(`Answer evaluated! Score: ${evaluation.overall_score.toFixed(1)}/10`);
    }
  };

  const handleEndInterview = () => {
    endSession();
    toast.info('Interview session ended');
  };

  const handleRestart = () => {
    resetSession();
    setSetupStep(1);
    setJobTitle('');
    setCompany('');
    setJobDescription('');
    setInterviewType('');
    setCurrentAnswer('');
  };

  const currentQuestion = getCurrentQuestion();
  const progress = currentSession ? ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100 : 0;

  // Setup Phase
  if (!currentSession || setupStep === 1) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Interview Simulator</h2>
            <p className="text-muted-foreground">Practice interviews with AI-powered feedback and coaching</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Realistic Questions</h3>
              <p className="text-xs text-muted-foreground">Industry-specific interview questions</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Real-time Feedback</h3>
              <p className="text-xs text-muted-foreground">Instant evaluation and scoring</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Skill Assessment</h3>
              <p className="text-xs text-muted-foreground">Comprehensive performance analysis</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="p-4 text-center">
              <Lightbulb className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Improvement Tips</h3>
              <p className="text-xs text-muted-foreground">Actionable suggestions for growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Job Title *</label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company *</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Interview Type *</label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="case-study">Case Study Interview</SelectItem>
                  <SelectItem value="leadership">Leadership Interview</SelectItem>
                  <SelectItem value="culture-fit">Culture Fit Interview</SelectItem>
                  <SelectItem value="panel">Panel Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Job Description *</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
              />
            </div>

            <Button 
              onClick={handleStartInterview}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Interview Simulation
                </>
              )}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interview Phase
  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{currentSession.jobTitle} Interview</h2>
            <p className="text-muted-foreground">{currentSession.company} • {currentSession.interviewType}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={currentSession.status === 'completed' ? 'default' : 'secondary'}>
            {currentSession.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
          <Button onClick={handleEndInterview} variant="outline" size="sm">
            <StopCircle className="h-4 w-4 mr-1" />
            End Interview
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Main Interview Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Question */}
        <div className="lg:col-span-2 space-y-4">
          {currentQuestion && currentSession.status === 'active' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Current Question
                  <Badge variant="outline" className="ml-auto">
                    {currentQuestion.type} • {currentQuestion.difficulty}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed mb-4">{currentQuestion.question}</p>
                
                <div className="space-y-4">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitAnswer}
                      disabled={isLoading || !currentAnswer.trim()}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentAnswer('')}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Complete */}
          {currentSession.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Interview Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {currentSession.overallScore.toFixed(1)}/10
                  </div>
                  <p className="text-muted-foreground">Overall Interview Score</p>
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button onClick={handleRestart} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Start New Interview
                  </Button>
                  <Button variant="outline">
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Performance & History */}
        <div className="space-y-4">
          {/* Current Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Score</span>
                  <span className="font-bold">{currentSession.overallScore.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Questions Answered</span>
                  <span className="font-bold">{currentSession.conversation.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Elapsed</span>
                  <span className="font-bold">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {Math.floor((new Date().getTime() - currentSession.startedAt.getTime()) / 60000)}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {currentSession.conversation
                    .filter(msg => msg.evaluation)
                    .slice(-3)
                    .map((msg, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" size="sm">
                            Score: {msg.evaluation!.overall_score.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {msg.evaluation!.strengths.slice(0, 1).map((strength, i) => (
                            <p key={i} className="text-xs text-green-600">✓ {strength}</p>
                          ))}
                          {msg.evaluation!.areas_for_improvement.slice(0, 1).map((area, i) => (
                            <p key={i} className="text-xs text-amber-600">→ {area}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewSimulator;