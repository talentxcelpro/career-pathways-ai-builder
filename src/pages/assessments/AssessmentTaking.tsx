import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  points: number;
  time_limit_seconds?: number;
  metadata: any;
}

interface Assessment {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  instructions?: string;
  settings: any;
}

interface Attempt {
  id: string;
  started_at: string;
  status: string;
}

export default function AssessmentTaking() {
  const { assessmentId, attemptId } = useParams();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (assessmentId && attemptId) {
      loadAssessmentData();
    }
  }, [assessmentId, attemptId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadAssessmentData = async () => {
    try {
      // Load assessment details
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      // Load attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;
      setAttempt(attemptData);

      // Calculate time remaining
      const startTime = new Date(attemptData.started_at).getTime();
      const durationMs = assessmentData.duration_minutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      setTimeRemaining(Math.floor(remainingMs / 1000));

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('is_active', true)
        .order('sort_order');

      if (questionsError) throw questionsError;
      
      // Shuffle questions if settings allow
      let finalQuestions = questionsData || [];
      const settings = assessmentData.settings as any;
      if (settings?.shuffle_questions) {
        finalQuestions = [...finalQuestions].sort(() => Math.random() - 0.5);
      }
      
      setQuestions(finalQuestions);

      // Load existing answers
      const { data: responsesData } = await supabase
        .from('assessment_responses')
        .select('question_id, user_answer')
        .eq('attempt_id', attemptId);

      if (responsesData) {
        const existingAnswers: { [key: string]: any } = {};
        responsesData.forEach(response => {
          existingAnswers[response.question_id] = response.user_answer;
        });
        setAnswers(existingAnswers);
      }

    } catch (error) {
      console.error('Error loading assessment:', error);
      toast.error('Failed to load assessment');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = useCallback(async (questionId: string, answer: any) => {
    try {
      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          user_answer: answer,
          answered_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }, [attemptId]);

  const handleAnswerChange = (answer: any) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    saveAnswer(currentQuestion.id, answer);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = async () => {
    await submitAssessment(true);
  };

  const submitAssessment = async (autoSubmit = false) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      // Update attempt status
      const { error: updateError } = await supabase
        .from('assessment_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_taken_seconds: assessment!.duration_minutes * 60 - timeRemaining
        })
        .eq('id', attemptId);

      if (updateError) throw updateError;

      // Calculate scores (this would be done by the scoring function)
      await supabase.rpc('calculate_assessment_score', { attempt_uuid: attemptId });

      toast.success(autoSubmit ? 'Assessment auto-submitted due to time limit' : 'Assessment submitted successfully!');
      navigate(`/assessments/${assessmentId}/results/${attemptId}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    const currentAnswer = answers[question.id];

    switch (question.question_type) {
      case 'single_choice':
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            {question.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option.text || option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={currentAnswer?.includes(option.value || option)}
                  onCheckedChange={(checked) => {
                    const newAnswer = currentAnswer || [];
                    if (checked) {
                      handleAnswerChange([...newAnswer, option.value || option]);
                    } else {
                      handleAnswerChange(newAnswer.filter((item: any) => item !== (option.value || option)));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option.text || option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <RadioGroup value={currentAnswer} onValueChange={handleAnswerChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'essay':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer here..."
            className="min-h-32"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!assessment || !questions.length) {
    return (
      <div className="container mx-auto p-6 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Assessment not found</h1>
        <Button onClick={() => navigate('/assessments')}>Back to Assessments</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={timeRemaining < 300 ? 'text-red-600 border-red-600' : ''}>
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{getAnsweredCount()} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.question_text}
          </CardTitle>
          {currentQuestion.points > 1 && (
            <div className="text-sm text-muted-foreground">
              Worth {currentQuestion.points} points
            </div>
          )}
        </CardHeader>
        <CardContent>
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSubmitDialog(true)}>
            <Flag className="h-4 w-4 mr-1" />
            Submit Assessment
          </Button>
        </div>

        <Button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : answers[questions[index].id] ? "secondary" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {answers[questions[index].id] && <CheckCircle className="h-3 w-3" />}
                <span className={answers[questions[index].id] ? "sr-only" : ""}>{index + 1}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {getAnsweredCount()} out of {questions.length} questions.
              {getAnsweredCount() < questions.length && ' Unanswered questions will be marked as incorrect.'}
              {' '}Are you sure you want to submit your assessment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitAssessment()} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}