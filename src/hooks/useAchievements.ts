import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  points_earned: number;
  achievement_level: string;
  unlock_criteria: any;
  unlocked_at: string;
  is_featured: boolean;
  metadata: any;
  created_at: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      
      const achievementsList = data || [];
      setAchievements(achievementsList);
      
      // Calculate total points and level
      const points = achievementsList.reduce((sum, achievement) => sum + achievement.points_earned, 0);
      setTotalPoints(points);
      setLevel(Math.floor(points / 1000) + 1); // Level up every 1000 points
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockAchievement = async (achievementData: Partial<Achievement>) => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([achievementData])
        .select()
        .single();

      if (error) throw error;
      
      setAchievements(prev => [data, ...prev]);
      setTotalPoints(prev => prev + data.points_earned);
      
      toast({
        title: "🎉 Achievement Unlocked!",
        description: `${data.achievement_name} - ${data.points_earned} points earned`,
      });
      
      return data;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  };

  return {
    achievements,
    totalPoints,
    level,
    loading,
    fetchAchievements,
    unlockAchievement
  };
};