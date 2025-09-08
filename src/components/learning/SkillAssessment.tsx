import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Trophy, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  skill_name: string;
  difficulty_level: string;
  questions: Question[];
  duration_minutes: number;
  passing_score: number;
}

interface AssessmentAttempt {
  id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

interface SkillAssessmentProps {
  assessment: Assessment;
  attempts?: AssessmentAttempt[];
  onComplete: (score: number, passed: boolean) => void;
}

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  assessment,
  attempts = [],
  onComplete
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(assessment.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bestAttempt = attempts.length > 0 
    ? attempts.reduce((best, current) => current.score > best.score ? current : best)
    : null;

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(assessment.duration_minutes * 60);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    assessment.questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / assessment.questions.length) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit assessment");
        return;
      }

      const score = calculateScore();
      const passed = score >= assessment.passing_score;

      const { error } = await supabase
        .from('assessment_attempts')
        .insert({
          user_id: user.id,
          assessment_id: assessment.id,
          answers: answers,
          score: score,
          passed: passed
        });

      if (error) {
        console.error('Submission error:', error);
        toast.error("Failed to submit assessment");
        return;
      }

      toast.success(passed ? "Assessment passed!" : "Assessment completed");
      onComplete(score, passed);
      setIsStarted(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  if (!isStarted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary">{assessment.skill_name}</Badge>
            <Badge className={getDifficultyColor(assessment.difficulty_level)}>
              {assessment.difficulty_level}
            </Badge>
          </div>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {assessment.title}
          </CardTitle>
          <CardDescription>{assessment.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {assessment.duration_minutes} minutes
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              {assessment.passing_score}% to pass
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {assessment.questions.length} questions
          </div>

          {bestAttempt && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Best Score:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{bestAttempt.score}%</span>
                  {bestAttempt.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Completed {new Date(bestAttempt.completed_at).toLocaleDateString()}
              </div>
            </div>
          )}

          <Button onClick={handleStart} className="w-full">
            {attempts.length > 0 ? "Retake Assessment" : "Start Assessment"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = assessment.questions[currentQuestion];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{assessment.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeLeft)}
            </div>
            <div>
              Question {currentQuestion + 1} of {assessment.questions.length}
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          
          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            {currentQ.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer p-2 rounded hover:bg-muted/50"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {answeredQuestions} of {assessment.questions.length} answered
          </div>

          {currentQuestion === assessment.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredQuestions < assessment.questions.length}
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};