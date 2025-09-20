import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Flame, 
  Users, 
  Crown, 
  Zap,
  Calendar,
  Briefcase,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { useUserBadges } from '@/hooks/useUserScores';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  progress?: number;
  maxProgress?: number;
  earned: boolean;
  earnedAt?: string;
}

const ACHIEVEMENT_CATEGORIES = [
  { key: 'all', label: 'All', icon: Award },
  { key: 'career', label: 'Career', icon: Briefcase },
  { key: 'social', label: 'Social', icon: Users },
  { key: 'engagement', label: 'Engagement', icon: Star },
  { key: 'special', label: 'Special', icon: Crown }
];

export const AchievementsSection: React.FC = () => {
  const { user } = useAuth();
  const { data: userBadges } = useUserBadges();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  // Mock achievements data with entertainment styling
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your profile setup',
      icon: Star,
      rarity: 'common',
      category: 'career',
      points: 100,
      progress: 100,
      maxProgress: 100,
      earned: true,
      earnedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Streak Master',
      description: 'Maintain a 7-day login streak',
      icon: Flame,
      rarity: 'rare',
      category: 'engagement',
      points: 500,
      progress: 7,
      maxProgress: 7,
      earned: true,
      earnedAt: '2024-01-22'
    },
    {
      id: '3',
      name: 'Social Butterfly',
      description: 'Connect with 10 professionals',
      icon: Users,
      rarity: 'rare',
      category: 'social',
      points: 750,
      progress: 8,
      maxProgress: 10,
      earned: false
    },
    {
      id: '4',
      name: 'Job Hunter',
      description: 'Apply to 5 job positions',
      icon: Briefcase,
      rarity: 'epic',
      category: 'career',
      points: 1000,
      progress: 3,
      maxProgress: 5,
      earned: false
    },
    {
      id: '5',
      name: 'TXC Millionaire',
      description: 'Earn 10,000 TXC tokens',
      icon: Zap,
      rarity: 'legendary',
      category: 'special',
      points: 5000,
      progress: 3500,
      maxProgress: 10000,
      earned: false
    },
    {
      id: '6',
      name: 'Legendary',
      description: 'Reach top 10 on leaderboard',
      icon: Crown,
      rarity: 'legendary',
      category: 'special',
      points: 10000,
      progress: 42,
      maxProgress: 10,
      earned: false
    }
  ];

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return {
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-600',
          badgeClass: 'bg-gray-100 text-gray-800',
          glowClass: ''
        };
      case 'rare':
        return {
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-600',
          badgeClass: 'bg-blue-100 text-blue-800',
          glowClass: 'shadow-blue-200/50'
        };
      case 'epic':
        return {
          bgClass: 'bg-purple-50 border-purple-200',
          textClass: 'text-purple-600',
          badgeClass: 'bg-purple-100 text-purple-800',
          glowClass: 'shadow-purple-200/50'
        };
      case 'legendary':
        return {
          bgClass: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-yellow-300',
          textClass: 'text-yellow-600',
          badgeClass: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
          glowClass: 'shadow-yellow-300/50 shadow-lg'
        };
      default:
        return {
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-600',
          badgeClass: 'bg-gray-100 text-gray-800',
          glowClass: ''
        };
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (showEarnedOnly && !achievement.earned) return false;
    return true;
  });

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Achievement Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{earnedCount}</div>
              <div className="text-sm text-gray-600">Achievements Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Math.round((earnedCount / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {ACHIEVEMENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </Button>
          );
        })}
        
        <Button
          variant={showEarnedOnly ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowEarnedOnly(!showEarnedOnly)}
          className="ml-auto"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Earned Only
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const rarityConfig = getRarityConfig(achievement.rarity);
          const progressPercentage = achievement.maxProgress 
            ? (achievement.progress || 0) / achievement.maxProgress * 100 
            : 0;

          return (
            <Card 
              key={achievement.id}
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                achievement.earned 
                  ? `${rarityConfig.bgClass} ${rarityConfig.glowClass}` 
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}
            >
              {achievement.rarity === 'legendary' && achievement.earned && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
                  <div className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-bounce" />
                  </div>
                </>
              )}
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-xl ${
                    achievement.earned 
                      ? `bg-white shadow-sm ${rarityConfig.textClass}` 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {achievement.earned ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.name}
                      </h3>
                      <Badge className={`ml-2 ${rarityConfig.badgeClass} border-0 capitalize`}>
                        {achievement.rarity}
                      </Badge>
                    </div>

                    <p className={`text-sm mb-3 ${
                      achievement.earned ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>

                    {/* Progress */}
                    {!achievement.earned && achievement.maxProgress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {achievement.progress} / {achievement.maxProgress}
                          </span>
                          <span className="text-gray-500">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        {achievement.points.toLocaleString()} XP
                      </Badge>
                      
                      {achievement.earned && achievement.earnedAt && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-500">
              {showEarnedOnly 
                ? "You haven't earned any achievements in this category yet." 
                : "No achievements match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};