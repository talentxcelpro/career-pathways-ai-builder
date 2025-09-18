import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string | null;
  txc_reward: number;
  earned_at: string;
  metadata: any;
}

export interface AchievementDefinition {
  id: string;
  achievement_type: string;
  name: string;
  description: string;
  icon: string;
  txc_reward: number;
  requirement_count: number;
  is_active: boolean;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_login_streak: number;
  longest_login_streak: number;
  current_application_streak: number;
  longest_application_streak: number;
  last_login_date: string | null;
  last_application_date: string | null;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  leaderboard_type: string;
  score: number;
  rank: number | null;
  period_start: string;
  period_end: string;
  metadata: any;
  created_at: string;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<AchievementDefinition[]>([]);
  const [userStreaks, setUserStreaks] = useState<UserStreak | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's achievements
  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch available achievements
  const fetchAvailableAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('txc_reward', { ascending: false });

      if (error) throw error;
      setAvailableAchievements(data || []);
    } catch (error) {
      console.error('Error fetching available achievements:', error);
    }
  };

  // Fetch user streaks
  const fetchUserStreaks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserStreaks(data);
    } catch (error) {
      console.error('Error fetching user streaks:', error);
    }
  };

  // Fetch leaderboards
  const fetchLeaderboards = async (type: string = 'txc_earned') => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('leaderboard_type', type)
        .gte('period_end', new Date().toISOString())
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;
      setLeaderboards(data || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  // Check and award achievements
  const checkAchievements = async (activityType: string, count: number = 1) => {
    if (!user) return;

    try {
      // Update streaks first
      await supabase.rpc('update_user_streaks', {
        p_user_id: user.id,
        p_activity_type: activityType
      });

      // Check for achievements to award
      const achievementsToCheck = {
        'login': ['login_streak_7', 'login_streak_30'],
        'application': ['first_job_application', 'application_streak_5'],
        'profile_complete': ['profile_complete'],
        'resume_created': ['resume_created'],
        'connection_made': ['connections_10', 'connections_50'],
        'txc_earned': ['txc_earner_1000', 'txc_earner_10000']
      };

      const relevantAchievements = achievementsToCheck[activityType as keyof typeof achievementsToCheck] || [];

      for (const achievementType of relevantAchievements) {
        await supabase.rpc('award_achievement', {
          p_user_id: user.id,
          p_achievement_type: achievementType,
          p_metadata: { activity_type: activityType, count }
        });
      }

      // Refresh data
      await Promise.all([
        fetchAchievements(),
        fetchUserStreaks()
      ]);

    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Calculate completion percentage for achievements
  const getAchievementProgress = (achievementType: string): number => {
    const earned = achievements.find(a => a.achievement_type === achievementType);
    if (earned) return 100;

    const definition = availableAchievements.find(a => a.achievement_type === achievementType);
    if (!definition) return 0;

    // Calculate progress based on current stats
    switch (achievementType) {
      case 'login_streak_7':
        return Math.min((userStreaks?.current_login_streak || 0) / 7 * 100, 100);
      case 'login_streak_30':
        return Math.min((userStreaks?.current_login_streak || 0) / 30 * 100, 100);
      case 'application_streak_5':
        return Math.min((userStreaks?.current_application_streak || 0) / 5 * 100, 100);
      default:
        return 0;
    }
  };

  // Get recent achievements (last 5)
  const getRecentAchievements = (): Achievement[] => {
    return achievements.slice(0, 5);
  };

  // Get total TXC earned from achievements
  const getTotalTXCFromAchievements = (): number => {
    return achievements.reduce((total, achievement) => total + achievement.txc_reward, 0);
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchAchievements(),
        fetchAvailableAchievements(),
        fetchUserStreaks(),
        fetchLeaderboards()
      ]);
    }
  }, [user]);

  return {
    achievements,
    availableAchievements,
    userStreaks,
    leaderboards,
    isLoading,
    fetchAchievements,
    fetchAvailableAchievements,
    fetchUserStreaks,
    fetchLeaderboards,
    checkAchievements,
    getAchievementProgress,
    getRecentAchievements,
    getTotalTXCFromAchievements,
    stats: {
      totalAchievements: achievements.length,
      totalTXC: getTotalTXCFromAchievements(),
      currentStreak: userStreaks?.current_login_streak || 0,
      profileCompletion: 75
    },
    updateProfileCompletion: async () => {
      await fetchAchievements();
    },
    refreshAchievements: fetchAchievements,
    refreshStreaks: fetchUserStreaks,
    refreshLeaderboards: fetchLeaderboards,
    updateStreak: checkAchievements
  };
};