import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  Check, 
  Calendar, 
  Briefcase, 
  User, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Award, 
  Pen,
  Coins,
  Target,
  TrendingUp
} from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';

interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: number;
  action: string;
  completed: boolean;
  category: 'daily' | 'growth';
}

export const DailyTaskTracker: React.FC = () => {
  const { user } = useAuth();
  const { 
    triggerJobApplied,
    triggerProfileCompleted,
    triggerConnectionMade,
    triggerPostCreated,
    triggerSkillAdded,
    triggerCourseCompleted,
    triggerRecommendationGiven,
    triggerArticlePosted
  } = useTXCIntegration();
  const { balance } = useTokenBalance();
  
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());

  const dailyTasks: DailyTask[] = [
    {
      id: 'daily_login',
      title: 'Daily Login',
      description: 'Log in daily to build your streak',
      icon: <Calendar className="h-5 w-5" />,
      reward: 75,
      action: 'daily_login',
      completed: true, // Always completed if viewing this
      category: 'daily'
    },
    {
      id: 'job_apply',
      title: 'Apply to Jobs',
      description: 'Apply to at least one job per day',
      icon: <Briefcase className="h-5 w-5" />,
      reward: 90,
      action: 'job_applied',
      completed: false,
      category: 'daily'
    },
    {
      id: 'profile_update',
      title: 'Update Profile',
      description: 'Keep your profile information current',
      icon: <User className="h-5 w-5" />,
      reward: 300,
      action: 'profile_completed',
      completed: false,
      category: 'daily'
    },
    {
      id: 'community_engage',
      title: 'Community Engagement',
      description: 'Like, comment, or share community posts',
      icon: <MessageSquare className="h-5 w-5" />,
      reward: 150,
      action: 'post_created',
      completed: false,
      category: 'daily'
    }
  ];

  const growthTasks: DailyTask[] = [
    {
      id: 'network_connect',
      title: 'Professional Networking',
      description: 'Connect with professionals in your field',
      icon: <Users className="h-5 w-5" />,
      reward: 75,
      action: 'connection_made',
      completed: false,
      category: 'growth'
    },
    {
      id: 'skills_course',
      title: 'Complete Courses',
      description: 'Complete courses and add new skills',
      icon: <BookOpen className="h-5 w-5" />,
      reward: 600,
      action: 'course_completed',
      completed: false,
      category: 'growth'
    },
    {
      id: 'give_recommendations',
      title: 'Give Recommendations',
      description: 'Write recommendations for your connections',
      icon: <Award className="h-5 w-5" />,
      reward: 120,
      action: 'recommendation_given',
      completed: false,
      category: 'growth'
    },
    {
      id: 'create_content',
      title: 'Create Content',
      description: 'Write articles or share insights',
      icon: <Pen className="h-5 w-5" />,
      reward: 500,
      action: 'article_posted',
      completed: false,
      category: 'growth'
    }
  ];

  const handleTaskAction = async (task: DailyTask) => {
    if (completedToday.has(task.id)) return;

    let success = false;
    
    switch (task.action) {
      case 'job_applied':
        success = await triggerJobApplied();
        break;
      case 'profile_completed':
        success = await triggerProfileCompleted();
        break;
      case 'post_created':
        success = await triggerPostCreated();
        break;
      case 'connection_made':
        success = await triggerConnectionMade();
        break;
      case 'skill_added':
        success = await triggerSkillAdded();
        break;
      case 'course_completed':
        success = await triggerCourseCompleted();
        break;
      case 'recommendation_given':
        success = await triggerRecommendationGiven();
        break;
      case 'article_posted':
        success = await triggerArticlePosted();
        break;
    }

    if (success) {
      setCompletedToday(prev => new Set([...prev, task.id]));
    }
  };

  const dailyProgress = (completedToday.size / dailyTasks.length) * 100;
  const totalPossibleRewards = [...dailyTasks, ...growthTasks].reduce((sum, task) => sum + task.reward, 0);
  const earnedToday = [...dailyTasks, ...growthTasks]
    .filter(task => completedToday.has(task.id))
    .reduce((sum, task) => sum + task.reward, 0);

  const TaskCard = ({ task }: { task: DailyTask }) => {
    const isCompleted = completedToday.has(task.id) || (task.id === 'daily_login' && user);
    
    return (
      <Card className={`group relative overflow-hidden transition-all duration-300 ${
        isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'hover-scale'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                isCompleted 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary'
              }`}>
                {isCompleted ? <Check className="h-5 w-5" /> : task.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">{task.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <Badge variant={task.category === 'daily' ? 'default' : 'secondary'} className="text-xs">
                  {task.category === 'daily' ? 'Daily Habit' : 'Growth Activity'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-bold text-secondary mb-2">
                <Coins className="h-4 w-4" />
                {formatTXC(task.reward)}
              </div>
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTaskAction(task)}
                  className="text-xs"
                >
                  Complete
                </Button>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                  Done!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Daily Progress
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{completedToday.size}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-1">{formatTXC(earnedToday)}</div>
              <div className="text-sm text-muted-foreground">TXC Earned Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">{Math.round(dailyProgress)}%</div>
              <div className="text-sm text-muted-foreground">Daily Goals</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Daily Progress</span>
              <span className="font-medium">{completedToday.size}/{dailyTasks.length} tasks</span>
            </div>
            <Progress value={dailyProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Habits */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Daily Habits</h3>
          <Badge variant="outline">{formatTXC(dailyTasks.reduce((sum, task) => sum + task.reward, 0))} potential</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Growth Activities */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Growth Activities</h3>
          <Badge variant="outline">{formatTXC(growthTasks.reduce((sum, task) => sum + task.reward, 0))} potential</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {growthTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};