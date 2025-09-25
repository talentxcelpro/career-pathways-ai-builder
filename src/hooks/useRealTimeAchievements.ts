import { useEffect, useState, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { websocketManager } from '@/utils/websocketManager';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

interface AchievementProgress {
  type: string;
  title: string;
  description: string;
  current: number;
  target: number;
  progress: number;
  isCompleted: boolean;
}

export function useRealTimeAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progressAchievements, setProgressAchievements] = useState<AchievementProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwarding, setIsAwarding] = useState(false);

  // Achievement trigger function
  const triggerAchievementCheck = useCallback(async () => {
    if (!user?.id) return;

    setIsAwarding(true);
    try {
      // Call the backend to check and award achievements
      const { data, error } = await supabase.rpc('check_and_award_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking achievements:', error);
      } else {
        console.log('Achievement check completed:', data);
        // Refresh achievements list
        queryClient.invalidateQueries({ queryKey: ['career-achievements', user.id] });
      }
    } catch (error) {
      console.error('Error triggering achievement check:', error);
    } finally {
      setIsAwarding(false);
    }
  }, [user?.id, queryClient]);

  // Award achievement mutation
  const awardAchievement = useMutation({
    mutationFn: async ({ type, title, description, points, verified = false }: {
      type: string;
      title: string;
      description: string;
      points: number;
      verified?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('career_achievements')
        .insert({
          user_id: user.id,
          achievement_type: type,
          achievement_title: title,
          achievement_description: description,
          points_awarded: points,
          verified,
          earned_at: new Date().toISOString(),
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newAchievement) => {
      setAchievements(prev => [newAchievement, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['career-achievements', user.id] });
    }
  });

  // Fetch initial achievements
  useEffect(() => {
    if (!user?.id) return;

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('career_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [user?.id]);

  // Calculate progress achievements based on current metrics
  useEffect(() => {
    if (!user?.id) return;

    const calculateProgress = async () => {
      try {
        // Fetch current metrics for progress calculation
        const [
          jobAppsResponse,
          connectionsResponse,
          postsResponse,
          profileResponse
        ] = await Promise.all([
          supabase.from('job_applications').select('id').eq('user_id', user.id),
          supabase.from('connections').select('id').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('status', 'accepted'),
          supabase.from('posts').select('id').eq('user_id', user.id),
          supabase.from('profiles').select('full_name, headline, location, profile_picture_url, skills').eq('id', user.id).maybeSingle()
        ]);

        const jobAppsCount = jobAppsResponse.data?.length || 0;
        const connectionsCount = connectionsResponse.data?.length || 0;
        const postsCount = postsResponse.data?.length || 0;

        // Calculate profile completion
        let profileCompletion = 0;
        if (profileResponse.data) {
          if (profileResponse.data.full_name) profileCompletion += 20;
          if (profileResponse.data.headline) profileCompletion += 20;
          if (profileResponse.data.location) profileCompletion += 20;
          if (profileResponse.data.profile_picture_url) profileCompletion += 20;
          if (profileResponse.data.skills && profileResponse.data.skills.length > 0) profileCompletion += 20;
        }

        const progressList: AchievementProgress[] = [
          {
            type: 'profile_completion',
            title: 'Complete Your Profile',
            description: 'Fill out all profile sections',
            current: profileCompletion,
            target: 100,
            progress: profileCompletion,
            isCompleted: profileCompletion >= 100
          },
          {
            type: 'first_application',
            title: 'First Job Application',
            description: 'Apply to your first job',
            current: jobAppsCount,
            target: 1,
            progress: Math.min((jobAppsCount / 1) * 100, 100),
            isCompleted: jobAppsCount >= 1
          },
          {
            type: 'active_applicant',
            title: 'Active Job Seeker',
            description: 'Apply to 5 jobs',
            current: jobAppsCount,
            target: 5,
            progress: Math.min((jobAppsCount / 5) * 100, 100),
            isCompleted: jobAppsCount >= 5
          },
          {
            type: 'network_builder',
            title: 'Network Builder',
            description: 'Connect with 10 professionals',
            current: connectionsCount,
            target: 10,
            progress: Math.min((connectionsCount / 10) * 100, 100),
            isCompleted: connectionsCount >= 10
          },
          {
            type: 'content_creator',
            title: 'Content Creator',
            description: 'Create your first post',
            current: postsCount,
            target: 1,
            progress: Math.min((postsCount / 1) * 100, 100),
            isCompleted: postsCount >= 1
          },
          {
            type: 'active_networker',
            title: 'Active Networker',
            description: 'Build a network of 25 connections',
            current: connectionsCount,
            target: 25,
            progress: Math.min((connectionsCount / 25) * 100, 100),
            isCompleted: connectionsCount >= 25
          }
        ];

        setProgressAchievements(progressList);
      } catch (error) {
        console.error('Error calculating progress achievements:', error);
      }
    };

    calculateProgress();
  }, [user?.id, achievements]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const refreshAchievements = () => {
      queryClient.invalidateQueries({ queryKey: ['career-achievements', user.id] });
    };

    // Create channel for achievements
    const achievementsChannel = websocketManager.createChannel(`real_time_achievements_${user.id}`);

    // Subscribe to achievements changes
    achievementsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'career_achievements',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Real-time achievement update:', payload);
        
        if (payload.eventType === 'INSERT') {
          // Add new achievement to the list
          const newAchievement = payload.new as Achievement;
          setAchievements(prev => [newAchievement, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          // Update existing achievement
          const updatedAchievement = payload.new as Achievement;
          setAchievements(prev => 
            prev.map(achievement => 
              achievement.id === updatedAchievement.id ? updatedAchievement : achievement
            )
          );
        } else if (payload.eventType === 'DELETE') {
          // Remove achievement
          const deletedAchievement = payload.old as Achievement;
          setAchievements(prev => 
            prev.filter(achievement => achievement.id !== deletedAchievement.id)
          );
        }

        refreshAchievements();
      })
      .subscribe();

    // Also listen for changes that might trigger new achievements
    const metricsChannel = websocketManager.createChannel(`achievement_triggers_${user.id}`);

    // Subscribe to related table changes that might trigger achievements
    ['job_applications', 'connections', 'posts', 'profiles'].forEach(table => {
      metricsChannel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table
        }, (payload) => {
          // Check if this change affects the current user
          const data = payload.new || payload.old;
          const isUserRelated = 
            (table === 'profiles' && (data as any)?.id === user.id) ||
            (table === 'job_applications' && (data as any)?.user_id === user.id) ||
            (table === 'posts' && (data as any)?.user_id === user.id) ||
            (table === 'connections' && ((data as any)?.requester_id === user.id || (data as any)?.recipient_id === user.id));

          if (isUserRelated) {
            console.log(`${table} changed for user, checking achievements:`, payload);
            // Refresh progress calculations
            setTimeout(() => {
              setProgressAchievements(prev => [...prev]); // Trigger recalculation
            }, 1000); // Small delay to ensure data is synced
          }
        })
        .subscribe();
    });

    return () => {
      websocketManager.removeChannel(`real_time_achievements_${user.id}`);
      websocketManager.removeChannel(`achievement_triggers_${user.id}`);
    };
  }, [user?.id, queryClient]);

  return {
    achievements,
    progressAchievements,
    isLoading,
    isAwarding,
    triggerAchievementCheck,
    awardAchievement,
    totalPoints: achievements.reduce((sum, achievement) => sum + achievement.points_awarded, 0),
    completedCount: achievements.length,
    pendingCount: progressAchievements.filter(p => !p.isCompleted).length
  };
}