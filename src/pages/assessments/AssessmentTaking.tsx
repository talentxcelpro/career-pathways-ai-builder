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

      // Load questions via the public view — it deliberately excludes
      // correct_answer/explanation, which the client must never receive
      // before (or during) grading. See migration
      // 20260813_fix_real_assessment_engine_security.sql.
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions_public')
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
      console.error('Error loading assessment data:', error);
      toast.error('Failed to load assessment data');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId: string, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Save answer to database immediately
    try {
      await supabase
        .from('assessment_responses')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          user_answer: answer,
          time_spent_seconds: 0 // Could track per-question time if needed
        });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    toast.warning('Time expired! Submitting your assessment...');
    await submitAssessment();
  }, []);

  const submitAssessment = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1. Ensure all current local answers are persisted to assessment_responses.
      // The Postgres BEFORE INSERT/UPDATE trigger `trg_grade_assessment_response`
      // will evaluate is_correct + points_earned server-side during upsert.
      const upsertPayloads = Object.entries(answers).map(([qId, val]) => ({
        attempt_id: attemptId,
        question_id: qId,
        user_answer: val,
        time_spent_seconds: 0,
      }));

      if (upsertPayloads.length > 0) {
        const { error: upsertErr } = await supabase
          .from('assessment_responses')
          .upsert(upsertPayloads, { onConflict: 'attempt_id,question_id' });
        if (upsertErr) console.warn('Answer persistence warning:', upsertErr);
      }

      // 2. Invoke calculate_assessment_score(attempt_id) — SECURITY DEFINER DB function
      // that sums server-graded points, calculates percentage_score, and updates status.
      const { data: scoreData, error: scoreErr } = await supabase.rpc(
        'calculate_assessment_score',
        { attempt_id_param: attemptId }
      );

      if (scoreErr) {
        console.error('Grading function error:', scoreErr);
        toast.error('Failed to calculate score. Please try submitting again.');
        setSubmitting(false);
        return;
      }

      toast.success('Assessment submitted successfully!');
      navigate(`/assessments/results/${attemptId}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-xl font-bold">{assessment?.title}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length} ({answeredCount} answered)
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
            timeRemaining < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-muted'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold text-sm">
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <Button 
            onClick={() => setShowSubmitDialog(true)}
            variant="default"
            size="sm"
          >
            Submit Assessment
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="mb-6 h-2" />

      {/* Question Card */}
      {currentQuestion && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1}
              </Badge>
              <Badge variant="secondary">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'Point' : 'Points'}
              </Badge>
            </div>
            <CardTitle className="text-lg font-normal leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {currentQuestion.question_type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {Array.isArray(currentQuestion.options) ? (
                  currentQuestion.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))
                ) : (
                  // Handle JSON object options
                  Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                        {String(value)}
                      </Label>
                    </div>
                  ))
                )}
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="true" id="option-true" />
                  <Label htmlFor="option-true" className="flex-1 cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="false" id="option-false" />
                  <Label htmlFor="option-false" className="flex-1 cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.question_type === 'text' && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={6}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {/* Question Palette Dropdown / Numbers */}
        <div className="flex space-x-1 overflow-x-auto max-w-md px-2 py-1">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 text-xs font-semibold rounded-full border flex items-center justify-center transition-colors ${
                idx === currentQuestionIndex 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : answers[q.id] 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-muted hover:bg-muted'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            variant="default"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowSubmitDialog(true)}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            Review & Submit
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 font-semibold">
                  ⚠️ You still have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
              Once submitted, your answers will be graded server-side and recorded to your attempt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction 
              onClick={submitAssessment}
              disabled={submitting}
              className="bg-primary"
            >
              {submitting ? 'Submitting & Grading...' : 'Confirm Submission'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}