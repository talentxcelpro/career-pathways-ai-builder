import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Enhanced Realtime Hook for authenticated users with presence tracking
 */
export function useEnhancedRealtime() {
  const { user } = useAuth();
  const [presenceData, setPresenceData] = useState<any>({});
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const channelRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeUserRealtime = useCallback(async () => {
    if (!user?.id) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const userChannel = supabase.channel(`user-${user.id}`, {
      config: {
        presence: { key: user.id }
      }
    });

    // Track user presence
    userChannel
      .on('presence', { event: 'sync' }, () => {
        const state = userChannel.presenceState();
        setPresenceData(state);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      });

    // Subscribe to user-specific updates
    // NOTE: ai_career_recommendations and ai_job_matches were removed from the
    // supabase_realtime publication in migration 20261114000000 — subscriptions
    // to those tables are dead and waste a connection slot. They have been removed.
    userChannel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setActivityFeed(prev => [{
            type: 'application_update',
            data: payload.new,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setActivityFeed(prev => [{
            type: 'notification',
            data: payload.new,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);
        }
      );

    userChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        // Track initial presence
        await userChannel.track({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString()
        });
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false);
      }
    });

    channelRef.current = userChannel;
  }, [user?.id]);

  useEffect(() => {
    initializeUserRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [initializeUserRealtime]);

  const updateUserActivity = useCallback(async (activity: string, metadata?: any) => {
    if (!channelRef.current || !user?.id) return;

    await channelRef.current.track({
      user_id: user.id,
      activity,
      metadata,
      last_seen: new Date().toISOString()
    });
  }, [user?.id]);

  return {
    isConnected,
    presenceData,
    activityFeed,
    updateUserActivity
  };
}

/**
 * Global Realtime Status Hook
 * NOTE: Subscribes only to 'notifications' (which is in the realtime publication).
 * 'jobs' and 'posts' were removed from supabase_realtime in migration 20261114000000
 * and must NOT be re-added here.
 */
export function useGlobalRealtimeStatus() {
  const [globalStatus, setGlobalStatus] = useState({
    connected: false,
    channels: 0,
    lastUpdate: null as Date | null
  });

  useEffect(() => {
    // Use broadcast-only channel — no postgres_changes to avoid dead subscriptions
    // on tables removed from the realtime publication
    const statusChannel = supabase.channel('global-status');

    statusChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        setGlobalStatus(prev => ({ ...prev, lastUpdate: new Date() }));
      })
      .subscribe((status) => {
        setGlobalStatus(prev => ({
          ...prev,
          connected: status === 'SUBSCRIBED'
        }));
      });

    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, []);

  return globalStatus;
}