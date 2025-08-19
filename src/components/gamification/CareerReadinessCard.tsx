import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { useUserScores } from '@/hooks/useUserScores';
import { cn } from '@/lib/utils';

interface CareerReadinessCardProps {
  userId?: string;
  className?: string;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({ 
  userId, 
  className 
}) => {
  const { data: scores, isLoading } = useUserScores(userId);

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-4 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const readinessScore = scores?.career_readiness_score || 0;
  const profileScore = scores?.profile_completion_score || 0;
  const totalPoints = scores?.total_points || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          Career Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <Badge 
              variant="outline" 
              className={cn("font-mono", getScoreColor(readinessScore))}
            >
              {getScoreIcon(readinessScore)}
              {readinessScore}%
            </Badge>
          </div>
          <Progress value={readinessScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Profile</div>
            <div className="flex items-center gap-1">
              <Progress value={profileScore} className="h-1 flex-1" />
              <span className="text-xs font-mono">{profileScore}%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Points</div>
            <div className="text-sm font-semibold text-primary">
              {totalPoints.toLocaleString()}
            </div>
          </div>
        </div>

        {readinessScore < 100 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Complete your profile and stay active to improve your score!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};