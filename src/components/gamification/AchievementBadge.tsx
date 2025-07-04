import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  Flame, 
  Target, 
  Users,
  Zap,
  BookOpen,
  Briefcase,
  TrendingUp
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_type: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  points_awarded: number;
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  interactive?: boolean;
}

const ACHIEVEMENT_ICONS = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  crown: Crown,
  star: Star,
  flame: Flame,
  target: Target,
  users: Users,
  zap: Zap,
  book: BookOpen,
  briefcase: Briefcase,
  trending: TrendingUp
};

const RARITY_COLORS = {
  common: 'bg-gray-500 text-white',
  rare: 'bg-blue-500 text-white',
  epic: 'bg-purple-500 text-white',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
};

const RARITY_GLOW = {
  common: '',
  rare: 'shadow-blue-200 shadow-lg',
  epic: 'shadow-purple-200 shadow-lg',
  legendary: 'shadow-yellow-200 shadow-xl animate-pulse'
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = false,
  interactive = false
}) => {
  const Icon = ACHIEVEMENT_ICONS[achievement.icon_type as keyof typeof ACHIEVEMENT_ICONS] || Award;
  const isEarned = !!achievement.earned_at;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.max_progress || 100;
  const progressPercentage = (progress / maxProgress) * 100;

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <div className={`
      relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300
      ${interactive ? 'hover:scale-105 cursor-pointer' : ''}
      ${isEarned ? RARITY_GLOW[achievement.rarity] : ''}
    `}>
      {/* Badge Container */}
      <div className={`
        ${sizeClasses[size]} 
        relative flex items-center justify-center rounded-full border-2 transition-all duration-300
        ${isEarned 
          ? `${RARITY_COLORS[achievement.rarity]} border-transparent` 
          : 'bg-gray-100 border-gray-300 text-gray-400'
        }
      `}>
        <Icon className={iconSizes[size]} />
        
        {/* Legendary Sparkle Effect */}
        {isEarned && achievement.rarity === 'legendary' && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-300 rounded-full animate-ping animation-delay-200"></div>
          </>
        )}

        {/* New Achievement Indicator */}
        {isEarned && new Date(achievement.earned_at!).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Achievement Info */}
      <div className="text-center space-y-1">
        <h4 className={`font-medium ${sizeClasses[size].includes('text-xs') ? 'text-xs' : 'text-sm'}`}>
          {achievement.title}
        </h4>
        
        {/* Rarity Badge */}
        <Badge 
          variant="outline" 
          className={`text-xs capitalize ${
            isEarned ? RARITY_COLORS[achievement.rarity] : 'bg-gray-100 text-gray-500'
          }`}
        >
          {achievement.rarity}
        </Badge>

        {/* Progress Bar */}
        {showProgress && !isEarned && achievement.max_progress && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{progress}</span>
              <span>{maxProgress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Points */}
        {achievement.points_awarded > 0 && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
            <Star className="h-3 w-3" />
            <span>{achievement.points_awarded} pts</span>
          </div>
        )}

        {/* Earned Date */}
        {isEarned && achievement.earned_at && (
          <p className="text-xs text-gray-500">
            Earned {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;