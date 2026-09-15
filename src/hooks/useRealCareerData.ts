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

        // Get all real data in parallel
        const [
          userScoresResponse,
          achievementsResponse,
          txcBalanceResponse,
          jobApplicationsResponse,
          connectionsResponse,
          postsResponse,
          courseCompletionsResponse,
          loginStreakResponse
        ] = await Promise.all([
          supabase
            .from('user_scores')
            .select('total_points')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('career_achievements')
            .select('*')
            .eq('user_id', user.id),
          supabase
            .from('user_txc_balances')
            .select('total_earned')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('job_applications')
            .select('id')
            .eq('user_id', user.id),
          supabase
            .from('connections')
            .select('id')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .eq('status', 'accepted'),
          supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id),
          supabase
            .from('career_passport')
            .select('tests_completed_count')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('txc_transactions')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('activity_type', 'daily_login')
            .order('created_at', { ascending: false })
            .limit(30)
        ]);

        // Calculate login streak from transaction data
        const calculateLoginStreak = (transactions: any[]) => {
          if (!transactions || transactions.length === 0) return 0;
          
          const today = new Date();
          let streak = 0;
          let currentDate = new Date(today);
          
          for (let i = 0; i < 30; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasLoginForDate = transactions.some(t => 
              t.created_at.split('T')[0] === dateStr
            );
            
            if (hasLoginForDate) {
              streak++;
            } else if (i > 0) {
              break; // Break streak if no login found (except for today)
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
          }
          
          return streak;
        };

        // Calculate application streak from job applications
        const calculateApplicationStreak = (applications: any[]) => {
          if (!applications || applications.length === 0) return 0;
          
          const today = new Date();
          let streak = 0;
          let currentDate = new Date(today);
          
          for (let i = 0; i < 30; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasApplicationForDate = applications.some(app => 
              app.applied_at && app.applied_at.split('T')[0] === dateStr
            );
            
            if (hasApplicationForDate) {
              streak++;
            } else if (i > 0) {
              break; // Break streak if no application found
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
          }
          
          return streak;
        };

        // Get application data with dates for streak calculation
        const { data: applicationDates } = await supabase
          .from('job_applications')
          .select('applied_at')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(30);

        const metrics: CareerMetrics = {
          profileCompletion,
          jobApplications: jobApplicationsResponse.data?.length || 0,
          connections: connectionsResponse.data?.length || 0,
          skillsAdded: (profile?.skills?.length || 0),
          coursesCompleted: courseCompletionsResponse.data?.tests_completed_count || 0,
          postsCreated: postsResponse.data?.length || 0,
          achievementsEarned: achievementsResponse.data?.length || 0,
          totalTXCEarned: txcBalanceResponse.data?.total_earned || 0,
          loginStreak: calculateLoginStreak(loginStreakResponse.data || []),
          applicationStreak: calculateApplicationStreak(applicationDates || []),
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