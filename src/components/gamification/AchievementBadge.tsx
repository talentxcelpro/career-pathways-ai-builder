import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Crown, Medal, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  requirement: number;
  current: number;
  reward: number;
  category: 'daily' | 'growth' | 'milestone' | 'special';
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = true,
  onClick,
  className
}) => {
  const getRarityConfig = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          text: 'text-slate-600',
          accent: 'bg-slate-500'
        };
      case 'rare':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-600',
          accent: 'bg-blue-500'
        };
      case 'epic':
        return {
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          text: 'text-purple-600',
          accent: 'bg-purple-500'
        };
      case 'legendary':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          text: 'text-orange-600',
          accent: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-muted',
          border: 'border-muted',
          text: 'text-muted-foreground',
          accent: 'bg-muted-foreground'
        };
    }
  };

  const getSizeConfig = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-4 w-4',
          title: 'text-sm font-medium',
          description: 'text-xs',
          progress: 'h-1'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'h-8 w-8',
          title: 'text-lg font-semibold',
          description: 'text-sm',
          progress: 'h-3'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-6 w-6',
          title: 'text-base font-semibold',
          description: 'text-sm',
          progress: 'h-2'
        };
    }
  };

  const getDefaultIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'daily': return <Star className="h-full w-full" />;
      case 'growth': return <Trophy className="h-full w-full" />;
      case 'milestone': return <Medal className="h-full w-full" />;
      case 'special': return <Crown className="h-full w-full" />;
      default: return <Award className="h-full w-full" />;
    }
  };

  const rarityConfig = getRarityConfig(achievement.rarity);
  const sizeConfig = getSizeConfig(size);
  const progress = (achievement.current / achievement.requirement) * 100;
  const isComplete = achievement.unlocked;

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      className={className}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isComplete ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20" : rarityConfig.bg,
          isComplete ? "border-green-500/20" : rarityConfig.border,
          onClick && "cursor-pointer hover:shadow-lg",
          className
        )}
        onClick={onClick}
      >
        {/* Rarity Indicator */}
        <div className={cn(
          "absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rotate-45",
          isComplete ? "bg-green-500" : rarityConfig.accent
        )} />
        
        <CardContent className={sizeConfig.container}>
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "rounded-full p-2 flex-shrink-0",
              isComplete ? "bg-green-500/10" : rarityConfig.bg
            )}>
              <div className={cn(
                sizeConfig.icon,
                isComplete ? "text-green-600" : rarityConfig.text
              )}>
                {achievement.icon || getDefaultIcon(achievement.category)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={cn(
                  sizeConfig.title,
                  isComplete ? "text-green-600" : "text-foreground"
                )}>
                  {achievement.title}
                </h3>
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs capitalize",
                      isComplete ? "bg-green-500 text-white border-green-500" : `${rarityConfig.accent} text-white border-none`
                    )}
                  >
                    {achievement.rarity}
                  </Badge>
                  {isComplete && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                      ✓ Unlocked
                    </Badge>
                  )}
                </div>
              </div>

              <p className={cn(sizeConfig.description, "text-muted-foreground mb-3")}>
                {achievement.description}
              </p>

              {/* Progress */}
              {showProgress && !isComplete && (
                <div className="space-y-2">
                  <Progress 
                    value={progress} 
                    className={cn("w-full", sizeConfig.progress)}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {achievement.current}/{achievement.requirement}
                    </span>
                    <span className={cn("font-medium flex items-center gap-1", rarityConfig.text)}>
                      <Zap className="h-3 w-3" />
                      {achievement.reward} TXC
                    </span>
                  </div>
                </div>
              )}

              {/* Completion Info */}
              {isComplete && achievement.unlockedAt && (
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>Unlocked {achievement.unlockedAt.toLocaleDateString()}</span>
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {achievement.reward} TXC
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};