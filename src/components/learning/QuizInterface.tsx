import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'coding';
  options?: string[];
  correct?: number | boolean;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts: number;
}

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: (answers: Record<string, any>, score: number, passed: boolean) => void;
  onStart?: () => void;
  className?: string;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  quiz,
  onComplete,
  onStart,
  className
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isStarted || !timeRemaining || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeRemaining, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsStarted(true);
    onStart?.();
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple_choice' && userAnswer !== undefined) {
        if (userAnswer === question.correct) {
          correctAnswers++;
        }
      } else if (question.type === 'true_false' && userAnswer !== undefined) {
        if (userAnswer === question.correct) {
          correctAnswers++;
        }
      }
      // For essay and coding questions, assume they need manual grading
    });

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleSubmit = () => {
    const calculatedScore = calculateScore();
    const passed = calculatedScore >= quiz.passing_score;
    
    setScore(calculatedScore);
    setIsPassed(passed);
    setShowResults(true);
    
    onComplete(answers, calculatedScore, passed);
    
    if (passed) {
      toast.success(`Congratulations! You passed with ${calculatedScore}%`);
    } else {
      toast.error(`You scored ${calculatedScore}%. You need ${quiz.passing_score}% to pass.`);
    }
  };

  const handleRetry = () => {
    setIsStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setTimeRemaining(quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null);
    setScore(0);
    setIsPassed(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const question = quiz.questions[currentQuestion];

  if (showResults) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPassed ? 'Congratulations!' : 'Try Again'}
          </CardTitle>
          <p className="text-muted-foreground">
            You scored {score}% on this quiz
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{score}%</div>
            <div className="text-sm text-muted-foreground">
              Passing score: {quiz.passing_score}%
            </div>
          </div>

          {/* Question review */}
          <div className="space-y-4">
            <h3 className="font-semibold">Review your answers:</h3>
            {quiz.questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              
              return (
                <div key={q.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {q.type !== 'essay' && q.type !== 'coding' ? (
                      isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      )
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">Question {index + 1}: {q.question}</p>
                      {userAnswer !== undefined && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: {
                            q.type === 'multiple_choice' && q.options 
                              ? q.options[userAnswer] 
                              : userAnswer?.toString()
                          }
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-sm text-blue-600 mt-2">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isStarted) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <p className="text-muted-foreground">{quiz.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Questions:</strong> {quiz.questions.length}
            </div>
            <div>
              <strong>Passing Score:</strong> {quiz.passing_score}%
            </div>
            {quiz.time_limit_minutes && (
              <div>
                <strong>Time Limit:</strong> {quiz.time_limit_minutes} minutes
              </div>
            )}
            <div>
              <strong>Attempts:</strong> {quiz.max_attempts}
            </div>
          </div>
          
          <Button onClick={handleStart} className="w-full" size="lg">
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          {question.type === 'multiple_choice' && question.options && (
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {question.type === 'true_false' && (
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}
          
          {(question.type === 'essay' || question.type === 'coding') && (
            <Textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={`Enter your ${question.type === 'essay' ? 'essay' : 'code'} here...`}
              className="min-h-[200px]"
            />
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};