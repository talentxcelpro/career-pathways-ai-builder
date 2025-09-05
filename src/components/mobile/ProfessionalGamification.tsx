import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Target, TrendingUp, Users, Calendar, Zap, Award, Star, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'networking' | 'skills' | 'career' | 'social' | 'learning';
  points: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  category: 'networking' | 'content' | 'skills' | 'engagement';
  target: number;
  current: number;
  points: number;
  expiresAt?: string;
  completed: boolean;
}

interface LeaderboardEntry {
  id: string;
  user: {
    name: string;
    avatar: string;
    title: string;
  };
  points: number;
  rank: number;
  change: number; // +/- change from last period
}

interface ProfessionalGamificationProps {
  className?: string;
}

export const ProfessionalGamification: React.FC<ProfessionalGamificationProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview');
  
  const [userStats] = useState({
    totalPoints: 2847,
    level: 8,
    levelProgress: 67,
    nextLevelPoints: 3000,
    rank: 24,
    connections: 156,
    endorsements: 89,
    postsShared: 34,
    eventsAttended: 12
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Super Connector',
      description: 'Connect with 100+ professionals',
      icon: <Users className="w-5 h-5" />,
      category: 'networking',
      points: 200,
      unlockedAt: '2024-01-10',
      rarity: 'rare'
    },
    {
      id: '2',
      title: 'Skill Master',
      description: 'Get endorsed for 5+ skills',
      icon: <Award className="w-5 h-5" />,
      category: 'skills',
      points: 150,
      unlockedAt: '2024-01-08',
      rarity: 'common'
    },
    {
      id: '3',
      title: 'Thought Leader',
      description: 'Get 50+ likes on a single post',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'social',
      points: 300,
      progress: 34,
      maxProgress: 50,
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Event Enthusiast',
      description: 'Attend 10 networking events',
      icon: <Calendar className="w-5 h-5" />,
      category: 'networking',
      points: 250,
      progress: 8,
      maxProgress: 10,
      rarity: 'rare'
    }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Connector',
      description: 'Send 3 connection requests today',
      type: 'daily',
      category: 'networking',
      target: 3,
      current: 1,
      points: 50,
      expiresAt: 'Today 11:59 PM',
      completed: false
    },
    {
      id: '2',
      title: 'Content Creator',
      description: 'Share 2 posts this week',
      type: 'weekly',
      category: 'content',
      target: 2,
      current: 1,
      points: 100,
      expiresAt: 'Sunday 11:59 PM',
      completed: false
    },
    {
      id: '3',
      title: 'Skill Showcase',
      description: 'Get 5 skill endorsements this month',
      type: 'monthly',
      category: 'skills',
      target: 5,
      current: 3,
      points: 200,
      expiresAt: 'Jan 31, 2024',
      completed: false
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', user: { name: 'Sarah Kim', avatar: '/api/placeholder/40/40', title: 'VP Product' }, points: 4521, rank: 1, change: 2 },
    { id: '2', user: { name: 'Alex Chen', avatar: '/api/placeholder/40/40', title: 'Senior Engineer' }, points: 4205, rank: 2, change: -1 },
    { id: '3', user: { name: 'Maria Garcia', avatar: '/api/placeholder/40/40', title: 'Product Manager' }, points: 3998, rank: 3, change: 1 },
    { id: '4', user: { name: 'John Doe', avatar: '/api/placeholder/40/40', title: 'Data Scientist' }, points: 3756, rank: 4, change: 0 },
    { id: '5', user: { name: 'You', avatar: '/api/placeholder/40/40', title: 'Professional' }, points: 2847, rank: 24, change: 3 }
  ]);

  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  const handleClaimReward = async (achievementId: string) => {
    triggerHaptic('success');
    await sync('gamification', { action: 'claim_achievement', achievementId });
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'networking': return <Users className="w-4 h-4" />;
      case 'skills': return <Award className="w-4 h-4" />;
      case 'career': return <Target className="w-4 h-4" />;
      case 'social': return <TrendingUp className="w-4 h-4" />;
      case 'learning': return <BarChart3 className="w-4 h-4" />;
      case 'content': return <Zap className="w-4 h-4" />;
      case 'engagement': return <Star className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      case 'milestone': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-4">
      {/* Level Progress */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">Level {userStats.level}</h3>
            <p className="text-sm text-muted-foreground">Professional Networker</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{userStats.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {userStats.level + 1}</span>
            <span className="text-foreground">{userStats.levelProgress}%</span>
          </div>
          <Progress value={userStats.levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {userStats.nextLevelPoints - userStats.totalPoints} points to next level
          </p>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{userStats.connections}</p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </Card>
        <Card className="p-3 text-center">
          <Award className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{userStats.endorsements}</p>
          <p className="text-xs text-muted-foreground">Endorsements</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{userStats.postsShared}</p>
          <p className="text-xs text-muted-foreground">Posts Shared</p>
        </Card>
        <Card className="p-3 text-center">
          <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{userStats.eventsAttended}</p>
          <p className="text-xs text-muted-foreground">Events Attended</p>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Recent Achievements
        </h3>
        <div className="space-y-2">
          {achievements.filter(a => a.unlockedAt).slice(0, 3).map(achievement => (
            <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-lg">
              <div className="text-primary">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              <Badge className={getRarityColor(achievement.rarity)}>
                +{achievement.points}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-3">
      {achievements.map(achievement => (
        <Card key={achievement.id} className="p-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${achievement.unlockedAt ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-foreground">{achievement.title}</h3>
                <Badge className={getRarityColor(achievement.rarity)}>
                  {achievement.rarity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
              
              {achievement.unlockedAt ? (
                <div className="flex items-center space-x-2 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Unlocked {achievement.unlockedAt}</span>
                  <Badge className="bg-green-100 text-green-800">+{achievement.points} pts</Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress value={(achievement.progress! / achievement.maxProgress!) * 100} className="h-1" />
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const ChallengesTab = () => (
    <div className="space-y-3">
      {challenges.map(challenge => (
        <Card key={challenge.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="text-primary">{getCategoryIcon(challenge.category)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground">{challenge.title}</h3>
                  <Badge className={getTypeColor(challenge.type)}>
                    {challenge.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
            </div>
            <Badge variant="outline">+{challenge.points} pts</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{challenge.current}/{challenge.target}</span>
            </div>
            <Progress value={(challenge.current / challenge.target) * 100} className="h-2" />
            {challenge.expiresAt && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Expires {challenge.expiresAt}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const LeaderboardTab = () => (
    <div className="space-y-3">
      {leaderboard.map(entry => (
        <Card key={entry.id} className={`p-4 ${entry.user.name === 'You' ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="text-center min-w-0">
              <div className="text-lg font-bold text-foreground">#{entry.rank}</div>
              <div className={`text-xs ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {entry.change > 0 ? '+' : ''}{entry.change}
              </div>
            </div>
            
            <Avatar className="w-12 h-12">
              <AvatarImage src={entry.user.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {entry.user.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{entry.user.name}</p>
              <p className="text-sm text-muted-foreground">{entry.user.title}</p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{entry.points}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Professional Growth</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Level up your career through meaningful connections and achievements
        </p>
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">Rank #{userStats.rank}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{userStats.totalPoints} Points</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-4">
        <div className="flex items-center space-x-1 p-4 overflow-x-auto scrollbar-hide">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="text-xs whitespace-nowrap"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('achievements')}
            className="text-xs whitespace-nowrap"
          >
            Achievements
          </Button>
          <Button
            variant={activeTab === 'challenges' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('challenges')}
            className="text-xs whitespace-nowrap"
          >
            Challenges
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            className="text-xs whitespace-nowrap"
          >
            Leaderboard
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'challenges' && <ChallengesTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </div>
    </div>
  );
};