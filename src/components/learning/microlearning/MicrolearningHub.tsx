import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Zap, 
  Brain, 
  Target,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Trophy,
  Timer,
  BookOpen,
  HelpCircle
} from 'lucide-react';

interface MicrolearningHubProps {
  quickLessons: Array<{
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    completed: boolean;
    xpReward: number;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    questions: number;
    timeLimit: number; // in minutes
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    highScore?: number;
    attempts: number;
  }>;
  flashcards: Array<{
    id: string;
    topic: string;
    cardCount: number;
    category: string;
    reviewSchedule: 'due' | 'upcoming' | 'completed';
    nextReview?: Date;
  }>;
}

export const MicrolearningHub: React.FC<MicrolearningHubProps> = ({ 
  quickLessons, 
  quizzes, 
  flashcards 
}) => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [quizInProgress, setQuizInProgress] = useState<string | null>(null);
  const [studyTimer, setStudyTimer] = useState({ minutes: 25, isActive: false });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewScheduleColor = (schedule: string) => {
    switch (schedule) {
      case 'due': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedLessons = quickLessons.filter(lesson => lesson.completed).length;
  const completionRate = Math.round((completedLessons / quickLessons.length) * 100);

  return (
    <div className="space-y-6">
      {/* Study Timer */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Focus Timer</h3>
                <p className="text-sm text-muted-foreground">
                  {studyTimer.isActive ? 'Study session in progress' : 'Start a focused study session'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">
                {studyTimer.minutes}:00
              </div>
              <Button
                onClick={() => setStudyTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                size="sm"
              >
                {studyTimer.isActive ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{completedLessons}</div>
                <div className="text-sm text-muted-foreground">Quick Lessons</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{quizzes.length}</div>
                <div className="text-sm text-muted-foreground">Quick Quizzes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {flashcards.filter(f => f.reviewSchedule === 'due').length}
                </div>
                <div className="text-sm text-muted-foreground">Due for Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">Quick Lessons</TabsTrigger>
          <TabsTrigger value="quizzes">Revision Quizzes</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Bite-sized Lessons
                </CardTitle>
                <Badge>{completionRate}% Complete</Badge>
              </div>
              <Progress value={completionRate} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {quickLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                      selectedLesson === lesson.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedLesson(lesson.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{lesson.title}</h3>
                          {lesson.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {lesson.category}
                          </Badge>
                          <Badge className={getDifficultyColor(lesson.difficulty)}>
                            {lesson.difficulty}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}m
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-primary/10 text-primary">
                          +{lesson.xpReward} XP
                        </Badge>
                        <Button size="sm" variant={lesson.completed ? "outline" : "default"}>
                          {lesson.completed ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Quick Revision Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{quiz.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            {quiz.questions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {quiz.timeLimit}m limit
                          </span>
                          <span>Attempts: {quiz.attempts}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{quiz.category}</Badge>
                          <Badge className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                          {quiz.highScore && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Best: {quiz.highScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setQuizInProgress(quiz.id)}
                      >
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Spaced Repetition Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {flashcards.map((deck) => (
                  <div key={deck.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{deck.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{deck.cardCount} cards</span>
                          {deck.nextReview && (
                            <span>Next: {deck.nextReview.toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{deck.category}</Badge>
                          <Badge className={getReviewScheduleColor(deck.reviewSchedule)}>
                            {deck.reviewSchedule}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={deck.reviewSchedule === 'due' ? 'default' : 'outline'}
                      >
                        {deck.reviewSchedule === 'due' ? 'Review Now' : 'Study'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};