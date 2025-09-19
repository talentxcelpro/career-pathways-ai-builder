import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  streakType?: 'login' | 'application' | 'general';
  className?: string;
  compact?: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  streakType = 'general',
  className,
  compact = false
}) => {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'legendary', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    if (streak >= 14) return { level: 'epic', color: 'text-purple-500', bg: 'bg-purple-500/10' };
    if (streak >= 7) return { level: 'good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (streak >= 3) return { level: 'building', color: 'text-green-500', bg: 'bg-green-500/10' };
    return { level: 'starting', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const isPersonalBest = currentStreak === longestStreak && currentStreak > 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("p-1.5 rounded-full", streakInfo.bg)}>
          <Flame className={cn("h-3 w-3", streakInfo.color)} />
        </div>
        <span className="text-sm font-medium">{currentStreak} day streak</span>
        {isPersonalBest && (
          <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600">
            Personal Best!
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", streakInfo.bg)}>
              <Flame className={cn("h-4 w-4", streakInfo.color)} />
            </div>
            <span className="font-semibold capitalize">{streakType} Streak</span>
          </div>
          {isPersonalBest && (
            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Trophy className="h-3 w-3 mr-1" />
              Personal Best
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Current Streak */}
          <div className="text-center">
            <motion.p 
              className={cn("text-3xl font-bold", streakInfo.color)}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              key={currentStreak} // Re-animate when streak changes
            >
              {currentStreak}
            </motion.p>
            <p className="text-sm text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </div>

          {/* Streak Milestones */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={cn(
              "p-2 rounded",
              currentStreak >= 7 ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3 mx-auto mb-1" />
              <p>7 days</p>
            </div>
            <div className={cn(
              "p-2 rounded",
              currentStreak >= 14 ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"
            )}>
              <Flame className="h-3 w-3 mx-auto mb-1" />
              <p>14 days</p>
            </div>
            <div className={cn(
              "p-2 rounded",
              currentStreak >= 30 ? "bg-orange-500/10 text-orange-600" : "bg-muted text-muted-foreground"
            )}>
              <Trophy className="h-3 w-3 mx-auto mb-1" />
              <p>30 days</p>
            </div>
          </div>

          {/* Best Streak */}
          {longestStreak > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Best streak:</span>
              <span className="text-sm font-medium">{longestStreak} days</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};