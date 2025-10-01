import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdvancedGamification } from '@/hooks/useAdvancedGamification';
import { Trophy, Medal, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LeaderboardWidgetProps {
  limit?: number;
  showUserRank?: boolean;
  className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  limit = 10,
  showUserRank = true,
  className
}) => {
  const { leaderboard, isLoading, getUserRank, getTotalPoints, userLevel } = useAdvancedGamification();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const displayedLeaderboard = leaderboard.slice(0, limit);
  const userRank = getUserRank();
  const userPoints = getTotalPoints();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top performers this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showUserRank && userRank > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="gap-1">
                  {getRankIcon(userRank)}
                  Your Rank
                </Badge>
                <p className="text-sm font-medium">
                  Level {userLevel} • {userPoints.toLocaleString()} pts
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {displayedLeaderboard.map((entry, index) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors',
                  entry.rank <= 3 && 'bg-muted/30'
                )}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profile_picture_url} />
                  <AvatarFallback>
                    {entry.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.full_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.total_points.toLocaleString()} pts</span>
                    <span>•</span>
                    <span>{entry.achievements_count} achievements</span>
                  </div>
                </div>

                {entry.streak_days > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="h-3 w-3" />
                    {entry.streak_days}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
