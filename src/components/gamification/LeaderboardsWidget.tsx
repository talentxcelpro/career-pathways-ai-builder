import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface LeaderboardUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  communities_joined: number;
  achievements_count: number;
  rank: number;
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface LeaderboardCategory {
  key: string;
  title: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    key: 'points',
    title: 'Total Points',
    icon: Trophy,
    description: 'Users with highest total points',
    color: 'text-yellow-600'
  },
  {
    key: 'streaks',
    title: 'Current Streaks',
    icon: Flame,
    description: 'Users with longest active streaks',
    color: 'text-orange-600'
  },
  {
    key: 'communities',
    title: 'Community Champions',
    icon: Users,
    description: 'Most active community members',
    color: 'text-purple-600'
  },
  {
    key: 'achievements',
    title: 'Badge Collectors',
    icon: Award,
    description: 'Users with most achievements',
    color: 'text-blue-600'
  }
];

const TIME_FILTERS = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' }
];

export const LeaderboardsWidget: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('points');
  const [timeFilter, setTimeFilter] = useState('all');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-leaderboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', activeCategory, timeFilter],
    queryFn: async () => {
      // Mock data for demonstration - in real implementation, this would query actual tables
      const mockUsers: LeaderboardUser[] = [
        {
          id: '1',
          full_name: 'Rajesh Kumar',
          avatar_url: '/api/placeholder/40/40',
          total_points: 2450,
          current_streak: 28,
          longest_streak: 45,
          communities_joined: 8,
          achievements_count: 12,
          rank: 1,
          badge_level: 'platinum'
        },
        {
          id: '2',
          full_name: 'Priya Sharma',
          avatar_url: '/api/placeholder/40/40',
          total_points: 2280,
          current_streak: 22,
          longest_streak: 35,
          communities_joined: 6,
          achievements_count: 10,
          rank: 2,
          badge_level: 'gold'
        },
        {
          id: '3',
          full_name: 'Amit Patel',
          avatar_url: '/api/placeholder/40/40',
          total_points: 2100,
          current_streak: 18,
          longest_streak: 30,
          communities_joined: 5,
          achievements_count: 8,
          rank: 3,
          badge_level: 'gold'
        },
        {
          id: '4',
          full_name: 'Sneha Gupta',
          avatar_url: '/api/placeholder/40/40',
          total_points: 1950,
          current_streak: 15,
          longest_streak: 25,
          communities_joined: 4,
          achievements_count: 7,
          rank: 4,
          badge_level: 'silver'
        },
        {
          id: '5',
          full_name: 'Rohit Singh',
          avatar_url: '/api/placeholder/40/40',
          total_points: 1820,
          current_streak: 12,
          longest_streak: 22,
          communities_joined: 3,
          achievements_count: 6,
          rank: 5,
          badge_level: 'silver'
        }
      ];

      // Sort based on active category
      const sortedUsers = [...mockUsers].sort((a, b) => {
        switch (activeCategory) {
          case 'points':
            return b.total_points - a.total_points;
          case 'streaks':
            return b.current_streak - a.current_streak;
          case 'communities':
            return b.communities_joined - a.communities_joined;
          case 'achievements':
            return b.achievements_count - a.achievements_count;
          default:
            return b.total_points - a.total_points;
        }
      });

      return sortedUsers.map((user, index) => ({ ...user, rank: index + 1 }));
    }
  });

  const { data: userRanking } = useQuery({
    queryKey: ['user-ranking', activeCategory, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      // Mock user ranking data
      return {
        rank: 15,
        total_users: 1247,
        percentile: 88,
        points_to_next: 150
      };
    },
    enabled: !!currentUser
  });

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'platinum': return 'bg-gray-800 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'silver': return 'bg-gray-400 text-white';
      case 'bronze': return 'bg-orange-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getMetricValue = (user: LeaderboardUser) => {
    switch (activeCategory) {
      case 'points': return user.total_points.toLocaleString();
      case 'streaks': return `${user.current_streak} days`;
      case 'communities': return `${user.communities_joined} communities`;
      case 'achievements': return `${user.achievements_count} badges`;
      default: return user.total_points.toLocaleString();
    }
  };

  const activeConfig = LEADERBOARD_CATEGORIES.find(cat => cat.key === activeCategory);
  const ActiveIcon = activeConfig?.icon || Trophy;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-yellow-900">Leaderboards</h2>
              <p className="text-sm text-yellow-700">Compete with fellow professionals</p>
            </div>
          </div>
          
          {/* User Ranking */}
          {currentUser && userRanking && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">#{userRanking.rank}</div>
                <div className="text-xs text-gray-600">Your Rank</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userRanking.percentile}%</div>
                <div className="text-xs text-gray-600">Percentile</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userRanking.points_to_next}</div>
                <div className="text-xs text-gray-600">Points to Next</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userRanking.total_users}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {LEADERBOARD_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category.key)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.title}
            </Button>
          );
        })}
      </div>

      {/* Time Filters */}
      <div className="flex gap-2">
        {TIME_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={timeFilter === filter.key ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActiveIcon className={`h-5 w-5 ${activeConfig?.color}`} />
            {activeConfig?.title} Leaderboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeConfig?.description}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData?.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    user.id === currentUser?.id ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{user.full_name}</h4>
                      <Badge className={getBadgeColor(user.badge_level)}>
                        {user.badge_level}
                      </Badge>
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {user.achievements_count} achievements • {user.communities_joined} communities
                    </p>
                  </div>

                  {/* Metric */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {getMetricValue(user)}
                    </div>
                    {activeCategory === 'streaks' && user.current_streak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Flame className="h-3 w-3" />
                        Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View More */}
          <div className="mt-6 pt-4 border-t text-center">
            <Button variant="ghost" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Featured Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Streak Master', description: '30 day streak', icon: Flame, color: 'bg-orange-500' },
              { name: 'Community Leader', description: 'Join 5 communities', icon: Users, color: 'bg-purple-500' },
              { name: 'Goal Achiever', description: 'Complete 10 goals', icon: Target, color: 'bg-green-500' },
              { name: 'Rising Star', description: 'Top 10% this month', icon: Star, color: 'bg-blue-500' }
            ].map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.name} className="text-center p-4 border rounded-lg">
                  <div className={`inline-flex p-3 rounded-full ${achievement.color} mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">{achievement.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};