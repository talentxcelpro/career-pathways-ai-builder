import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProgression {
  id: string;
  user_id: string;
  current_level: number;
  total_xp: number;
  tools_completed: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  unlock_tier: number;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  points: number;
  unlock_criteria: any;
  unlocked_at: string;
  created_at: string;
}

export const useUserProgression = () => {
  const { user } = useAuth();
  const [progression, setProgression] = useState<UserProgression | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgression = async () => {
    if (!user?.id) return;
    
    try {
      // Get or create user progression
      let { data: progressionData, error } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create initial progression record
        const { data: newProgression, error: insertError } = await supabase
          .from('user_progression')
          .insert({
            user_id: user.id,
            current_level: 1,
            total_xp: 0,
            tools_completed: 0,
            current_streak: 0,
            longest_streak: 0,
            unlock_tier: 1
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        progressionData = newProgression;
      } else if (error) {
        throw error;
      }
      
      setProgression(progressionData);
    } catch (error) {
      console.error('Error fetching user progression:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const updateProgression = async (updates: Partial<UserProgression>) => {
    if (!user?.id || !progression) return;
    
    try {
      const { data, error } = await supabase
        .from('user_progression')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      setProgression(data);
      
      // Check for new achievements
      await checkForNewAchievements(data);
    } catch (error) {
      console.error('Error updating progression:', error);
    }
  };

  const addXP = async (xp: number, reason: string) => {
    if (!progression) return;
    
    const newXP = progression.total_xp + xp;
    await updateProgression({ total_xp: newXP });
    
    // Optionally unlock achievement for XP milestones
    if (newXP >= 1000 && progression.total_xp < 1000) {
      await unlockAchievement({
        achievement_type: 'xp_milestone',
        achievement_name: 'XP Master',
        description: 'Earned 1000 XP points',
        points: 100
      });
    }
  };

  const completeToolActivity = async (toolId: string) => {
    if (!progression) return;
    
    const newCompletedCount = progression.tools_completed + 1;
    const xpGain = 50; // Base XP for completing a tool
    
    await updateProgression({
      tools_completed: newCompletedCount,
      total_xp: progression.total_xp + xpGain,
      last_activity_date: new Date().toISOString().split('T')[0]
    });
  };

  const updateStreak = async () => {
    if (!progression) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progression.last_activity_date;
    
    let newStreak = progression.current_streak;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActivity === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else {
        // Reset streak
        newStreak = 1;
      }
      
      const longestStreak = Math.max(progression.longest_streak, newStreak);
      
      await updateProgression({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today
      });
    }
  };

  const unlockAchievement = async (achievementData: Partial<Achievement>) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          ...achievementData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local achievements
      setAchievements(prev => [data, ...prev]);
      
      // Add XP for the achievement
      if (achievementData.points && progression) {
        await addXP(achievementData.points, `Achievement: ${achievementData.achievement_name}`);
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const checkForNewAchievements = async (currentProgression: UserProgression) => {
    // Check for level-based achievements
    if (currentProgression.current_level >= 5) {
      const hasLevelAchievement = achievements.some(a => a.achievement_type === 'level_5');
      if (!hasLevelAchievement) {
        await unlockAchievement({
          achievement_type: 'level_5',
          achievement_name: 'Level Up Champion',
          description: 'Reached level 5',
          points: 200
        });
      }
    }
    
    // Check for tool completion achievements
    if (currentProgression.tools_completed >= 10) {
      const hasToolAchievement = achievements.some(a => a.achievement_type === 'tools_10');
      if (!hasToolAchievement) {
        await unlockAchievement({
          achievement_type: 'tools_10',
          achievement_name: 'Tool Master',
          description: 'Completed 10 tools',
          points: 150
        });
      }
    }
    
    // Check for streak achievements
    if (currentProgression.current_streak >= 7) {
      const hasStreakAchievement = achievements.some(a => a.achievement_type === 'streak_7');
      if (!hasStreakAchievement) {
        await unlockAchievement({
          achievement_type: 'streak_7',
          achievement_name: 'Week Warrior',
          description: 'Maintained a 7-day streak',
          points: 100
        });
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([fetchProgression(), fetchAchievements()])
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return {
    progression,
    achievements,
    loading,
    addXP,
    completeToolActivity,
    updateStreak,
    unlockAchievement,
    updateProgression
  };
};