
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, Clock, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correct_answers: number[];
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
}

interface CourseAssessmentProps {
  assessment: any; // Use any to accept Supabase Json type
  courseId: string;
  isEnrolled: boolean;
  onComplete: (passed: boolean, score: number) => void;
}

export const CourseAssessment: React.FC<CourseAssessmentProps> = ({
  assessment: rawAssessment,
  courseId,
  isEnrolled,
  onComplete
}) => {
  // Transform the raw assessment to proper format
  const assessment: Assessment = {
    ...rawAssessment,
    questions: Array.isArray(rawAssessment.questions) 
      ? rawAssessment.questions as Question[]
      : []
  };

  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(assessment.time_limit_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: previousAttempts = [] } = useQuery({
    queryKey: ['user_assessment_attempts', assessment.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_assessment_attempts')
        .select('*')
        .eq('assessment_id', assessment.id)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isEnrolled
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (assessmentAnswers: Record<string, any>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;

      assessment.questions.forEach(question => {
        totalPoints += question.points;
        const userAnswer = assessmentAnswers[question.id];
        
        if (question.type === 'single') {
          if (question.correct_answers.includes(parseInt(userAnswer))) {
            earnedPoints += question.points;
          }
        } else {
          const userAnswers = userAnswer || [];
          const correctSet = new Set(question.correct_answers);
          const userSet = new Set(userAnswers.map((a: string) => parseInt(a)));
          
          if (correctSet.size === userSet.size && 
              [...correctSet].every(x => userSet.has(x))) {
            earnedPoints += question.points;
          }
        }
      });

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= assessment.passing_score;
      const attemptNumber = previousAttempts.length + 1;

      const { error } = await supabase
        .from('user_assessment_attempts')
        .insert({
          user_id: user.id,
          assessment_id: assessment.id,
          score,
          answers: assessmentAnswers,
          passed,
          attempt_number: attemptNumber,
          time_taken_minutes: Math.round((assessment.time_limit_minutes * 60 - timeLeft) / 60)
        });

      if (error) throw error;

      // Generate certificate if passed
      if (passed) {
        const certificateNumber = `TXL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const { error: certError } = await supabase
          .from('certificates')
          .insert({
            user_id: user.id,
            course_id: courseId,
            certificate_number: certificateNumber
          });

        if (certError) {
          console.error('Certificate generation error:', certError);
        }
      }

      return { score, passed };
    },
    onSuccess: ({ score, passed }) => {
      if (passed) {
        toast.success(`Congratulations! You passed with ${score}% and earned a certificate!`);
      } else {
        toast.error(`You scored ${score}%. You need ${assessment.passing_score}% to pass.`);
      }
      onComplete(passed, score);
      queryClient.invalidateQueries({ queryKey: ['user_assessment_attempts'] });
      setIsStarted(false);
    },
    onError: () => {
      toast.error('Failed to submit assessment');
    }
  });

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [isStarted, timeLeft]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitAssessmentMutation.mutateAsync(answers);
    setIsSubmitting(false);
  };

  const canTakeAssessment = isEnrolled && 
    (previousAttempts.length < assessment.max_attempts || 
     !previousAttempts.some(attempt => attempt.passed));

  const bestAttempt = previousAttempts.length > 0 ? 
    previousAttempts.reduce((best, current) => 
      current.score > best.score ? current : best
    ) : null;

  if (!isStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {assessment.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{assessment.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-semibold text-lg">{assessment.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{assessment.time_limit_minutes}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{assessment.passing_score}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{assessment.max_attempts}</div>
              <div className="text-sm text-gray-600">Max Attempts</div>
            </div>
          </div>

          {bestAttempt && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Previous Best Score</h4>
              <div className="flex items-center gap-2">
                <Badge variant={bestAttempt.passed ? "default" : "destructive"}>
                  {bestAttempt.score}%
                </Badge>
                {bestAttempt.passed && (
                  <Badge variant="secondary" className="text-green-700">
                    <Trophy className="h-3 w-3 mr-1" />
                    Passed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Attempts used: {previousAttempts.length} / {assessment.max_attempts}
              </p>
            </div>
          )}

          {canTakeAssessment ? (
            <Button 
              onClick={() => setIsStarted(true)}
              className="w-full"
              size="lg"
            >
              <Award className="h-4 w-4 mr-2" />
              Start Assessment
            </Button>
          ) : (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700">
                {!isEnrolled 
                  ? "Enroll in this course to take the assessment"
                  : "You have used all attempts or already passed this assessment"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (assessment.questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-orange-700">No questions available for this assessment.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQ = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1} of {assessment.questions.length}</CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium text-lg mb-4">{currentQ.question}</h3>
          
          {currentQ.type === 'single' ? (
            <RadioGroup
              value={answers[currentQ.id]?.toString()}
              onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={(answers[currentQ.id] || []).includes(index.toString())}
                    onCheckedChange={(checked) => {
                      const currentAnswers = answers[currentQ.id] || [];
                      if (checked) {
                        handleAnswerChange(currentQ.id, [...currentAnswers, index.toString()]);
                      } else {
                        handleAnswerChange(currentQ.id, currentAnswers.filter((a: string) => a !== index.toString()));
                      }
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === assessment.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
