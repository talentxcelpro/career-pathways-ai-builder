import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Trophy,
  Star,
  Flame,
  Target,
  Award,
  Crown,
  Zap,
  Gift,
  Sparkles,
  TrendingUp,
  Medal,
  Rocket
} from 'lucide-react';

interface SocialActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
    badge: string;
  };
  action: 'referral' | 'milestone' | 'contest_win' | 'streak' | 'achievement';
  description: string;
  timestamp: string;
  likes: number;
  comments: number;
  reward?: string;
}

interface UserAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
}

const mockActivities: SocialActivity[] = [
  {
    id: '1',
    user: { name: 'Sarah M.', avatar: '', level: 8, badge: '🏆' },
    action: 'contest_win',
    description: 'Won the Weekly Warrior Challenge with 15 referrals!',
    timestamp: '2 minutes ago',
    likes: 23,
    comments: 5,
    reward: '5,000 TXC + Pro Badge'
  },
  {
    id: '2',
    user: { name: 'Mike R.', avatar: '', level: 5, badge: '🔥' },
    action: 'streak',
    description: 'Achieved a 7-day referral streak! 🔥',
    timestamp: '15 minutes ago',
    likes: 12,
    comments: 3,
    reward: '2x TXC Multiplier'
  },
  {
    id: '3',
    user: { name: 'Lisa K.', avatar: '', level: 12, badge: '👑' },
    action: 'milestone',
    description: 'Reached 50 successful referrals milestone!',
    timestamp: '1 hour ago',
    likes: 45,
    comments: 12,
    reward: '2-Month Pro Access'
  }
];

const mockAchievements: UserAchievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first referral',
    icon: '🎯',
    rarity: 'common',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    reward: '500 TXC'
  },
  {
    id: '2',
    title: 'Social Butterfly',
    description: 'Share on 3 different platforms',
    icon: '🦋',
    rarity: 'rare',
    progress: 2,
    maxProgress: 3,
    unlocked: false,
    reward: '1,500 TXC'
  },
  {
    id: '3',
    title: 'Streak Master',
    description: 'Maintain a 14-day referral streak',
    icon: '⚡',
    rarity: 'epic',
    progress: 7,
    maxProgress: 14,
    unlocked: false,
    reward: '5,000 TXC + Special Badge'
  },
  {
    id: '4',
    title: 'Legend',
    description: 'Refer 100 successful users',
    icon: '👑',
    rarity: 'legendary',
    progress: 23,
    maxProgress: 100,
    unlocked: false,
    reward: '6-Month Pro + Exclusive Tools'
  }
];

export const SocialGameHub: React.FC = () => {
  const { referralData } = useReferralSystem();
  const [activities, setActivities] = useState<SocialActivity[]>(mockActivities);
  const [achievements, setAchievements] = useState<UserAchievement[]>(mockAchievements);
  const [userLevel, setUserLevel] = useState(3);
  const [userXP, setUserXP] = useState(1250);
  const [nextLevelXP, setNextLevelXP] = useState(2000);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'referral': return Users;
      case 'milestone': return Trophy;
      case 'contest_win': return Crown;
      case 'streak': return Flame;
      case 'achievement': return Award;
      default: return Star;
    }
  };

  const handleLike = (activityId: string) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, likes: activity.likes + 1 }
        : activity
    ));
  };

  const LevelProgress: React.FC = () => {
    const progress = (userXP / nextLevelXP) * 100;
    
    return (
      <Card className="gradient-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{userLevel}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Level {userLevel} Referrer</h3>
                <span className="text-sm text-muted-foreground">
                  {userXP}/{nextLevelXP} XP
                </span>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {nextLevelXP - userXP} XP to level {userLevel + 1}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Social Game Hub
          </h2>
        </div>
        <p className="text-muted-foreground">
          Connect with other referrers, unlock achievements, and level up! 🎮
        </p>
      </div>

      {/* Level Progress */}
      <LevelProgress />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              Community Activity
              <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.action);
              
              return (
                <div key={activity.id} className="p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-all">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{activity.user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          L{activity.user.level}
                        </Badge>
                        <span className="text-lg">{activity.user.badge}</span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <p className="text-sm">{activity.description}</p>
                      </div>
                      
                      {activity.reward && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <Gift className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            Reward: {activity.reward}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleLike(activity.id)}
                          className="flex items-center gap-1 hover:text-red-500"
                        >
                          <Heart className="h-4 w-4" />
                          {activity.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {activity.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => {
              const progress = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? `${getRarityColor(achievement.rarity)} shadow-lg` 
                      : 'border-gray-200 bg-gray-50/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge className="bg-green-500 text-white text-xs">
                            ✓ UNLOCKED
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            achievement.rarity === 'legendary' ? 'border-yellow-400 text-yellow-700' :
                            achievement.rarity === 'epic' ? 'border-purple-400 text-purple-700' :
                            achievement.rarity === 'rare' ? 'border-blue-400 text-blue-700' :
                            'border-gray-400 text-gray-700'
                          }`}
                        >
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <Gift className="h-3 w-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">
                          {achievement.reward}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="gradient-card border-primary/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">🚀 Level Up Faster!</h3>
            <p className="text-muted-foreground">
              Complete these actions to earn XP and unlock exclusive rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 hover:bg-blue-500/20"
              variant="outline"
            >
              <Share2 className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <div className="font-semibold">Share on Social</div>
                <div className="text-xs text-muted-foreground">+100 XP</div>
              </div>
            </Button>
            
            <Button 
              className="h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200 hover:bg-green-500/20"
              variant="outline"
            >
              <Users className="h-6 w-6 text-green-500" />
              <div className="text-center">
                <div className="font-semibold">Invite Friend</div>
                <div className="text-xs text-muted-foreground">+500 XP</div>
              </div>
            </Button>
            
            <Button 
              className="h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200 hover:bg-purple-500/20"
              variant="outline"
            >
              <Trophy className="h-6 w-6 text-purple-500" />
              <div className="text-center">
                <div className="font-semibold">Join Contest</div>
                <div className="text-xs text-muted-foreground">+250 XP</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};