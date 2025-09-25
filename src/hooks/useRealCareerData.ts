import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerMetrics {
  profileCompletion: number;
  jobApplications: number;
  connections: number;
  skillsAdded: number;
  coursesCompleted: number;
  postsCreated: number;
  achievementsEarned: number;
  totalTXCEarned: number;
  loginStreak: number;
  applicationStreak: number;
  lastActivityDate: string;
}

export interface AchievementTrigger {
  id: string;
  type: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  points: number;
  earned: boolean;
}

export function useRealCareerData() {
  const { user } = useAuth();

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['real-career-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            full_name,
            title,
            about,
            profile_picture_url,
            linkedin_url,
            location,
            skills
          `)
          .eq('id', user.id)
          .single();

        // Calculate profile completion
        let profileCompletion = 0;
        if (profile) {
          const fields = [
            profile.full_name,
            profile.title,
            profile.about,
            profile.profile_picture_url,
            profile.linkedin_url,
            profile.location
          ];
          profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);
        }

        // Get user scores and achievements
        const { data: userScores } = await supabase
          .from('user_scores')
          .select('total_points')
          .eq('user_id', user.id)
          .single();

        // Get achievements
        const { data: achievements } = await supabase
          .from('career_achievements')
          .select('*')
          .eq('user_id', user.id);

        // Get token balance
        const { data: tokenBalance } = await supabase
          .from('token_balances')
          .select('lifetime_earned')
          .eq('user_id', user.id)
          .single();

        // Get user streaks
        const { data: streaks } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Mock some data for now (can be replaced with real queries)
        const metrics: CareerMetrics = {
          profileCompletion,
          jobApplications: Math.floor(Math.random() * 20) + 1,
          connections: Math.floor(Math.random() * 50) + 5,
          skillsAdded: (profile?.skills?.length || 0),
          coursesCompleted: Math.floor(Math.random() * 10),
          postsCreated: Math.floor(Math.random() * 15),
          achievementsEarned: achievements?.length || 0,
          totalTXCEarned: tokenBalance?.lifetime_earned || 0,
          loginStreak: streaks?.current_login_streak || 0,
          applicationStreak: streaks?.current_application_streak || 0,
          lastActivityDate: new Date().toISOString()
        };

        return metrics;
      } catch (error) {
        console.error('Error fetching career metrics:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 30000,
    refetchInterval: 60000
  });

  // Calculate achievement triggers based on metrics
  const achievementTriggers: AchievementTrigger[] = [
    {
      id: 'profile_complete',
      type: 'profile',
      title: 'Profile Complete',
      description: 'Complete your profile information',
      requirement: 100,
      progress: metrics?.profileCompletion || 0,
      points: 500,
      earned: (metrics?.profileCompletion || 0) >= 100
    },
    {
      id: 'first_connection',
      type: 'networking',
      title: 'First Connection',
      description: 'Make your first professional connection',
      requirement: 1,
      progress: metrics?.connections || 0,
      points: 200,
      earned: (metrics?.connections || 0) >= 1
    },
    {
      id: 'network_builder',
      type: 'networking',
      title: 'Network Builder',
      description: 'Connect with 10 professionals',
      requirement: 10,
      progress: metrics?.connections || 0,
      points: 1000,
      earned: (metrics?.connections || 0) >= 10
    },
    {
      id: 'job_hunter',
      type: 'applications',
      title: 'Job Hunter',
      description: 'Apply to your first job',
      requirement: 1,
      progress: metrics?.jobApplications || 0,
      points: 300,
      earned: (metrics?.jobApplications || 0) >= 1
    },
    {
      id: 'application_streak_5',
      type: 'streaks',
      title: 'Application Streak',
      description: 'Maintain a 5-day application streak',
      requirement: 5,
      progress: metrics?.applicationStreak || 0,
      points: 750,
      earned: (metrics?.applicationStreak || 0) >= 5
    },
    {
      id: 'login_streak_7',
      type: 'streaks',
      title: 'Week Warrior',
      description: 'Maintain a 7-day login streak',
      requirement: 7,
      progress: metrics?.loginStreak || 0,
      points: 600,
      earned: (metrics?.loginStreak || 0) >= 7
    },
    {
      id: 'skill_master',
      type: 'skills',
      title: 'Skill Master',
      description: 'Add 5 skills to your profile',
      requirement: 5,
      progress: metrics?.skillsAdded || 0,
      points: 400,
      earned: (metrics?.skillsAdded || 0) >= 5
    },
    {
      id: 'content_creator',
      type: 'content',
      title: 'Content Creator',
      description: 'Create your first post',
      requirement: 1,
      progress: metrics?.postsCreated || 0,
      points: 350,
      earned: (metrics?.postsCreated || 0) >= 1
    },
    {
      id: 'course_graduate',
      type: 'learning',
      title: 'Course Graduate',
      description: 'Complete your first course',
      requirement: 1,
      progress: metrics?.coursesCompleted || 0,
      points: 800,
      earned: (metrics?.coursesCompleted || 0) >= 1
    },
    {
      id: 'txc_collector',
      type: 'tokens',
      title: 'TXC Collector',
      description: 'Earn your first 1000 TXC tokens',
      requirement: 1000,
      progress: metrics?.totalTXCEarned || 0,
      points: 1500,
      earned: (metrics?.totalTXCEarned || 0) >= 1000
    }
  ];

  return {
    metrics,
    achievementTriggers,
    isLoading,
    error,
    refreshMetrics: refetch
  };
}