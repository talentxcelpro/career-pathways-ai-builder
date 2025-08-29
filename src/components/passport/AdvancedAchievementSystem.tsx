import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Crown, 
  Shield, 
  Flame,
  CheckCircle,
  Clock,
  Lock,
  Share2,
  Filter,
  Briefcase,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
  category?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  achievements: Achievement[];
  totalPoints: number;
  earnedCount: number;
}

export function AdvancedAchievementSystem({ 
  userId, 
  achievements: propsAchievements = [], 
  pendingAchievements: propsPendingAchievements = [], 
  userProfile,
  isOwner = true 
}: { 
  userId?: string;
  achievements?: any[];
  pendingAchievements?: any[];
  userProfile?: any;
  isOwner?: boolean;
}) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', targetUserId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!targetUserId,
  });

  const { data: totalScore = 0 } = useQuery({
    queryKey: ['user-total-score', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return 0;
      
      const { data, error } = await supabase
        .from('user_scores')
        .select('total_points')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.total_points || 0;
    },
    enabled: !!targetUserId,
  });

  // Categorize achievements
  const categories: AchievementCategory[] = [
    {
      id: 'career',
      name: 'Career Building',
      description: 'Professional development and career advancement',
      icon: <Briefcase className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-800',
      achievements: achievements.filter(a => a.achievement_type.includes('career')),
      totalPoints: 0,
      earnedCount: 0
    },
    {
      id: 'networking',
      name: 'Networking',
      description: 'Building professional connections',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-100 text-green-800',
      achievements: achievements.filter(a => a.achievement_type.includes('network')),
      totalPoints: 0,
      earnedCount: 0
    },
    {
      id: 'skills',
      name: 'Skills & Learning',
      description: 'Skill development and certifications',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-800',
      achievements: achievements.filter(a => a.achievement_type.includes('skill')),
      totalPoints: 0,
      earnedCount: 0
    },
    {
      id: 'milestones',
      name: 'Milestones',
      description: 'Major career achievements',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-yellow-100 text-yellow-800',
      achievements: achievements.filter(a => a.achievement_type.includes('milestone')),
      totalPoints: 0,
      earnedCount: 0
    }
  ];

  // Calculate category stats
  categories.forEach(category => {
    category.totalPoints = category.achievements.reduce((sum, a) => sum + a.points_awarded, 0);
    category.earnedCount = category.achievements.length;
  });

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : categories.find(c => c.id === selectedCategory)?.achievements || [];

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-yellow-800">
                <Trophy className="w-6 h-6 mr-2" />
                Achievement Hub
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Track your career milestones and unlock new achievements
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-800">{totalScore}</div>
              <div className="text-sm text-yellow-600">Total Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${category.color}`}>
                  {category.icon}
                </div>
                <div className="font-semibold">{category.earnedCount}</div>
                <div className="text-xs text-muted-foreground">{category.name}</div>
                <div className="text-xs text-yellow-600">{category.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Achievements</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyEarned ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyEarned(!showOnlyEarned)}
              >
                <Filter className="w-4 h-4 mr-1" />
                {showOnlyEarned ? 'All' : 'Earned Only'}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    onShare={() => {/* Implement sharing */}}
                  />
                ))}
              </div>
              
              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-muted-foreground">
                    Start building your career to unlock achievements!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Leaderboard Preview */}
      <AchievementLeaderboard />
    </div>
  );
}

function AchievementCard({ achievement, onShare }: {
  achievement: Achievement;
  onShare: () => void;
}) {
  const earnedDate = new Date(achievement.earned_at);
  
  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'epic': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'rare': return <Flame className="w-4 h-4 text-orange-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'border-purple-300 bg-purple-50';
      case 'epic': return 'border-blue-300 bg-blue-50';
      case 'rare': return 'border-orange-300 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${getRarityColor(achievement.rarity)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getRarityIcon(achievement.rarity)}
            <div>
              <h4 className="font-semibold text-foreground">
                {achievement.achievement_title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {achievement.achievement_description}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {achievement.points_awarded} pts
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Earned {earnedDate.toLocaleDateString()}
          </div>
          {achievement.verified && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </div>
          )}
        </div>
        
        {achievement.is_public && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={onShare}
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share Achievement
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementLeaderboard() {
  // Mock data for development
  const mockLeaderboard = [
    {
      user_id: '1',
      total_points: 2500,
      profiles: {
        full_name: 'Sarah Wilson',
        profile_picture_url: '/placeholder.svg'
      }
    },
    {
      user_id: '2',
      total_points: 2200,
      profiles: {
        full_name: 'Michael Chen',
        profile_picture_url: '/placeholder.svg'
      }
    },
    {
      user_id: '3',
      total_points: 1800,
      profiles: {
        full_name: 'Emma Rodriguez',
        profile_picture_url: '/placeholder.svg'
      }
    }
  ];

  const { data: leaderboard = mockLeaderboard } = useQuery({
    queryKey: ['achievement-leaderboard'],
    queryFn: async () => {
      // For development, return mock data
      return mockLeaderboard;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-500" />
          Top Achievers
        </CardTitle>
        <CardDescription>
          See how you rank among TalentXcel professionals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profiles?.profile_picture_url} />
                  <AvatarFallback>{user.profiles?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.profiles?.full_name}</span>
              </div>
              <Badge variant="secondary">{user.total_points} pts</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}