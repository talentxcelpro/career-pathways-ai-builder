import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { useUserScores } from '@/hooks/useUserScores';
import { 
  Award, 
  Trophy, 
  Crown, 
  Star, 
  Target, 
  Flame, 
  Users, 
  Briefcase,
  BookOpen,
  Zap,
  CheckCircle,
  Lock,
  Filter
} from 'lucide-react';

export const AchievementGallery: React.FC = () => {
  const { achievements, availableAchievements, getAchievementProgress } = useGamification();
  const { data: userScores } = useUserScores();
  const [filter, setFilter] = useState('all');

  const achievementCategories = {
    'career': { icon: Briefcase, color: 'bg-blue-500', name: 'Career' },
    'social': { icon: Users, color: 'bg-purple-500', name: 'Social' },
    'learning': { icon: BookOpen, color: 'bg-green-500', name: 'Learning' },
    'streak': { icon: Flame, color: 'bg-orange-500', name: 'Streaks' },
    'special': { icon: Crown, color: 'bg-yellow-500', name: 'Special' }
  };

  const getRarityInfo = (points: number) => {
    if (points >= 1000) return { name: 'Legendary', color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', glow: 'shadow-yellow-200 shadow-xl' };
    if (points >= 500) return { name: 'Epic', color: 'bg-purple-500 text-white', glow: 'shadow-purple-200 shadow-lg' };
    if (points >= 250) return { name: 'Rare', color: 'bg-blue-500 text-white', glow: 'shadow-blue-200 shadow-lg' };
    return { name: 'Common', color: 'bg-gray-500 text-white', glow: '' };
  };

  const mockAchievements = [
    {
      id: '1',
      title: 'Career Pioneer',
      description: 'Complete your first job application',
      category: 'career',
      points: 100,
      icon: Briefcase,
      earned: true,
      earnedDate: '2024-01-15',
      progress: 100
    },
    {
      id: '2',
      title: 'Network Builder',
      description: 'Connect with 10 professionals',
      category: 'social',
      points: 200,
      icon: Users,
      earned: true,
      earnedDate: '2024-01-20',
      progress: 100
    },
    {
      id: '3',
      title: 'Streak Master',
      description: 'Maintain a 30-day login streak',
      category: 'streak',
      points: 500,
      icon: Flame,
      earned: false,
      progress: 73,
      current: 22,
      target: 30
    },
    {
      id: '4',
      title: 'Knowledge Seeker',
      description: 'Complete 5 learning courses',
      category: 'learning',
      points: 300,
      icon: BookOpen,
      earned: false,
      progress: 60,
      current: 3,
      target: 5
    },
    {
      id: '5',
      title: 'Elite Professional',
      description: 'Reach 10,000 total points',
      category: 'special',
      points: 1000,
      icon: Crown,
      earned: false,
      progress: 45,
      current: 4500,
      target: 10000
    },
    {
      id: '6',
      title: 'Application Ace',
      description: 'Apply to 50 jobs',
      category: 'career',
      points: 250,
      icon: Target,
      earned: false,
      progress: 32,
      current: 16,
      target: 50
    }
  ];

  const filteredAchievements = filter === 'all' 
    ? mockAchievements 
    : mockAchievements.filter(a => a.category === filter);

  const earnedCount = mockAchievements.filter(a => a.earned).length;
  const totalPoints = mockAchievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-8">
      {/* Achievement Stats */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-yellow-700 mb-2">Achievement Gallery</h2>
            <p className="text-yellow-600 mb-6">Showcase your accomplishments and track your progress</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">{earnedCount}</div>
                <div className="text-sm text-yellow-600">Achievements Unlocked</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">{totalPoints.toLocaleString()}</div>
                <div className="text-sm text-yellow-600">Points Earned</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">
                  {Math.round((earnedCount / mockAchievements.length) * 100)}%
                </div>
                <div className="text-sm text-yellow-600">Completion Rate</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-700">Elite</div>
                <div className="text-sm text-yellow-600">Achievement Rank</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          All Achievements
        </Button>
        {Object.entries(achievementCategories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const rarity = getRarityInfo(achievement.points);
          const category = achievementCategories[achievement.category as keyof typeof achievementCategories];
          
          return (
            <Card key={achievement.id} className={`
              relative overflow-hidden transition-all duration-300 hover:shadow-lg
              ${achievement.earned ? rarity.glow : 'opacity-75'}
            `}>
              {/* Rarity Border */}
              {achievement.earned && (
                <div className={`absolute top-0 left-0 w-full h-1 ${rarity.color.split(' ')[0]}`}></div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center relative
                      ${achievement.earned 
                        ? `${category.color} text-white` 
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      <Icon className="h-8 w-8" />
                      {achievement.earned && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {!achievement.earned && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <Lock className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={rarity.color}>
                      {rarity.name}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {category.name}
                    </Badge>
                    <Badge variant="secondary">
                      +{achievement.points} pts
                    </Badge>
                  </div>

                  {/* Progress */}
                  {!achievement.earned && achievement.current !== undefined && achievement.target !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.current} / {achievement.target}</span>
                      </div>
                      <Progress value={achievement.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        {achievement.progress}% complete
                      </div>
                    </div>
                  )}

                  {/* Earned Date */}
                  {achievement.earned && achievement.earnedDate && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-700">
                        Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {!achievement.earned && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Keep working towards this achievement!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAchievements.filter(a => a.earned).slice(0, 4).map((achievement) => {
              const Icon = achievement.icon;
              const rarity = getRarityInfo(achievement.points);
              
              return (
                <div key={achievement.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievementCategories[achievement.category as keyof typeof achievementCategories].color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={rarity.color}>+{achievement.points}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};