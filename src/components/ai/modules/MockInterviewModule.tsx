import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface MockInterviewModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Answer {
  questionId: number;
  answer: string;
  feedback?: string;
  score?: number;
}

export const MockInterviewModule: React.FC<MockInterviewModuleProps> = ({ onResult, userProfile }) => {
  const [interviewMode, setInterviewMode] = useState<'setup' | 'active' | 'review'>('setup');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const { prepareForInterview, isProcessing } = useAIService();

  // Timer for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const generateQuestions = async () => {
    if (!role.trim()) {
      toast.error('Please specify the role you\'re interviewing for.');
      return;
    }

    try {
      const interviewData = await prepareForInterview(
        { title: role, description: `${role} position with ${experience} experience level` },
        userProfile || { name: 'User', skills: [] }
      );

      if (interviewData.success) {
        // Generate mock questions based on role and experience
        const mockQuestions: Question[] = [
          { id: 1, question: `Tell me about yourself and why you're interested in this ${role} position.`, category: 'Introduction', difficulty: 'Easy' },
          { id: 2, question: `Describe a challenging project you've worked on. How did you handle it?`, category: 'Experience', difficulty: 'Medium' },
          { id: 3, question: `What are your greatest strengths and how do they relate to this role?`, category: 'Strengths', difficulty: 'Easy' },
          { id: 4, question: `How do you handle working under pressure and tight deadlines?`, category: 'Behavioral', difficulty: 'Medium' },
          { id: 5, question: `Where do you see yourself in 5 years?`, category: 'Goals', difficulty: 'Easy' },
        ];

        setQuestions(mockQuestions);
        setInterviewMode('active');
        setCurrentQuestionIndex(0);
        onResult(`Mock interview started! ${mockQuestions.length} questions prepared for ${role} position.`);
      }
    } catch (error) {
      toast.error('Failed to generate interview questions. Please try again.');
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before proceeding.');
      return;
    }

    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      answer: currentAnswer,
      score: Math.floor(Math.random() * 30) + 70, // Mock scoring
      feedback: `Good response! Consider adding more specific examples and quantifiable results.`
    };

    setAnswers(prev => [...prev, newAnswer]);
    setCurrentAnswer('');
    setTimer(0);
    setIsRecording(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setInterviewMode('review');
      onResult('Mock interview completed! Review your performance and feedback.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOverallScore = () => {
    if (answers.length === 0) return 0;
    return Math.round(answers.reduce((sum, answer) => sum + (answer.score || 0), 0) / answers.length);
  };

  if (interviewMode === 'setup') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Mock Interview Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role/Position</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select experience level</option>
              <option value="Entry Level">Entry Level (0-2 years)</option>
              <option value="Mid Level">Mid Level (3-5 years)</option>
              <option value="Senior Level">Senior Level (6+ years)</option>
            </select>
          </div>

          <Button 
            onClick={generateQuestions} 
            disabled={isProcessing || !role.trim() || !experience}
            className="w-full"
          >
            {isProcessing ? 'Preparing Interview...' : 'Start Mock Interview'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (interviewMode === 'active') {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Mock Interview - Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1}/{questions.length}</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          </div>

          {/* Question */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge variant={currentQuestion.difficulty === 'Hard' ? 'destructive' : currentQuestion.difficulty === 'Medium' ? 'secondary' : 'default'}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{currentQuestion.question}</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Response Time:</span>
            <Badge variant="outline">{formatTime(timer)}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRecording ? 'Pause' : 'Start'}
            </Button>
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Answer</label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here... Use the STAR method (Situation, Task, Action, Result) for behavioral questions."
              className="w-full h-32 p-3 border rounded-md resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentAnswer('')}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={submitAnswer} className="flex-1">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Review mode
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Interview Review & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-3xl font-bold text-primary">{getOverallScore()}%</div>
          <div className="text-sm text-muted-foreground">Overall Performance</div>
        </div>

        {/* Individual Question Feedback */}
        <div className="space-y-3">
          <h4 className="font-medium">Question-by-Question Feedback</h4>
          {answers.map((answer, index) => {
            const question = questions.find(q => q.id === answer.questionId);
            return (
              <div key={answer.questionId} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Q{index + 1}: {question?.category}
                  </Badge>
                  <Badge variant={answer.score! >= 80 ? 'default' : answer.score! >= 60 ? 'secondary' : 'destructive'}>
                    {answer.score}%
                  </Badge>
                </div>
                <p className="text-sm font-medium">{question?.question}</p>
                <p className="text-xs text-muted-foreground">{answer.feedback}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setInterviewMode('setup');
              setAnswers([]);
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setCurrentAnswer('');
              setTimer(0);
            }}
            className="flex-1"
          >
            New Interview
          </Button>
          <Button 
            onClick={() => onResult(`Interview completed with ${getOverallScore()}% overall score. Ready for your next challenge!`)}
            className="flex-1"
          >
            Save Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};