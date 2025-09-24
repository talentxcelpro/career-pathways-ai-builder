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
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useUnifiedGamification } from '@/hooks/useUnifiedGamification';
import { useRealAchievements } from '@/hooks/useRealAchievements';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
  const { toast } = useToast();
  const { data: userBadges } = useUserBadges();
  const { availableBalance } = useTokenBalance();
  const txcIntegration = useTXCIntegration();
  const { 
    achievements: unifiedAchievements, 
    userAchievements, 
    triggerConnectionMade, 
    triggerJobApplied 
  } = useUnifiedGamification();
  const { 
    userAchievements: realUserAchievements, 
    allAchievementTypes, 
    summary 
  } = useRealAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);
  const [celebratingAchievement, setCelebratingAchievement] = useState<string | null>(null);

  // Combine real achievements with available achievement types
  const earnedAchievements: Achievement[] = realUserAchievements.map(ach => ({
    id: ach.id,
    name: ach.achievement_title,
    description: ach.achievement_description,
    icon: getIconForType(ach.achievement_type),
    rarity: getRarityByPoints(ach.points_awarded),
    category: getCategoryForType(ach.achievement_type),
    points: ach.points_awarded,
    progress: 1,
    maxProgress: 1,
    earned: true,
    earnedAt: ach.earned_at
  }));

  // Add available achievement types that haven't been earned
  const availableAchievements: Achievement[] = (allAchievementTypes || [])
    .filter(type => !realUserAchievements.some(earned => earned.achievement_type === type.type))
    .map(type => ({
      id: type.type,
      name: type.title,
      description: type.description || 'Complete activities to unlock this achievement',
      icon: getIconForType(type.type),
      rarity: getRarityByPoints(type.points),
      category: getCategoryForType(type.type),
      points: type.points,
      progress: 0,
      maxProgress: 1,
      earned: false,
      earnedAt: undefined
    }));

  // Combine earned and available achievements
  const achievements: Achievement[] = [...earnedAchievements, ...availableAchievements];

  // Helper functions
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      'star': Star,
      'flame': Flame,
      'users': Users,
      'briefcase': Briefcase,
      'zap': Zap,
      'crown': Crown,
      'trophy': Trophy,
      'target': Target
    };
    return iconMap[iconName] || Star;
  };

  const getIconForType = (type: string): React.ElementType => {
    if (type.includes('social') || type.includes('connection')) return Users;
    if (type.includes('career') || type.includes('job')) return Briefcase;
    if (type.includes('skill')) return Target;
    if (type.includes('streak')) return Flame;
    return Star;
  };

  const getRarityByPoints = (points: number): 'common' | 'rare' | 'epic' | 'legendary' => {
    if (points >= 1000) return 'legendary';
    if (points >= 500) return 'epic';
    if (points >= 200) return 'rare';
    return 'common';
  };

  const getCategoryForType = (type: string): string => {
    if (type.includes('social') || type.includes('connection')) return 'social';
    if (type.includes('career') || type.includes('job')) return 'career';
    if (type.includes('skill')) return 'career';
    return 'engagement';
  };

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

  // Auto-check achievements and award TXC
  useEffect(() => {
    achievements.forEach(async (achievement) => {
      if (!achievement.earned && achievement.progress && achievement.maxProgress && 
          achievement.progress >= achievement.maxProgress) {
        // Achievement completed! Award TXC
        setCelebratingAchievement(achievement.id);
        await txcIntegration.earnTXC('course_completed'); // Award bonus TXC
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: `${achievement.name} - You earned ${achievement.points} XP + bonus TXC!`,
        });
        setTimeout(() => setCelebratingAchievement(null), 3000);
      }
    });
  }, [achievements, txcIntegration, toast]);

  const earnedCount = realUserAchievements.length > 0 ? summary.totalEarned : achievements.filter(a => a.earned).length;
  const totalPoints = realUserAchievements.length > 0 ? summary.totalPoints : achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const completionRate = realUserAchievements.length > 0 ? summary.completionRate : (achievements.length > 0 ? Math.round((earnedCount / achievements.length) * 100) : 0);

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
                {completionRate}%
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
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                achievement.earned 
                  ? `${rarityConfig.bgClass} ${rarityConfig.glowClass}` 
                  : 'bg-gray-50 border-gray-200 opacity-75'
              } ${celebratingAchievement === achievement.id ? 'animate-pulse ring-4 ring-yellow-300' : ''}`}
              onClick={async () => {
                if (!achievement.earned && achievement.progress !== undefined && achievement.maxProgress) {
                  // Trigger actual achievement progress
                  if (achievement.category === 'social') {
                    await triggerConnectionMade();
                    await txcIntegration.triggerConnectionMade();
                    toast({
                      title: "Progress Made! 🚀",
                      description: `${achievement.name}: Working towards completion!`,
                    });
                  } else if (achievement.category === 'career') {
                    await triggerJobApplied();
                    await txcIntegration.triggerJobApplied();
                    toast({
                      title: "Progress Made! 💼",
                      description: `${achievement.name}: Working towards completion!`,
                    });
                  }
                }
              }}
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