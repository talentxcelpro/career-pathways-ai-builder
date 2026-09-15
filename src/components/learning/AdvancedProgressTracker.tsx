import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  Flame,
  Award,
  BookOpen,
  CheckCircle,
  BarChart3,
  Zap,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningStreak {
  current: number;
  longest: number;
  lastActivity: string;
}

interface WeeklyGoal {
  target: number;
  completed: number;
  week: string;
}

interface SkillProgress {
  skill: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
}

interface ProgressData {
  overallProgress: number;
  coursesCompleted: number;
  totalCourses: number;
  hoursLearned: number;
  streak: LearningStreak;
  weeklyGoal: WeeklyGoal;
  skills: SkillProgress[];
  achievements: string[];
  recentActivity: {
    course: string;
    lesson: string;
    timestamp: string;
    progress: number;
  }[];
}

interface AdvancedProgressTrackerProps {
  userId?: string;
  className?: string;
}

export const AdvancedProgressTracker: React.FC<AdvancedProgressTrackerProps> = ({ 
  userId, 
  className 
}) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [userId, selectedTimeframe]);

  const fetchProgressData = async () => {
    setLoading(true);
    
    // Simulate realistic progress data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: ProgressData = {
      overallProgress: 68,
      coursesCompleted: 12,
      totalCourses: 18,
      hoursLearned: 156,
      streak: {
        current: 14,
        longest: 32,
        lastActivity: new Date().toISOString()
      },
      weeklyGoal: {
        target: 10,
        completed: 7,
        week: 'Week of Dec 16'
      },
      skills: [
        { skill: 'React Development', level: 4, maxLevel: 5, xp: 850, xpToNext: 150 },
        { skill: 'TypeScript', level: 3, maxLevel: 5, xp: 620, xpToNext: 380 },
        { skill: 'Node.js', level: 2, maxLevel: 5, xp: 340, xpToNext: 660 },
        { skill: 'UI/UX Design', level: 3, maxLevel: 5, xp: 590, xpToNext: 410 }
      ],
      achievements: ['First Course', 'Week Streak', 'Skill Master', 'Fast Learner'],
      recentActivity: [
        { course: 'Advanced React Patterns', lesson: 'Custom Hooks', timestamp: '2 hours ago', progress: 85 },
        { course: 'TypeScript Masterclass', lesson: 'Generic Types', timestamp: '1 day ago', progress: 72 },
        { course: 'UI Design Principles', lesson: 'Color Theory', timestamp: '2 days ago', progress: 94 }
      ]
    };
    
    setProgressData(mockData);
    setLoading(false);
  };

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'text-orange-500';
    if (days >= 14) return 'text-yellow-500';
    if (days >= 7) return 'text-green-500';
    return 'text-blue-500';
  };

  const getSkillLevelColor = (level: number) => {
    const colors = ['bg-gray-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-orange-200', 'bg-red-200'];
    return colors[level] || 'bg-gray-200';
  };

  if (loading || !progressData) {
    return (
      <div className={cn("space-y-6 animate-fade-in", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-shimmer">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 animate-fade-in", className)}>
      {/* Header with Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Learning Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="capitalize"
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{progressData.overallProgress}%</p>
              </div>
            </div>
            <Progress value={progressData.overallProgress} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses Completed</p>
                <p className="text-2xl font-bold">{progressData.coursesCompleted}/{progressData.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{progressData.hoursLearned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className={cn("h-6 w-6", getStreakColor(progressData.streak.current))} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning Streak</p>
                <p className="text-2xl font-bold">{progressData.streak.current} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal and Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{progressData.weeklyGoal.week}</span>
                <Badge variant={progressData.weeklyGoal.completed >= progressData.weeklyGoal.target ? 'default' : 'secondary'}>
                  {progressData.weeklyGoal.completed}/{progressData.weeklyGoal.target} hours
                </Badge>
              </div>
              <Progress 
                value={(progressData.weeklyGoal.completed / progressData.weeklyGoal.target) * 100} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                {progressData.weeklyGoal.target - progressData.weeklyGoal.completed > 0 
                  ? `${progressData.weeklyGoal.target - progressData.weeklyGoal.completed} hours to reach your goal`
                  : 'Goal achieved! 🎉'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className={cn("h-5 w-5", getStreakColor(progressData.streak.current))} />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold">{progressData.streak.current}</p>
                  <p className="text-sm text-muted-foreground">Current streak</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-muted-foreground">{progressData.streak.longest}</p>
                  <p className="text-sm text-muted-foreground">Longest streak</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last activity: {new Date(progressData.streak.lastActivity).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Skill Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {progressData.skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.skill}</span>
                  <Badge variant="outline">Level {skill.level}</Badge>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: skill.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 rounded-full flex-1",
                        i < skill.level ? getSkillLevelColor(skill.level) : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{skill.xp} XP</span>
                  <span>{skill.xpToNext} XP to next level</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.lesson}</p>
                    <p className="text-sm text-muted-foreground">{activity.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Progress value={activity.progress} className="w-20 h-2" />
                    <span className="text-sm font-medium">{activity.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {progressData.achievements.map((achievement, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {achievement}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};