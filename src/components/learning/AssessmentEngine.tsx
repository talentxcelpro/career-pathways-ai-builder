import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Star,
  RotateCcw,
  Eye,
  FileText,
  Lightbulb
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'coding';
  question: string;
  options?: string[];
  correct_answers: string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  code_template?: string;
  expected_output?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  questions: Question[];
  allow_retakes: boolean;
  show_correct_answers: boolean;
}

interface AssessmentEngineProps {
  assessment: Assessment;
  onComplete: (score: number, answers: Record<string, any>) => void;
  timeRemaining?: number;
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({
  assessment,
  onComplete,
  timeRemaining
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(timeRemaining || assessment.duration_minutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const currentQuestion = assessment.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        if (userAnswer === question.correct_answers[0]) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'multiple_select') {
        const correctAnswers = question.correct_answers.sort();
        const userAnswers = (userAnswer || []).sort();
        if (JSON.stringify(correctAnswers) === JSON.stringify(userAnswers)) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'short_answer') {
        // Simple text matching - in real app, use more sophisticated matching
        const correctAnswer = question.correct_answers[0].toLowerCase().trim();
        const userAnswerText = (userAnswer || '').toLowerCase().trim();
        if (correctAnswer === userAnswerText) {
          earnedPoints += question.points;
        }
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setIsSubmitted(true);
    onComplete(score, answers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getAnsweredQuestions = () => {
    return assessment.questions.filter(q => answers[q.id] !== undefined).length;
  };

  if (isSubmitted && !showReview) {
    const score = calculateScore();
    const passed = score >= assessment.passing_score;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {passed ? <Award className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Assessment Complete'}
          </CardTitle>
          <CardDescription>
            {passed 
              ? 'You have successfully passed the assessment!'
              : `You need ${assessment.passing_score}% to pass. Keep learning and try again!`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
            <div className="text-muted-foreground">
              {getAnsweredQuestions()} of {assessment.questions.length} questions answered
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{Math.round(score / 20)}</div>
              <div className="text-sm text-muted-foreground">Stars Earned</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatTime(assessment.duration_minutes * 60 - timeLeft)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <div className="space-y-2">
            {assessment.show_correct_answers && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowReview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Answers
              </Button>
            )}
            
            {assessment.allow_retakes && !passed && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
            )}
            
            <Button className="w-full">
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showReview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Answer Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assessment.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = question.type === 'multiple_choice' 
                  ? userAnswer === question.correct_answers[0]
                  : JSON.stringify(userAnswer) === JSON.stringify(question.correct_answers);

                return (
                  <div key={question.id} className="border-l-4 border-primary pl-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">
                        Question {index + 1}: {question.question}
                      </h4>
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Your answer:</span> {
                          Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'Not answered'
                        }
                      </p>
                      <p>
                        <span className="font-medium text-green-600">Correct answer:</span> {
                          question.correct_answers.join(', ')
                        }
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Explanation</p>
                          <p className="text-sm text-blue-700">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Questions</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
              {assessment.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? "default" : "outline"}
                  size="sm"
                  className={`relative ${answers[assessment.questions[index].id] ? 'ring-2 ring-green-200' : ''}`}
                  onClick={() => jumpToQuestion(index)}
                >
                  {index + 1}
                  {answers[assessment.questions[index].id] && (
                    <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                  )}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Answered:</span>
                <span>{getAnsweredQuestions()}/{assessment.questions.length}</span>
              </div>
              <Progress value={(getAnsweredQuestions() / assessment.questions.length) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Main Question Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {assessment.questions.length}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                  <span>{currentQuestion.points} points</span>
                </CardDescription>
              </div>
              <Progress 
                value={(currentQuestionIndex + 1) / assessment.questions.length * 100} 
                className="w-24"
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQuestion.question}</div>

            {/* Multiple Choice */}
            {currentQuestion.type === 'multiple_choice' && (
              <RadioGroup 
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Multiple Select */}
            {currentQuestion.type === 'multiple_select' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${index}`}
                      checked={(answers[currentQuestion.id] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        if (checked) {
                          handleAnswerChange(currentQuestion.id, [...currentAnswers, option]);
                        } else {
                          handleAnswerChange(currentQuestion.id, currentAnswers.filter((a: string) => a !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`checkbox-${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true_false' && (
              <RadioGroup 
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
              </RadioGroup>
            )}

            {/* Short Answer */}
            {currentQuestion.type === 'short_answer' && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Enter your answer..."
                rows={4}
              />
            )}

            {/* Coding Question */}
            {currentQuestion.type === 'coding' && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Template:</h4>
                  <pre className="text-sm overflow-x-auto">
                    {currentQuestion.code_template}
                  </pre>
                </div>
                <Textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Write your code here..."
                  rows={8}
                  className="font-mono"
                />
                {currentQuestion.expected_output && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Expected Output:</h4>
                    <pre className="text-sm">{currentQuestion.expected_output}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === assessment.questions.length - 1 ? (
                  <Button onClick={handleSubmit}>
                    Submit Assessment
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};