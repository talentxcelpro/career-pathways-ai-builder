import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RealAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

export interface AchievementSummary {
  totalEarned: number;
  totalPoints: number;
  completionRate: number;
  recentAchievements: RealAchievement[];
  achievementsByCategory: Record<string, RealAchievement[]>;
}

export function useRealAchievements() {
  const { user } = useAuth();

  const { data: userAchievements, isLoading, error } = useQuery({
    queryKey: ['real-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RealAchievement[];
    },
    enabled: !!user?.id
  });

  // Get all unique achievement types for completion calculation
  const { data: allAchievementTypes } = useQuery({
    queryKey: ['achievement-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_achievements')
        .select('achievement_type, achievement_title, achievement_description, points_awarded')
        .limit(1000);

      if (error) throw error;

      // Get unique achievement types
      const uniqueTypes = new Map();
      data?.forEach(ach => {
        if (!uniqueTypes.has(ach.achievement_type)) {
          uniqueTypes.set(ach.achievement_type, {
            type: ach.achievement_type,
            title: ach.achievement_title,
            description: ach.achievement_description,
            points: ach.points_awarded
          });
        }
      });

      return Array.from(uniqueTypes.values());
    }
  });

  const summary: AchievementSummary = {
    totalEarned: userAchievements?.length || 0,
    totalPoints: userAchievements?.reduce((sum, ach) => sum + ach.points_awarded, 0) || 0,
    completionRate: allAchievementTypes?.length > 0 
      ? Math.round(((userAchievements?.length || 0) / allAchievementTypes.length) * 100) 
      : 0,
    recentAchievements: userAchievements?.slice(0, 5) || [],
    achievementsByCategory: userAchievements?.reduce((acc, ach) => {
      const category = ach.achievement_type.includes('social') ? 'social' : 
                     ach.achievement_type.includes('career') ? 'career' : 
                     ach.achievement_type.includes('skill') ? 'career' : 'engagement';
      if (!acc[category]) acc[category] = [];
      acc[category].push(ach);
      return acc;
    }, {} as Record<string, RealAchievement[]>) || {}
  };

  return {
    userAchievements: userAchievements || [],
    allAchievementTypes: allAchievementTypes || [],
    summary,
    isLoading,
    error
  };
}