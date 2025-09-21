import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Star, 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Medal,
  Award,
  Flame,
  Calendar,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserLevel {
  current: number;
  title: string;
  xp: number;
  xpToNext: number;
  totalXpForNext: number;
  perks: string[];
}

interface Streak {
  type: string;
  count: number;
  maxCount: number;
  lastActivity: Date;
  reward: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'limited';
  progress: number;
  target: number;
  reward: {
    xp: number;
    points: number;
    badge?: string;
  };
  expiresAt?: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

interface Leaderboard {
  rank: number;
  name: string;
  points: number;
  level: number;
  change: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const userLevel: UserLevel = {
  current: 12,
  title: 'Senior Professional',
  xp: 8750,
  xpToNext: 1250,
  totalXpForNext: 10000,
  perks: [
    'Priority support',
    'Advanced analytics',
    'Premium templates',
    'Expert insights'
  ]
};

const streaks: Streak[] = [
  {
    type: 'Daily Login',
    count: 15,
    maxCount: 28,
    lastActivity: new Date(),
    reward: 50
  },
  {
    type: 'Skill Practice',
    count: 7,
    maxCount: 14,
    lastActivity: new Date(),
    reward: 100
  },
  {
    type: 'Networking',
    count: 3,
    maxCount: 7,
    lastActivity: new Date(Date.now() - 86400000),
    reward: 75
  }
];

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Complete 5 Assessments',
    description: 'Take skill assessments to boost your profile',
    type: 'daily',
    progress: 3,
    target: 5,
    reward: { xp: 200, points: 100 },
    difficulty: 'easy'
  },
  {
    id: '2',
    title: 'Network Builder',
    description: 'Connect with 10 new professionals this week',
    type: 'weekly',
    progress: 6,
    target: 10,
    reward: { xp: 500, points: 250, badge: 'Super Connector' },
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    difficulty: 'medium'
  },
  {
    id: '3',
    title: 'Master Class',
    description: 'Earn certification in advanced data analysis',
    type: 'limited',
    progress: 2,
    target: 5,
    reward: { xp: 1000, points: 500, badge: 'Data Master' },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    difficulty: 'hard'
  }
];

const leaderboard: Leaderboard[] = [
  { rank: 1, name: 'Alex Chen', points: 15420, level: 18, change: 'same' },
  { rank: 2, name: 'Sarah Johnson', points: 14890, level: 17, change: 'up' },
  { rank: 3, name: 'Mike Rodriguez', points: 14200, level: 16, change: 'down' },
  { rank: 4, name: 'You', points: 12750, level: 12, change: 'up', isCurrentUser: true },
  { rank: 5, name: 'Emily Davis', points: 12100, level: 15, change: 'same' }
];

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
    extreme: 'bg-purple-100 text-purple-700 border-purple-200'
  };
  return colors[difficulty as keyof typeof colors] || colors.easy;
};

const getChangeIcon = (change: string) => {
  switch (change) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    default:
      return <div className="w-4 h-4" />;
  }
};

export const GamificationElements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'level' | 'streaks' | 'challenges' | 'leaderboard'>('level');
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Simulate level up animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.8) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const levelProgress = (userLevel.xp / userLevel.totalXpForNext) * 100;

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-r from-amber-400 to-amber-600 p-8 rounded-lg text-center text-white"
            >
              <Crown className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You've reached Level {userLevel.current}!</p>
              <p className="mt-2">New perks unlocked!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === 'level' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('level')}
        >
          <Crown className="h-4 w-4 mr-1" />
          Level & XP
        </Button>
        <Button
          variant={activeTab === 'streaks' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('streaks')}
        >
          <Flame className="h-4 w-4 mr-1" />
          Streaks
        </Button>
        <Button
          variant={activeTab === 'challenges' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('challenges')}
        >
          <Target className="h-4 w-4 mr-1" />
          Challenges
        </Button>
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy className="h-4 w-4 mr-1" />
          Leaderboard
        </Button>
      </div>

      {/* Level & XP Tab */}
      {activeTab === 'level' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                Level {userLevel.current} - {userLevel.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>XP Progress</span>
                      <span>{userLevel.xp.toLocaleString()} / {userLevel.totalXpForNext.toLocaleString()}</span>
                    </div>
                    <Progress value={levelProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {userLevel.xpToNext.toLocaleString()} XP to next level
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{userLevel.xp.toLocaleString()} Total XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Medal className="h-4 w-4 text-primary" />
                      <span>Level {userLevel.current}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Level Perks</h4>
                  <div className="space-y-1">
                    {userLevel.perks.map((perk, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Streaks Tab */}
      {activeTab === 'streaks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streaks.map((streak, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{streak.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {streak.count} day streak!
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{streak.count}/{streak.maxCount} days</span>
                  </div>
                  <Progress value={(streak.count / streak.maxCount) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm">
                      <Gift className="h-4 w-4 text-amber-500" />
                      <span>{streak.reward} XP/day</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {streak.lastActivity.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{challenge.title}</h3>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {challenge.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">{challenge.reward.xp} XP</span>
                    </div>
                    {challenge.expiresAt && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {challenge.expiresAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.progress}/{challenge.target}</span>
                  </div>
                  <Progress value={(challenge.progress / challenge.target) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                      <span>{Math.round((challenge.progress / challenge.target) * 100)}% complete</span>
                      {challenge.reward.badge && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-amber-500" />
                          <span>{challenge.reward.badge}</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" disabled={challenge.progress >= challenge.target}>
                      {challenge.progress >= challenge.target ? 'Completed' : 'Continue'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Weekly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    user.isCurrentUser ? 'bg-primary/5 border-primary/20' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      user.rank === 1 ? 'bg-amber-100 text-amber-700' :
                      user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {user.rank <= 3 ? (
                        <Crown className="h-4 w-4" />
                      ) : (
                        user.rank
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${user.isCurrentUser ? 'text-primary' : ''}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Level {user.level}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{user.points.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>
                    {getChangeIcon(user.change)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Keep climbing! Complete challenges and earn XP to improve your ranking.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};