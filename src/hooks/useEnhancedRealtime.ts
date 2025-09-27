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
    userChannel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ai_career_recommendations', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setActivityFeed(prev => [{
            type: 'career_recommendation',
            data: payload.new,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ai_job_matches', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setActivityFeed(prev => [{
            type: 'job_match',
            data: payload.new,
            timestamp: new Date().toISOString()
          }, ...prev.slice(0, 19)]);
        }
      )
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
 */
export function useGlobalRealtimeStatus() {
  const [globalStatus, setGlobalStatus] = useState({
    connected: false,
    channels: 0,
    lastUpdate: null as Date | null
  });

  useEffect(() => {
    // Monitor global realtime status
    const statusChannel = supabase.channel('global-status');
    
    statusChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        setGlobalStatus(prev => ({ ...prev, lastUpdate: new Date() }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
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