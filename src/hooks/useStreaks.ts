import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_days_active: number;
  streak_milestones: number[];
}

export const useStreaks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['streaks', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          return {
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: new Date().toISOString(),
            total_days_active: 1,
            streak_milestones: [3, 7, 30]
          } as StreakData;
        }

        if (!data) {
          return {
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: new Date().toISOString(),
            total_days_active: 1,
            streak_milestones: [3, 7, 30]
          } as StreakData;
        }

        return data as StreakData;
      } catch {
        return {
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString(),
          total_days_active: 1,
          streak_milestones: [3, 7, 30]
        } as StreakData;
      }
    },
    enabled: !!user
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!user || !streakData) {
        // Silently skip for unauthenticated users
        return null;
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = new Date(streakData.last_activity_date).toISOString().split('T')[0];

      // Check if already updated today
      if (today === lastActivity) {
        return streakData;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = streakData.current_streak;
      
      // Continue streak if last activity was yesterday
      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else {
        // Reset streak if missed a day
        newStreak = 1;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streakData.longest_streak),
          last_activity_date: new Date().toISOString(),
          total_days_active: streakData.total_days_active + 1
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as StreakData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['streaks'] });

      // Celebrate milestones
      const milestones = [3, 7, 14, 30, 60, 100, 365];
      if (data?.current_streak && milestones.includes(data.current_streak)) {
        toast.success(
          `🔥 ${data.current_streak} Day Streak!`,
          {
            description: 'Keep up the amazing work!'
          }
        );
      }
    },
    onError: (error) => {
      console.error('Streak update error:', error);
    }
  });

  // Check if streak is at risk (no activity today)
  const isStreakAtRisk = (): boolean => {
    if (!streakData) return false;
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = new Date(streakData.last_activity_date).toISOString().split('T')[0];
    return today !== lastActivity && streakData.current_streak > 0;
  };

  // Get streak status message
  const getStreakMessage = (): string => {
    if (!streakData) return '';
    
    if (streakData.current_streak === 0) {
      return 'Start your streak today!';
    }

    if (isStreakAtRisk()) {
      return '⚠️ Your streak is at risk! Log in to save it.';
    }

    if (streakData.current_streak < 3) {
      return `${streakData.current_streak} day streak! Keep going!`;
    }

    if (streakData.current_streak < 7) {
      return `${streakData.current_streak} days strong! 🔥`;
    }

    return `${streakData.current_streak} day streak! You're on fire! 🔥🔥🔥`;
  };

  // Get next milestone
  const getNextMilestone = (): number | null => {
    if (!streakData) return null;
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    return milestones.find(m => m > streakData.current_streak) || null;
  };

  // Get progress to next milestone
  const getMilestoneProgress = (): number => {
    const next = getNextMilestone();
    if (!next || !streakData) return 0;
    return (streakData.current_streak / next) * 100;
  };

  return {
    streakData,
    isLoading,
    updateStreak: updateStreakMutation.mutate,
    isUpdating: updateStreakMutation.isPending,
    isStreakAtRisk: isStreakAtRisk(),
    streakMessage: getStreakMessage(),
    nextMilestone: getNextMilestone(),
    milestoneProgress: getMilestoneProgress()
  };
};
