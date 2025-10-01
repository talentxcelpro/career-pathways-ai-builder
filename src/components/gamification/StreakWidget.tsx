import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStreaks } from '@/hooks/useStreaks';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakWidgetProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  variant = 'default',
  className
}) => {
  const {
    streakData,
    isLoading,
    updateStreak,
    isStreakAtRisk,
    streakMessage,
    nextMilestone,
    milestoneProgress
  } = useStreaks();

  // Auto-update streak on mount
  useEffect(() => {
    updateStreak();
  }, []);

  if (isLoading || !streakData) {
    return null;
  }

  const getStreakColor = () => {
    if (isStreakAtRisk) return 'text-destructive';
    if (streakData.current_streak >= 30) return 'text-orange-500';
    if (streakData.current_streak >= 7) return 'text-yellow-500';
    return 'text-primary';
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Flame className={cn('h-4 w-4', getStreakColor())} />
        <span className="text-sm font-semibold">{streakData.current_streak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={streakData.current_streak > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Flame className={cn('h-8 w-8', getStreakColor())} />
              </motion.div>
              <div>
                <p className="text-2xl font-bold">{streakData.current_streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
            {nextMilestone && (
              <div className="text-right">
                <p className="text-sm font-medium">Next: {nextMilestone} days</p>
                <Progress value={milestoneProgress} className="h-1 w-20 mt-1" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className={cn('h-5 w-5', getStreakColor())} />
          Activity Streak
        </CardTitle>
        <CardDescription>{streakMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <motion.p
              className="text-3xl font-bold"
              animate={streakData.current_streak > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {streakData.current_streak}
            </motion.p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="text-center flex-1 border-l">
            <p className="text-3xl font-bold text-primary">
              {streakData.longest_streak}
            </p>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>
          <div className="text-center flex-1 border-l">
            <p className="text-3xl font-bold text-primary">
              {streakData.total_days_active}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextMilestone} days</span>
              <Badge variant="secondary">
                <Trophy className="h-3 w-3 mr-1" />
                {Math.round(milestoneProgress)}%
              </Badge>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
          </div>
        )}

        {isStreakAtRisk && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
          >
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {streakMessage}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
