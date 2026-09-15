import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Mic, MicOff, Play, Pause, RotateCcw,
  Clock, Star, Brain, CheckCircle, AlertCircle,
  Video, Users, Target, Award, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  category: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
}

interface MockInterview {
  id: string;
  position: string;
  company: string;
  duration: number;
  questions: Question[];
  completed: boolean;
  score?: number;
}

interface InterviewPrepProps {
  className?: string;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({ className }) => {
  const [selectedInterview, setSelectedInterview] = useState<MockInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const [mockInterviews] = useState<MockInterview[]>([
    {
      id: '1',
      position: 'Senior Software Engineer',
      company: 'Tech Company',
      duration: 45,
      completed: false,
      questions: [
        {
          id: '1',
          text: 'Tell me about yourself and your experience with React.',
          category: 'behavioral',
          difficulty: 'easy',
          timeLimit: 120
        },
        {
          id: '2',
          text: 'Describe a challenging technical problem you solved recently.',
          category: 'technical',
          difficulty: 'medium',
          timeLimit: 180
        },
        {
          id: '3',
          text: 'How would you handle a conflict with a team member?',
          category: 'situational',
          difficulty: 'medium',
          timeLimit: 150
        }
      ]
    },
    {
      id: '2',
      position: 'Frontend Developer',
      company: 'Startup',
      duration: 30,
      completed: true,
      score: 85,
      questions: []
    }
  ]);

  const startInterview = useCallback((interview: MockInterview) => {
    setSelectedInterview(interview);
    setCurrentQuestionIndex(0);
    setIsInterviewActive(true);
    setTimeLeft(interview.questions[0]?.timeLimit || 120);
    toast.success('Interview started! Good luck!');
  }, []);

  const nextQuestion = useCallback(() => {
    if (!selectedInterview) return;
    
    if (currentQuestionIndex < selectedInterview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setResponse('');
      setTimeLeft(selectedInterview.questions[currentQuestionIndex + 1].timeLimit);
    } else {
      setIsInterviewActive(false);
      toast.success('Interview completed!');
    }
  }, [selectedInterview, currentQuestionIndex]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      toast.info('Recording started...');
    } else {
      toast.info('Recording stopped');
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInterviewActive && selectedInterview) {
    const currentQuestion = selectedInterview.questions[currentQuestionIndex];
    
    return (
      <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
        {/* Interview Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedInterview.position}</h2>
                <p className="text-muted-foreground">{selectedInterview.company}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">Time Remaining</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="text-sm">
                Question {currentQuestionIndex + 1} of {selectedInterview.questions.length}
              </div>
              <Badge variant="outline" className={cn(
                "text-xs",
                currentQuestion.difficulty === 'easy' ? 'border-green-500 text-green-700' :
                currentQuestion.difficulty === 'medium' ? 'border-yellow-500 text-yellow-700' :
                'border-red-500 text-red-700'
              )}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentQuestion.category}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interview Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium mb-4 p-4 bg-blue-50 rounded-lg">
              {currentQuestion.text}
            </div>
            
            {/* Response Area */}
            <div className="space-y-4">
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here or use voice recording..."
                rows={6}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={toggleRecording}
                    className="flex items-center gap-2"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Response
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setResponse('')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700">
                    {currentQuestionIndex < selectedInterview.questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Interview Progress</span>
              <span>{Math.round(((currentQuestionIndex + 1) / selectedInterview.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedInterview.questions.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Interview Prep Header */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Interview Preparation
          </CardTitle>
          <p className="text-muted-foreground">
            Practice with AI-powered mock interviews tailored to your target roles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Brain className="h-5 w-5" />, label: 'AI-Powered', desc: 'Smart question selection' },
              { icon: <Video className="h-5 w-5" />, label: 'Video Practice', desc: 'Record and review responses' },
              { icon: <TrendingUp className="h-5 w-5" />, label: 'Performance Tracking', desc: 'Track improvement over time' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg border">
                <div className="mx-auto w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 text-purple-600">
                  {feature.icon}
                </div>
                <h4 className="font-medium">{feature.label}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mock Interviews */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Available Mock Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInterviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{interview.position}</h4>
                        {interview.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{interview.company}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {interview.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {interview.questions.length} questions
                        </span>
                        {interview.score && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Score: {interview.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {interview.completed ? (
                        <Button variant="outline" size="sm">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => startInterview(interview)}
                          className="bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Interview
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Interview Success Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Use the STAR method for behavioral questions',
              'Research the company and role thoroughly',
              'Practice your elevator pitch',
              'Prepare thoughtful questions to ask',
              'Test your tech setup beforehand',
              'Have specific examples ready'
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};