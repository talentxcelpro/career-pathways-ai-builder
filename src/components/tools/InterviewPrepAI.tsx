import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Mic, MicOff, Star, Target, Brain, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
  sampleAnswer?: string;
}

interface InterviewSession {
  id: string;
  jobTitle: string;
  companyName: string;
  interviewType: 'phone' | 'video' | 'in-person' | 'panel';
  questions: InterviewQuestion[];
  userAnswers: { questionId: string; answer: string; rating?: number; feedback?: string }[];
  score?: number;
  completed: boolean;
  duration?: number;
}

export const InterviewPrepAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Setup form states
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [interviewType, setInterviewType] = useState<'phone' | 'video' | 'in-person' | 'panel'>('video');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);

  const startNewSession = async () => {
    if (!jobTitle) {
      toast.error('Please enter a job title');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep-ai', {
        body: {
          action: 'generate_questions',
          jobTitle,
          companyName,
          interviewType,
          focusAreas
        }
      });

      if (error) throw error;

      const newSession: InterviewSession = {
        id: `session_${Date.now()}`,
        jobTitle,
        companyName,
        interviewType,
        questions: data.questions,
        userAnswers: [],
        completed: false
      };

      setCurrentSession(newSession);
      setActiveTab('interview');
      setCurrentQuestionIndex(0);
      setSessionTimer(0);
      setIsSessionActive(true);

      toast.success('Interview session started!');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate interview questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentSession || !userAnswer.trim()) return;

    const currentQuestion = currentSession.questions[currentQuestionIndex];
    
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep-ai', {
        body: {
          action: 'evaluate_answer',
          question: currentQuestion.question,
          answer: userAnswer,
          jobTitle: currentSession.jobTitle,
          category: currentQuestion.category
        }
      });

      if (error) throw error;

      const newAnswer = {
        questionId: currentQuestion.id,
        answer: userAnswer,
        rating: data.rating,
        feedback: data.feedback
      };

      setCurrentSession(prev => ({
        ...prev!,
        userAnswers: [...prev!.userAnswers, newAnswer]
      }));

      // Move to next question or complete session
      if (currentQuestionIndex < currentSession.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer('');
      } else {
        completeSession();
      }

    } catch (error) {
      console.error('Error evaluating answer:', error);
      toast.error('Failed to evaluate answer');
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase.functions.invoke('interview-prep-ai', {
        body: {
          action: 'complete_session',
          session: {
            ...currentSession,
            duration: sessionTimer,
            completed: true
          }
        }
      });

      if (error) throw error;

      setCurrentSession(prev => ({
        ...prev!,
        score: data.overallScore,
        completed: true,
        duration: sessionTimer
      }));

      setIsSessionActive(false);
      setActiveTab('results');
      toast.success('Interview session completed!');

    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = currentSession?.questions[currentQuestionIndex];
  const progress = currentSession ? ((currentQuestionIndex + 1) / currentSession.questions.length) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Prep AI</h1>
          <p className="text-muted-foreground">Practice interviews with AI-powered feedback</p>
        </div>
        {isSessionActive && (
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(sessionTimer)}
            </Badge>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {currentSession?.questions.length}
            </Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="interview" disabled={!currentSession}>Interview</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentSession?.completed}>Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Interview Type</label>
                <Select value={interviewType} onValueChange={(value: any) => setInterviewType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Interview</SelectItem>
                    <SelectItem value="video">Video Interview</SelectItem>
                    <SelectItem value="in-person">In-Person Interview</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Focus Areas</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Technical Skills', 'Behavioral', 'Leadership', 'Problem Solving', 'Communication'].map(area => (
                    <Badge
                      key={area}
                      variant={focusAreas.includes(area) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFocusAreas(prev => 
                          prev.includes(area) 
                            ? prev.filter(a => a !== area)
                            : [...prev, area]
                        );
                      }}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={startNewSession} 
                disabled={isGenerating || !jobTitle}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Questions...' : 'Start Interview Practice'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          {currentSession && currentQuestion && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                    <Badge variant={
                      currentQuestion.difficulty === 'easy' ? 'secondary' :
                      currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg font-medium">{currentQuestion.question}</p>
                    <Badge variant="outline" className="mt-2">
                      {currentQuestion.category}
                    </Badge>
                  </div>

                  {currentQuestion.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Tips:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {currentQuestion.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {isRecording ? 'Recording in progress...' : 'Click to record your answer'}
                      </span>
                    </div>

                    <Textarea
                      placeholder="Type your answer here..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-32"
                    />

                    <div className="flex gap-2">
                      <Button onClick={submitAnswer} disabled={!userAnswer.trim()}>
                        <Target className="h-4 w-4 mr-2" />
                        Submit Answer
                      </Button>
                      <Button variant="outline" onClick={() => setUserAnswer('')}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {currentSession?.completed && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Interview Results
                    <Badge variant="default">
                      <Star className="h-4 w-4 mr-1" />
                      Score: {currentSession.score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentSession.questions.length}</div>
                      <div className="text-sm text-muted-foreground">Questions Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(currentSession.duration || 0)}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(currentSession.userAnswers.reduce((sum, a) => sum + (a.rating || 0), 0) / currentSession.userAnswers.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentSession.userAnswers.map((answer, index) => {
                      const question = currentSession.questions.find(q => q.id === answer.questionId);
                      return (
                        <Card key={answer.questionId}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Question {index + 1}</h4>
                              <Badge variant={
                                (answer.rating || 0) >= 8 ? 'default' :
                                (answer.rating || 0) >= 6 ? 'secondary' : 'destructive'
                              }>
                                {answer.rating}/10
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{question?.question}</p>
                            <p className="text-sm mb-2">{answer.answer}</p>
                            {answer.feedback && (
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">{answer.feedback}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Interview history coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};