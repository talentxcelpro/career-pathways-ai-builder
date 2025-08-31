import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

export interface UserScore {
  user_id: string;
  total_points: number;
  level: number;
  achievements_count: number;
  profile_completion: number;
}

export interface GamificationStats {
  profileCompletion: number;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  nextLevelPoints: number;
  currentLevelPoints: number;
  streaks: {
    learning: number;
    applications: number;
    profile_updates: number;
  };
}

export const useGamification = () => {
  const queryClient = useQueryClient();

  // Fetch user scores and achievements
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch user scores
      const { data: userScore } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      // Calculate level progression
      const totalPoints = userScore?.total_points || 0;
      const level = Math.floor(totalPoints / 1000) + 1;
      const currentLevelPoints = totalPoints % 1000;
      const nextLevelPoints = 1000;

      // Fetch profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const profileCompletion = calculateProfileCompletion(profile);

      // Mock streaks for now - would be calculated from user activity
      const streaks = {
        learning: 3,
        applications: 7,
        profile_updates: 1
      };

      return {
        profileCompletion,
        totalPoints,
        level,
        achievements: achievements || [],
        nextLevelPoints,
        currentLevelPoints,
        streaks
      } as GamificationStats;
    },
    retry: 1
  });

  // Award achievement mutation
  const awardAchievementMutation = useMutation({
    mutationFn: async ({ type, title, description, points }: {
      type: string;
      title: string;
      description: string;
      points: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if achievement already exists
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_type', type)
        .single();

      if (existing) {
        throw new Error('Achievement already earned');
      }

      // Award achievement
      const { data: achievement, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          achievement_type: type,
          achievement_title: title,
          achievement_description: description,
          points_awarded: points,
          verified: true,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      // Update user score
      const { error: scoreError } = await supabase.rpc('update_user_points', {
        user_uuid: user.id,
        points_to_add: points
      });

      if (scoreError) console.error('Error updating points:', scoreError);

      return achievement;
    },
    onSuccess: (achievement) => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
    onError: (error: any) => {
      if (!error.message.includes('already earned')) {
        toast.error('Failed to award achievement');
      }
    }
  });

  // Update profile completion
  const updateProfileCompletion = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const completion = calculateProfileCompletion(profile);

    // Award completion milestones
    if (completion >= 100 && stats?.profileCompletion < 100) {
      awardAchievementMutation.mutate({
        type: 'profile_complete',
        title: 'Profile Master',
        description: 'Completed 100% of profile information',
        points: 500
      });
    } else if (completion >= 75 && stats?.profileCompletion < 75) {
      awardAchievementMutation.mutate({
        type: 'profile_75',
        title: 'Profile Builder',
        description: 'Completed 75% of profile information',
        points: 200
      });
    } else if (completion >= 50 && stats?.profileCompletion < 50) {
      awardAchievementMutation.mutate({
        type: 'profile_50',
        title: 'Getting Started',
        description: 'Completed 50% of profile information',
        points: 100
      });
    }
  };

  return {
    stats,
    isLoading,
    error,
    awardAchievement: awardAchievementMutation.mutate,
    updateProfileCompletion,
    isAwarding: awardAchievementMutation.isPending
  };
};

// Helper function to calculate profile completion
const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;

  const fields = [
    'full_name',
    'headline',
    'about',
    'location',
    'profile_photo_url',
    'cover_photo_url',
    'linkedin_url',
    'phone',
    'website'
  ];

  const completedFields = fields.filter(field => 
    profile[field] && 
    (typeof profile[field] === 'string' ? profile[field].trim() !== '' : true)
  ).length;

  return Math.round((completedFields / fields.length) * 100);
};