import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Award,
  Target,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SkillAssessmentProps {
  skill: string;
  onComplete: (score: number) => void;
}

export const SkillAssessment: React.FC<SkillAssessmentProps> = ({ skill, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Mock questions - in reality, these would come from an API
  const questions: Question[] = [
    {
      id: '1',
      question: `What is a key principle of ${skill}?`,
      options: [
        'Option A - Basic concept',
        'Option B - Advanced technique',
        'Option C - Core principle',
        'Option D - Secondary feature'
      ],
      correct: 2,
      difficulty: 'medium'
    },
    {
      id: '2',
      question: `Which best practice is recommended for ${skill}?`,
      options: [
        'Always use default settings',
        'Follow industry standards',
        'Ignore documentation',
        'Use experimental features only'
      ],
      correct: 1,
      difficulty: 'easy'
    },
    {
      id: '3',
      question: `What is an advanced technique in ${skill}?`,
      options: [
        'Basic implementation',
        'Performance optimization',
        'Simple configuration',
        'Standard workflow'
      ],
      correct: 1,
      difficulty: 'hard'
    }
  ];

  React.useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isCompleted]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setIsCompleted(true);
    onComplete(finalScore);

    if (finalScore >= 80) {
      toast.success(`Excellent! You scored ${finalScore}% on ${skill} assessment`);
    } else if (finalScore >= 60) {
      toast.success(`Good job! You scored ${finalScore}% on ${skill} assessment`);
    } else {
      toast.error(`You scored ${finalScore}%. Consider more practice with ${skill}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {score >= 80 ? (
              <Award className="h-16 w-16 text-yellow-500" />
            ) : score >= 60 ? (
              <Star className="h-16 w-16 text-blue-500" />
            ) : (
              <Target className="h-16 w-16 text-gray-500" />
            )}
          </div>
          <CardTitle>Assessment Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{score}%</div>
            <p className="text-muted-foreground">
              {score >= 80 ? 'Expert Level' : score >= 60 ? 'Proficient' : 'Beginner'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-600">
                {answers.filter((answer, index) => answer === questions[index].correct).length}
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-red-600">
                {questions.length - answers.filter((answer, index) => answer === questions[index].correct).length}
              </div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                {questions.length}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>

          {score >= 70 && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-green-800">Skill Verified!</p>
              <p className="text-sm text-green-600">You've earned a verification badge for {skill}</p>
            </div>
          )}

          <Button onClick={() => window.location.reload()} className="w-full">
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {skill} Assessment
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <Badge className={getDifficultyColor(currentQ.difficulty)}>
              {currentQ.difficulty}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  answers[currentQuestion] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`} />
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};