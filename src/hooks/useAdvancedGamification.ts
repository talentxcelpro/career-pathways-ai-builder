import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'engagement' | 'content' | 'network' | 'learning' | 'influence';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  total: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  total_points: number;
  achievements_count: number;
  streak_days: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  reward_points: number;
  expires_at: string;
  progress: number;
  target: number;
  completed: boolean;
}

export const useAdvancedGamification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user achievements
  const { data: achievements = [], isLoading: loadingAchievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gamification_stats')
        .select(`
          user_id,
          total_points,
          achievements_count,
          streak_days,
          profiles(full_name, profile_picture_url)
        `)
        .order('total_points', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data.map((entry: any, index: number) => ({
        rank: index + 1,
        user_id: entry.user_id,
        full_name: entry.profiles?.[0]?.full_name || 'Anonymous',
        profile_picture_url: entry.profiles?.[0]?.profile_picture_url,
        total_points: entry.total_points,
        achievements_count: entry.achievements_count,
        streak_days: entry.streak_days
      })) as LeaderboardEntry[];
    }
  });

  // Fetch active challenges
  const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user
  });

  // Unlock achievement mutation
  const unlockAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        })
        .select(`
          *,
          achievement:achievements(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });

      // Celebration effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(
        `🏆 Achievement Unlocked: ${data.achievement.title}`,
        {
          description: `+${data.achievement.points} points earned!`
        }
      );
    }
  });

  // Complete challenge mutation
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_challenges')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .eq('user_id', user.id)
        .select(`
          *,
          challenge:challenges(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });

      toast.success(
        `✅ Challenge Complete: ${data.challenge.title}`,
        {
          description: `+${data.challenge.reward_points} points earned!`
        }
      );
    }
  });

  // Get user rank
  const getUserRank = (): number => {
    if (!user) return 0;
    const entry = leaderboard.find(e => e.user_id === user.id);
    return entry?.rank || 0;
  };

  // Get total points
  const getTotalPoints = (): number => {
    if (!user) return 0;
    const entry = leaderboard.find(e => e.user_id === user.id);
    return entry?.total_points || 0;
  };

  // Calculate level from points
  const calculateLevel = (points: number): number => {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  };

  // Get next level progress
  const getNextLevelProgress = (points: number): number => {
    const currentLevel = calculateLevel(points);
    const pointsForCurrentLevel = (currentLevel - 1) ** 2 * 100;
    const pointsForNextLevel = currentLevel ** 2 * 100;
    const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return {
    achievements,
    leaderboard,
    challenges,
    isLoading: loadingAchievements || loadingLeaderboard || loadingChallenges,
    unlockAchievement: unlockAchievementMutation.mutate,
    completeChallenge: completeChallengeMutation.mutate,
    getUserRank,
    getTotalPoints,
    calculateLevel,
    getNextLevelProgress,
    userLevel: calculateLevel(getTotalPoints()),
    nextLevelProgress: getNextLevelProgress(getTotalPoints())
  };
};
