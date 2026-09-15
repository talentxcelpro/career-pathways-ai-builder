import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Target, 
  Trophy, 
  Calendar, 
  TrendingUp,
  BookOpen,
  Briefcase,
  Code,
  Rocket,
  UserPlus,
  Clock,
  Award,
  Flame,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
  description: string;
  goal_type: string;
  target_outcome: string;
  timeline_months: number;
  member_count: number;
  max_members: number;
  created_by: string;
  created_at: string;
  cover_image_url?: string;
  tags: string[];
  is_member?: boolean;
  progress_score?: number;
  streak_days?: number;
}

interface UserProgress {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  communities_joined: number;
}

const GOAL_TYPES = {
  skill_development: { label: 'Skill Development', icon: BookOpen, color: 'bg-blue-500' },
  career_change: { label: 'Career Change', icon: Rocket, color: 'bg-purple-500' },
  networking: { label: 'Networking', icon: Users, color: 'bg-green-500' },
  job_search: { label: 'Job Search', icon: Briefcase, color: 'bg-orange-500' },
  coding: { label: 'Coding & Tech', icon: Code, color: 'bg-indigo-500' }
};

export const GoalDrivenCommunities: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const { data: communities, isLoading } = useQuery({
    queryKey: ['goal-communities', selectedFilter, currentUser?.id],
    queryFn: async () => {
      let query = supabase
        .from('goal_communities')
        .select(`
          *,
          community_memberships!left(user_id, progress_score, streak_days)
        `)
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (selectedFilter !== 'all') {
        query = query.eq('goal_type', selectedFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Add membership status
      const communitiesWithMembership = data.map(community => ({
        ...community,
        is_member: community.community_memberships?.some(
          (membership: any) => membership.user_id === currentUser?.id
        ),
        progress_score: community.community_memberships?.find(
          (membership: any) => membership.user_id === currentUser?.id
        )?.progress_score || 0,
        streak_days: community.community_memberships?.find(
          (membership: any) => membership.user_id === currentUser?.id
        )?.streak_days || 0
      }));

      return communitiesWithMembership;
    }
  });

  const { data: userAchievements } = useQuery({
    queryKey: ['user-achievements', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('earned_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const joinCommunityMutation = useMutation({
    mutationFn: async (communityId: string) => {
      if (!currentUser) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          community_id: communityId,
          user_id: currentUser.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-communities'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      toast.success('Successfully joined community!');
    },
    onError: () => {
      toast.error('Failed to join community');
    }
  });

  const handleJoinCommunity = async (communityId: string) => {
    setJoiningCommunity(communityId);
    try {
      await joinCommunityMutation.mutateAsync(communityId);
    } finally {
      setJoiningCommunity(null);
    }
  };

  const getGoalTypeInfo = (goalType: string) => {
    return GOAL_TYPES[goalType as keyof typeof GOAL_TYPES] || GOAL_TYPES.skill_development;
  };

  const calculateTimeLeft = (createdAt: string, timelineMonths: number) => {
    const created = new Date(createdAt);
    const deadline = new Date(created);
    deadline.setMonth(deadline.getMonth() + timelineMonths);
    
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Completed';
    if (diffDays <= 30) return `${diffDays} days left`;
    
    const diffMonths = Math.ceil(diffDays / 30);
    return `${diffMonths} months left`;
  };

  return (
    <div className="space-y-6">
      {/* User Progress Dashboard */}
      {currentUser && userProgress && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Your Progress</h3>
                <p className="text-sm text-purple-700">Keep building towards your goals!</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                  <Flame className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">{userProgress.current_streak} day streak</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">{userProgress.total_points}</div>
                <div className="text-xs text-purple-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{userProgress.communities_joined}</div>
                <div className="text-xs text-blue-600">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{userProgress.longest_streak}</div>
                <div className="text-xs text-green-600">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{userAchievements?.length || 0}</div>
                <div className="text-xs text-orange-600">Badges</div>
              </div>
            </div>
            
            {/* Recent Achievements */}
            {userAchievements && userAchievements.length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">Recent Achievements</p>
                <div className="flex gap-2">
                  {userAchievements.slice(0, 3).map((achievement) => (
                    <Badge key={achievement.id} variant="secondary" className="bg-purple-100 text-purple-800">
                      <Award className="h-3 w-3 mr-1" />
                      {achievement.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Communities Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Goal-Driven Communities
            </CardTitle>
            <Link to="/network/communities/create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Community
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Join focused groups working towards similar career goals
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All Communities
            </Button>
            {Object.entries(GOAL_TYPES).map(([key, { label, icon: Icon }]) => (
              <Button
                key={key}
                variant={selectedFilter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(key)}
                className="flex items-center gap-1"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Communities Grid */}
          <div className="grid gap-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-8 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))
            ) : communities && communities.length > 0 ? (
              communities.map((community) => {
                const goalInfo = getGoalTypeInfo(community.goal_type);
                const GoalIcon = goalInfo.icon;
                const timeLeft = calculateTimeLeft(community.created_at, community.timeline_months);
                const progressPercentage = Math.min((community.progress_score || 0), 100);
                
                return (
                  <div key={community.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${goalInfo.color}`}>
                          <GoalIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{community.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{community.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {community.member_count}/{community.max_members} members
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeLeft}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {community.is_member ? (
                          <Link to={`/network/communities/${community.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinCommunity(community.id)}
                            disabled={joiningCommunity === community.id || community.member_count >= community.max_members}
                          >
                            {joiningCommunity === community.id ? (
                              'Joining...'
                            ) : community.member_count >= community.max_members ? (
                              'Full'
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Join
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Members */}
                    {community.is_member && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Your Progress</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        {community.streak_days > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                            <Flame className="h-3 w-3" />
                            {community.streak_days} day streak in this community
                          </div>
                        )}
                      </div>
                    )}

                    {/* Target Outcome */}
                    {community.target_outcome && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-900">Goal</span>
                        </div>
                        <p className="text-sm text-gray-600">{community.target_outcome}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {community.tags && community.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {community.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {community.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{community.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No communities found for your current filter.</p>
                <p className="text-xs mt-1">Be the first to create one!</p>
              </div>
            )}
          </div>

          {communities && communities.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center">
              <Link to="/network/communities">
                <Button variant="ghost" size="sm">
                  View All Communities
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};