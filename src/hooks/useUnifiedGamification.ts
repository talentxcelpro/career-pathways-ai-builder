import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  requirement: number;
  points: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  achievements?: Achievement;
}

export interface GlobalRanking {
  user_id: string;
  total_points: number;
  txc_balance: number;
  achievements_count: number;
  current_streak: number;
  rank: number;
  profiles?: {
    full_name: string;
    profile_picture_url: string;
  };
}

export function useUnifiedGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Fetch achievements from real career achievements data
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      // Create achievement definitions from existing achievement patterns
      const { data: existingAchievements, error } = await supabase
        .from('career_achievements')
        .select('achievement_type, achievement_title, achievement_description, points_awarded')
        .limit(1000);
      
      if (error) throw error;
      
      // Generate unique achievement definitions from patterns
      const achievementMap = new Map();
      existingAchievements?.forEach(ach => {
        if (!achievementMap.has(ach.achievement_type)) {
          achievementMap.set(ach.achievement_type, {
            id: ach.achievement_type,
            title: ach.achievement_title,
            description: ach.achievement_description || 'Achievement unlocked',
            type: ach.achievement_type,
            requirement: 1,
            points: ach.points_awarded || 100,
            icon: 'star',
            rarity: ach.points_awarded > 500 ? 'epic' : ach.points_awarded > 200 ? 'rare' : 'common',
            category: ach.achievement_type.includes('social') ? 'social' : 
                     ach.achievement_type.includes('career') ? 'career' : 
                     ach.achievement_type.includes('skill') ? 'career' : 'engagement',
            is_active: true
          });
        }
      });
      
      return Array.from(achievementMap.values()) as Achievement[];
    }
  });

  // Fetch user achievements from career_achievements
  const { data: userAchievements, refetch: refetchUserAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(ach => ({
        id: ach.id,
        user_id: ach.user_id,
        achievement_id: ach.achievement_type,
        progress: 1,
        is_completed: true,
        completed_at: ach.earned_at,
        achievements: {
          id: ach.achievement_type,
          title: ach.achievement_title,
          description: ach.achievement_description,
          points: ach.points_awarded
        }
      })) as UserAchievement[];
    },
    enabled: !!user
  });

  // Fetch global rankings from txc_leaderboard
  const { data: globalRankings } = useQuery({
    queryKey: ['global-rankings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('txc_leaderboard')
          .select('*')
          .limit(50);
        
        if (error || !data) return [];
        
        return data.map(ranking => ({
          user_id: ranking.user_id || '',
          total_points: ranking.lifetime_txc || 0,
          txc_balance: ranking.current_txc || 0,
          achievements_count: 0,
          current_streak: 0,
          rank: ranking.rank || 0,
          profiles: {
            full_name: ranking.full_name || 'Anonymous',
            profile_picture_url: ranking.profile_picture_url || ''
          }
        })) as GlobalRanking[];
      } catch {
        return [];
      }
    }
  });

  // Get user's ranking from txc_leaderboard
  const { data: userRanking } = useQuery({
    queryKey: ['user-ranking', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('txc_leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        user_id: data.user_id || '',
        total_points: data.lifetime_txc || 0,
        txc_balance: data.current_txc || 0,
        achievements_count: 0,
        current_streak: 0,
        rank: data.rank || 0
      } as GlobalRanking;
    },
    enabled: !!user
  });

  // Award achievement mutation
  const awardAchievement = useMutation({
    mutationFn: async ({ achievementId, progress }: { achievementId: string; progress: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('unified-gamification-api', {
        body: {
          action: 'award_achievement',
          user_id: user.id,
          achievement_id: achievementId,
          progress
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.achievement_awarded) {
        toast.success(`🎉 Achievement Unlocked: ${data.achievement.title}!`, {
          description: `You earned ${data.achievement.points} points!`
        });
      }
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['global-rankings'] });
      queryClient.invalidateQueries({ queryKey: ['user-ranking'] });
    }
  });

  // Update TXC balance
  const updateTXCBalance = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('unified-gamification-api', {
        body: {
          action: 'update_txc_balance',
          user_id: user.id,
          amount
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-rankings'] });
      queryClient.invalidateQueries({ queryKey: ['user-ranking'] });
    }
  });

  // Trigger achievement check
  const triggerAchievementCheck = useCallback(async (eventType: string, metadata: any = {}) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('unified-gamification-api', {
        body: {
          action: 'check_achievements',
          user_id: user.id,
          event_type: eventType,
          metadata
        }
      });

      if (error) throw error;

      if (data?.achievements_awarded?.length > 0) {
        data.achievements_awarded.forEach((achievement: any) => {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`, {
            description: `You earned ${achievement.points} points!`
          });
        });
      }

      return data;
    } catch (error) {
      console.error('Achievement check failed:', error);
    }
  }, [user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('unified-gamification')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New achievement received:', payload);
        refetchUserAchievements();
        queryClient.invalidateQueries({ queryKey: ['global-rankings'] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'global_rankings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Ranking updated:', payload);
        queryClient.invalidateQueries({ queryKey: ['user-ranking'] });
        queryClient.invalidateQueries({ queryKey: ['global-rankings'] });
      })
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, refetchUserAchievements, queryClient]);

  // Auto-trigger achievement checks for common actions
  const triggerProfileCompleted = () => triggerAchievementCheck('profile_completed');
  const triggerJobApplied = () => triggerAchievementCheck('job_applied');
  const triggerConnectionMade = () => triggerAchievementCheck('connection_made');
  const triggerPostCreated = () => triggerAchievementCheck('post_created');
  const triggerCourseCompleted = () => triggerAchievementCheck('course_completed');
  const triggerSkillAdded = () => triggerAchievementCheck('skill_added');
  const triggerLoginStreak = (streakDays: number) => triggerAchievementCheck('login_streak', { streak: streakDays });

  return {
    // Data
    achievements,
    userAchievements,
    globalRankings,
    userRanking,
    
    // Actions
    awardAchievement,
    updateTXCBalance,
    triggerAchievementCheck,
    
    // Convenience triggers
    triggerProfileCompleted,
    triggerJobApplied,
    triggerConnectionMade,
    triggerPostCreated,
    triggerCourseCompleted,
    triggerSkillAdded,
    triggerLoginStreak,
    
    // Loading states
    isAwarding: awardAchievement.isPending,
    isUpdatingTXC: updateTXCBalance.isPending
  };
}