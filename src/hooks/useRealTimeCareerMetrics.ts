import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { websocketManager } from '@/utils/websocketManager';

interface RealTimeCareerMetrics {
  jobApplications: number;
  connections: number;
  postsCreated: number;
  achievementsEarned: number;
  totalTXCEarned: number;
  profileCompletion: number;
  lastUpdated: string;
}

export function useRealTimeCareerMetrics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<RealTimeCareerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial metrics
  useEffect(() => {
    if (!user?.id) return;

    const fetchMetrics = async () => {
      try {
        const [
          jobAppsResponse,
          connectionsResponse,
          postsResponse,
          achievementsResponse,
          txcResponse,
          profileResponse
        ] = await Promise.all([
          supabase.from('job_applications').select('id').eq('user_id', user.id),
          supabase.from('connections').select('id').or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('status', 'accepted'),
          supabase.from('posts').select('id').eq('user_id', user.id),
          supabase.from('career_achievements').select('id').eq('user_id', user.id),
          supabase.from('user_txc_balances').select('total_earned').eq('user_id', user.id).maybeSingle(),
          supabase.from('profiles').select('full_name, headline, location, profile_picture_url, skills').eq('id', user.id).maybeSingle()
        ]);

        // Calculate profile completion
        let profileCompletion = 0;
        if (profileResponse.data) {
          if (profileResponse.data.full_name) profileCompletion += 20;
          if (profileResponse.data.headline) profileCompletion += 20;
          if (profileResponse.data.location) profileCompletion += 20;
          if (profileResponse.data.profile_picture_url) profileCompletion += 20;
          if (profileResponse.data.skills && profileResponse.data.skills.length > 0) profileCompletion += 20;
        }

        setMetrics({
          jobApplications: jobAppsResponse.data?.length || 0,
          connections: connectionsResponse.data?.length || 0,
          postsCreated: postsResponse.data?.length || 0,
          achievementsEarned: achievementsResponse.data?.length || 0,
          totalTXCEarned: txcResponse.data?.total_earned || 0,
          profileCompletion,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching career metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const refreshMetrics = () => {
      // Trigger metrics refresh
      queryClient.invalidateQueries({ queryKey: ['career-metrics', user.id] });
      // Also refetch our local metrics
      if (metrics) {
        setMetrics(prev => prev ? { ...prev, lastUpdated: new Date().toISOString() } : null);
      }
    };

    // Create channels for different data sources
    const jobAppsChannel = websocketManager.createChannel(`job_applications_${user.id}`);
    const connectionsChannel = websocketManager.createChannel(`connections_${user.id}`);
    const postsChannel = websocketManager.createChannel(`posts_${user.id}`);
    const achievementsChannel = websocketManager.createChannel(`achievements_${user.id}`);
    const txcChannel = websocketManager.createChannel(`txc_balances_${user.id}`);
    const profileChannel = websocketManager.createChannel(`profile_${user.id}`);

    // Subscribe to job applications changes
    jobAppsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_applications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Job applications changed:', payload);
        refreshMetrics();
      })
      .subscribe();

    // Subscribe to connections changes
    connectionsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connections'
      }, (payload) => {
        // Filter for connections involving this user
        const data = payload.new || payload.old;
        if (data && ((data as any).requester_id === user.id || (data as any).recipient_id === user.id)) {
          console.log('Connections changed:', payload);
          refreshMetrics();
        }
      })
      .subscribe();

    // Subscribe to posts changes
    postsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Posts changed:', payload);
        refreshMetrics();
      })
      .subscribe();

    // Subscribe to achievements changes
    achievementsChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'career_achievements',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Achievements changed:', payload);
        refreshMetrics();
      })
      .subscribe();

    // Subscribe to TXC balance changes
    txcChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_txc_balances',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('TXC balance changed:', payload);
        refreshMetrics();
      })
      .subscribe();

    // Subscribe to profile changes
    profileChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log('Profile changed:', payload);
        refreshMetrics();
      })
      .subscribe();

    return () => {
      websocketManager.removeChannel(`job_applications_${user.id}`);
      websocketManager.removeChannel(`connections_${user.id}`);
      websocketManager.removeChannel(`posts_${user.id}`);
      websocketManager.removeChannel(`achievements_${user.id}`);
      websocketManager.removeChannel(`txc_balances_${user.id}`);
      websocketManager.removeChannel(`profile_${user.id}`);
    };
  }, [user?.id, queryClient, metrics]);

  return {
    metrics,
    isLoading,
    lastUpdated: metrics?.lastUpdated
  };
}