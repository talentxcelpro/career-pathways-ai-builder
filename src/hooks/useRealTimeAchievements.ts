import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRealCareerData } from './useRealCareerData';

export interface Achievement {
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

export function useRealTimeAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { metrics, achievementTriggers } = useRealCareerData();
  
  // Track which achievements have been processed to prevent duplicates
  const processedAchievements = React.useRef(new Set<string>());

  const awardAchievement = useMutation({
    mutationFn: async (achievementData: {
      type: string;
      title: string;
      description: string;
      points: number;
      verified?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create a unique key for this achievement
      const achievementKey = `${user.id}-${achievementData.title}`;
      
      // Check if we've already processed this achievement in this session
      if (processedAchievements.current.has(achievementKey)) {
        throw new Error('Achievement already processed');
      }

      // Check if achievement already exists in database
      const { data: existing } = await supabase
        .from('career_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_title', achievementData.title)
        .single();

      if (existing) {
        processedAchievements.current.add(achievementKey);
        throw new Error('Achievement already exists');
      }

      // Award new achievement
      const { data, error } = await supabase
        .from('career_achievements')
        .insert({
          user_id: user.id,
          achievement_type: achievementData.type,
          achievement_title: achievementData.title,
          achievement_description: achievementData.description,
          points_awarded: achievementData.points,
          verified: achievementData.verified || false,
          is_public: true,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Mark this achievement as processed
      processedAchievements.current.add(achievementKey);
      
      // Update user's total points
      await updateUserPoints(achievementData.points);
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Only show notification if this is a new achievement (not already processed)
      if (data && !processedAchievements.current.has(`${user?.id}-${variables.title}-notified`)) {
        // Mark notification as shown
        processedAchievements.current.add(`${user?.id}-${variables.title}-notified`);
        
        // Show achievement notification
        toast.success(`🏆 Achievement Unlocked: ${variables.title}!`, {
          description: `You earned ${variables.points} points!`,
          duration: 5000
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['career-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['userScores'] });
      queryClient.invalidateQueries({ queryKey: ['real-career-metrics'] });
    },
    onError: (error) => {
      // Don't show error for duplicate achievements
      if (!error.message.includes('already')) {
        console.error('Achievement error:', error);
      }
    }
  });

  const updateUserPoints = async (points: number) => {
    if (!user?.id) return;

    try {
      // Get current user scores
      const { data: currentScores } = await supabase
        .from('user_scores')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      const newTotal = (currentScores?.total_points || 0) + points;

      // Update or create user scores record
      await supabase
        .from('user_scores')
        .upsert({
          user_id: user.id,
          total_points: newTotal,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user points:', error);
    }
  };

  const checkAndAwardAchievements = useMutation({
    mutationFn: async () => {
      if (!achievementTriggers || !user?.id) return [];

      const newAchievements = [];

      // Get existing achievements to prevent duplicates
      const { data: existingAchievements = [] } = await supabase
        .from('career_achievements')
        .select('achievement_title')
        .eq('user_id', user.id);

      const existingTitles = new Set(existingAchievements.map(a => a.achievement_title));

      for (const trigger of achievementTriggers) {
        // Only process if achievement is earned, requirement met, and doesn't already exist
        if (trigger.earned && 
            trigger.progress >= trigger.requirement && 
            !existingTitles.has(trigger.title)) {
          try {
            const achievement = await awardAchievement.mutateAsync({
              type: trigger.type,
              title: trigger.title,
              description: trigger.description,
              points: trigger.points,
              verified: true
            });
            newAchievements.push(achievement);
            existingTitles.add(trigger.title); // Prevent multiple awards in same batch
          } catch (error) {
            // Achievement might already exist, which is fine
            console.log(`Achievement ${trigger.title} already exists or failed to create`);
          }
        }
      }

      return newAchievements;
    }
  });

  // Auto-check achievements when metrics change
  const triggerAchievementCheck = () => {
    if (metrics && achievementTriggers) {
      checkAndAwardAchievements.mutate();
    }
  };

  return {
    awardAchievement,
    checkAndAwardAchievements,
    triggerAchievementCheck,
    isAwarding: awardAchievement.isPending || checkAndAwardAchievements.isPending
  };
}