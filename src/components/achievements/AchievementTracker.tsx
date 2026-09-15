import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Award, 
  Share2, 
  Lock, 
  CheckCircle,
  TrendingUp,
  Users,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'skills' | 'networking' | 'learning';
  type: 'milestone' | 'streak' | 'completion' | 'social';
  points: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  requirements: string[];
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Profile Pioneer',
    description: 'Complete your professional profile',
    category: 'career',
    type: 'completion',
    points: 50,
    icon: 'user',
    rarity: 'common',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: new Date(),
    requirements: ['Complete basic profile information']
  },
  {
    id: '2',
    title: 'Skill Master',
    description: 'Earn 5 verified skill badges',
    category: 'skills',
    type: 'milestone',
    points: 200,
    icon: 'award',
    rarity: 'rare',
    unlocked: true,
    progress: 5,
    maxProgress: 5,
    unlockedAt: new Date(Date.now() - 86400000),
    requirements: ['Verify 5 different skills']
  },
  {
    id: '3',
    title: 'Network Builder',
    description: 'Connect with 25 professionals',
    category: 'networking',
    type: 'milestone',
    points: 150,
    icon: 'users',
    rarity: 'rare',
    unlocked: false,
    progress: 18,
    maxProgress: 25,
    requirements: ['Make 25 professional connections']
  },
  {
    id: '4',
    title: 'Learning Streak',
    description: 'Complete assessments for 7 consecutive days',
    category: 'learning',
    type: 'streak',
    points: 300,
    icon: 'trending-up',
    rarity: 'epic',
    unlocked: false,
    progress: 4,
    maxProgress: 7,
    requirements: ['Complete daily assessments for 7 days']
  },
  {
    id: '5',
    title: 'Career Catalyst',
    description: 'Get featured in top 1% of profiles',
    category: 'career',
    type: 'milestone',
    points: 500,
    icon: 'trophy',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: ['Achieve top 1% profile ranking']
  }
];

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    user: Users,
    award: Award,
    users: Users,
    'trending-up': TrendingUp,
    trophy: Trophy,
    'book-open': BookOpen,
    briefcase: Briefcase
  };
  return icons[iconName] || Trophy;
};

const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'bg-gray-100 text-gray-700 border-gray-200',
    rare: 'bg-blue-100 text-blue-700 border-blue-200',
    epic: 'bg-purple-100 text-purple-700 border-purple-200',
    legendary: 'bg-amber-100 text-amber-700 border-amber-200'
  };
  return colors[rarity as keyof typeof colors] || colors.common;
};

export const AchievementTracker: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || achievement.unlocked;
    return categoryMatch && unlockedMatch;
  });

  const stats = {
    totalPoints: achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0),
    totalAchievements: achievements.length,
    unlockedAchievements: achievements.filter(a => a.unlocked).length,
    commonUnlocked: achievements.filter(a => a.unlocked && a.rarity === 'common').length,
    rareUnlocked: achievements.filter(a => a.unlocked && a.rarity === 'rare').length,
    epicUnlocked: achievements.filter(a => a.unlocked && a.rarity === 'epic').length,
    legendaryUnlocked: achievements.filter(a => a.unlocked && a.rarity === 'legendary').length
  };

  const shareAchievement = (achievement: Achievement) => {
    if (navigator.share) {
      navigator.share({
        title: `I unlocked "${achievement.title}"!`,
        text: `Just earned the "${achievement.title}" achievement on TalentXcel! ${achievement.description}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers without native sharing
      const text = `Just earned the "${achievement.title}" achievement on TalentXcel! ${achievement.description}`;
      navigator.clipboard.writeText(text);
    }
  };

  // Simulate achievement unlock
  useEffect(() => {
    const timer = setTimeout(() => {
      const lockedAchievement = achievements.find(a => !a.unlocked && a.progress >= a.maxProgress * 0.8);
      if (lockedAchievement && Math.random() > 0.7) {
        setNewAchievement(lockedAchievement);
        setTimeout(() => setNewAchievement(null), 5000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-200 rounded-full">
                    <Trophy className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Achievement Unlocked!</p>
                    <p className="text-sm text-amber-700">{newAchievement.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.unlockedAchievements}/{stats.totalAchievements}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}%</span>
              </div>
              <Progress value={(stats.unlockedAchievements / stats.totalAchievements) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Rarity Collection</p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">C: {stats.commonUnlocked}</Badge>
                <Badge variant="secondary" className="text-xs">R: {stats.rareUnlocked}</Badge>
                <Badge variant="secondary" className="text-xs">E: {stats.epicUnlocked}</Badge>
                <Badge variant="secondary" className="text-xs">L: {stats.legendaryUnlocked}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        <Button
          variant={selectedCategory === 'career' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('career')}
        >
          <Briefcase className="h-4 w-4 mr-1" />
          Career
        </Button>
        <Button
          variant={selectedCategory === 'skills' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('skills')}
        >
          <Award className="h-4 w-4 mr-1" />
          Skills
        </Button>
        <Button
          variant={selectedCategory === 'networking' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('networking')}
        >
          <Users className="h-4 w-4 mr-1" />
          Networking
        </Button>
        <Button
          variant={selectedCategory === 'learning' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('learning')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Learning
        </Button>
        <Button
          variant={showUnlockedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Unlocked Only
        </Button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const IconComponent = getIconComponent(achievement.icon);
          
          return (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className={`relative overflow-hidden ${achievement.unlocked ? '' : 'opacity-75'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                        {achievement.unlocked ? (
                          <IconComponent className="h-6 w-6 text-primary" />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <Badge className={`${getRarityColor(achievement.rarity)} text-xs`}>
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareAchievement(achievement)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      {achievement.points} points
                    </span>
                    <span className="text-muted-foreground capitalize">
                      {achievement.type}
                    </span>
                  </div>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                    </div>
                  )}

                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </p>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-medium">Requirements:</p>
                    {achievement.requirements.map((req, index) => (
                      <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {req}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};