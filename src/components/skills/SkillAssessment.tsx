import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, Trophy, Target, Brain, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface Assessment {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  difficulty_level: string;
  questions: any;
  passing_score: number;
  duration_minutes: number;
  skills_master: {
    name: string;
    category: string;
  };
}

interface SkillAssessmentProps {
  assessmentId?: string;
  onComplete?: (score: number, passed: boolean) => void;
}

export function SkillAssessment({ assessmentId, onComplete }: SkillAssessmentProps) {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available assessments or specific assessment
  const { data: assessments, isLoading } = useQuery({
    queryKey: ["skill-assessments", assessmentId],
    queryFn: async () => {
      let query = supabase
        .from("skill_assessments")
        .select(`
          *,
          skills_master (
            name,
            category
          )
        `)
        .eq("is_active", true);

      if (assessmentId) {
        query = query.eq("id", assessmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Assessment[];
    },
  });

  // Submit assessment results
  const submitAssessment = useMutation({
    mutationFn: async ({ assessmentId, score, passed, answers, timeTaken }: {
      assessmentId: string;
      score: number;
      passed: boolean;
      answers: { [key: string]: number };
      timeTaken: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_assessment_results")
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          score,
          passed,
          answers,
          time_taken_minutes: timeTaken,
        });

      if (error) throw error;

      // If passed, update user skills
      if (passed && currentAssessment) {
        const proficiencyLevel = Math.min(95, Math.max(60, score)); // Convert score to proficiency
        
        await supabase
          .from("user_skills")
          .upsert({
            user_id: user.id,
            skill_id: currentAssessment.skill_id,
            proficiency_level: proficiencyLevel,
            proficiency_type: 'test_verified',
          }, {
            onConflict: 'user_id,skill_id'
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills"] });
      toast.success("Assessment completed successfully!");
      onComplete?.(score, passed);
    },
    onError: (error) => {
      toast.error("Failed to submit assessment: " + error.message);
    },
  });

  // Timer effect
  useEffect(() => {
    if (isStarted && !isCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && isStarted && !isCompleted) {
      handleComplete();
    }
  }, [isStarted, timeRemaining, isCompleted]);

  const startAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setTimeRemaining(assessment.duration_minutes * 60);
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (!currentAssessment) return;

    let correctAnswers = 0;
    currentAssessment.questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / currentAssessment.questions.length) * 100);
    const hasPassed = finalScore >= currentAssessment.passing_score;
    
    setScore(finalScore);
    setPassed(hasPassed);
    setIsCompleted(true);

    const timeTaken = currentAssessment.duration_minutes - Math.floor(timeRemaining / 60);
    
    submitAssessment.mutate({
      assessmentId: currentAssessment.id,
      score: finalScore,
      passed: hasPassed,
      answers,
      timeTaken,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading assessments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Assessment selection screen
  if (!isStarted && assessments && assessments.length > 0) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Skill Assessments</h2>
          <p className="text-muted-foreground">Test your skills and get verified proficiency levels</p>
        </div>
        
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {assessment.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.skills_master.name} • {assessment.skills_master.category}
                    </p>
                  </div>
                  <Badge variant={
                    assessment.difficulty_level === 'beginner' ? 'secondary' :
                    assessment.difficulty_level === 'intermediate' ? 'default' :
                    assessment.difficulty_level === 'advanced' ? 'destructive' : 'outline'
                  }>
                    {assessment.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{assessment.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {assessment.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {assessment.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {assessment.passing_score}% to pass
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startAssessment(assessment)}
                  className="w-full"
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Assessment completion screen
  if (isCompleted && currentAssessment) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? "Congratulations!" : "Assessment Complete"}
          </CardTitle>
          <p className="text-muted-foreground">
            {passed 
              ? `You passed the ${currentAssessment.title} assessment!`
              : `You scored ${score}% on the ${currentAssessment.title} assessment.`
            }
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-3xl font-bold mb-2">{score}%</div>
            <Progress value={score} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Required: {currentAssessment.passing_score}%
            </p>
          </div>
          
          {passed && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                🎉 Your skill proficiency has been updated and verified!
              </p>
            </div>
          )}
          
          {!passed && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <p className="text-orange-800 text-sm">
                💪 Keep practicing! You can retake this assessment anytime.
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => {
              setIsCompleted(false);
              setIsStarted(false);
              setCurrentAssessment(null);
            }}
            className="w-full"
          >
            Back to Assessments
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Assessment in progress
  if (isStarted && currentAssessment && !isCompleted) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentAssessment.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-xs text-muted-foreground">Time remaining</p>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">{currentQuestion.question}</h3>
            
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined}
            >
              {currentQuestionIndex === currentAssessment.questions.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="text-center p-8">
        <p>No assessments available at the moment.</p>
      </CardContent>
    </Card>
  );
}