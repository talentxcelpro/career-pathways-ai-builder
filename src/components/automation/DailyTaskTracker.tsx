import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TouchButton } from '@/components/mobile/TouchButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
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
  const { triggerHaptic } = useHapticFeedback();
  const { sendTaskCompletionNotification } = useTaskNotifications();
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
  const { balance, refreshBalance } = useTokenBalance();
  
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Memoized task lists to prevent flickering
  const dailyTasks: DailyTask[] = useMemo(() => [
    {
      id: 'daily_login',
      title: 'Daily Login',
      description: 'Log in daily to build your streak',
      icon: <Calendar className="h-4 w-4" />,
      reward: 75,
      action: 'daily_login',
      completed: true, // Always completed if viewing this
      category: 'daily'
    },
    {
      id: 'job_apply',
      title: 'Apply to Jobs',
      description: 'Apply to at least one job per day',
      icon: <Briefcase className="h-4 w-4" />,
      reward: 90,
      action: 'job_applied',
      completed: false,
      category: 'daily'
    },
    {
      id: 'profile_update',
      title: 'Update Profile',
      description: 'Keep your profile information current',
      icon: <User className="h-4 w-4" />,
      reward: 300,
      action: 'profile_completed',
      completed: false,
      category: 'daily'
    },
    {
      id: 'community_engage',
      title: 'Community Engagement',
      description: 'Like, comment, or share community posts',
      icon: <MessageSquare className="h-4 w-4" />,
      reward: 150,
      action: 'post_created',
      completed: false,
      category: 'daily'
    }
  ], []);

  const growthTasks: DailyTask[] = useMemo(() => [
    {
      id: 'make_connection',
      title: 'Make Connections',
      description: 'Connect with professionals in your field',
      icon: <Users className="h-4 w-4" />,
      reward: 200,
      action: 'connection_made',
      completed: false,
      category: 'growth'
    },
    {
      id: 'add_skill',
      title: 'Add Skills',
      description: 'Complete courses and add skills to your profile',
      icon: <BookOpen className="h-4 w-4" />,
      reward: 250,
      action: 'skill_added',
      completed: false,
      category: 'growth'
    },
    {
      id: 'complete_course',
      title: 'Complete Courses',
      description: 'Finish learning modules and certifications',
      icon: <Award className="h-4 w-4" />,
      reward: 500,
      action: 'course_completed',
      completed: false,
      category: 'growth'
    },
    {
      id: 'give_recommendation',
      title: 'Give Recommendations',
      description: 'Write recommendations for your connections',
      icon: <Pen className="h-4 w-4" />,
      reward: 300,
      action: 'recommendation_given',
      completed: false,
      category: 'growth'
    },
    {
      id: 'post_article',
      title: 'Post Articles',
      description: 'Share insights and create valuable content',
      icon: <Target className="h-4 w-4" />,
      reward: 345,
      action: 'article_posted',
      completed: false,
      category: 'growth'
    }
  ], []);

  // Reset completed tasks daily
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('lastTaskReset');
      
      if (lastReset !== today) {
        setCompletedToday(new Set(['daily_login'])); // Keep daily login completed
        localStorage.setItem('lastTaskReset', today);
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleTaskCompletion = async (task: DailyTask) => {
    if (completedToday.has(task.id) || isLoading) return;
    
    setIsLoading(true);
    let success = false;
    
    try {
      triggerHaptic('medium');
      
      switch (task.action) {
        case 'job_applied':
          success = await triggerJobApplied();
          break;
        case 'profile_completed':
          success = await triggerProfileCompleted();
          break;
        case 'connection_made':
          success = await triggerConnectionMade();
          break;
        case 'post_created':
          success = await triggerPostCreated();
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
        default:
          success = true;
      }
      
      if (success) {
        setCompletedToday(prev => new Set([...prev, task.id]));
        triggerHaptic('success');
        // Refresh balance after task completion
        refreshBalance();
        // Send push notification for task completion
        await sendTaskCompletionNotification(task.title, task.reward);
      }
    } catch (error) {
      console.error('Task completion error:', error);
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized calculations to prevent flicker
  const dailyProgress = useMemo(() => (completedToday.size / dailyTasks.length) * 100, [completedToday.size, dailyTasks.length]);
  const totalPossibleRewards = useMemo(() => [...dailyTasks, ...growthTasks].reduce((sum, task) => sum + task.reward, 0), [dailyTasks, growthTasks]);
  const earnedToday = useMemo(() => 
    [...dailyTasks, ...growthTasks]
      .filter(task => completedToday.has(task.id))
      .reduce((sum, task) => sum + task.reward, 0), 
    [dailyTasks, growthTasks, completedToday]
  );

  const TaskCard = React.memo(({ task }: { task: DailyTask }) => {
    const isCompleted = completedToday.has(task.id) || (task.id === 'daily_login' && user);
    
    return (
      <Card className={`relative overflow-hidden transition-all duration-300 transform will-change-auto ${
        isCompleted ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/30 scale-[1.02]' : 'hover:scale-[1.01]'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                isCompleted 
                  ? 'bg-success/20 text-success' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <Check className="h-4 w-4" /> : task.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold truncate">{task.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{task.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={isCompleted ? "default" : "secondary"} className="text-xs">
                <Coins className="h-3 w-3 mr-1" />
                {formatTXC(task.reward)}
              </Badge>
            </div>
          </div>
          
          {!isCompleted && (
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => handleTaskCompletion(task)}
              disabled={isLoading}
              className="w-full text-xs h-8 border border-border hover:bg-muted"
            >
              {isLoading ? 'Completing...' : 'Complete Task'}
            </TouchButton>
          )}
          
          {isCompleted && (
            <div className="flex items-center justify-center text-success text-xs font-medium py-1">
              <Check className="h-3 w-3 mr-1" />
              Completed!
            </div>
          )}
        </CardContent>
      </Card>
    );
  });

  return (
    <div className="space-y-6 will-change-auto">
      {/* Progress Overview */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary" key={`earned-${earnedToday}`}>
                {formatTXC(earnedToday)}
              </div>
              <div className="text-xs text-muted-foreground">TXC Earned Today</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-secondary" key={`potential-${totalPossibleRewards}`}>
                {formatTXC(totalPossibleRewards)}
              </div>
              <div className="text-xs text-muted-foreground">TXC Potential</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Tasks</span>
              <span>{completedToday.size}/{dailyTasks.length}</span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Habits */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Daily Habits</h3>
          <Badge variant="outline" className="ml-auto">
            {formatTXC(dailyTasks.reduce((sum, task) => sum + task.reward, 0))} TXC potential
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dailyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Growth Activities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-secondary" />
          <h3 className="text-lg font-semibold">Growth Activities</h3>
          <Badge variant="outline" className="ml-auto">
            {formatTXC(growthTasks.reduce((sum, task) => sum + task.reward, 0))} TXC potential
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {growthTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};