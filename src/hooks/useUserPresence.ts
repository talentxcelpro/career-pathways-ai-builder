import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserPresence() {
  const { user } = useAuth();
  const presenceChannelRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Set user as online when they connect
    const setOnlineStatus = async (isOnline: boolean) => {
      try {
        await supabase.rpc('update_user_presence', {
          user_uuid: user.id,
          is_online_status: isOnline
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Set up presence channel for real-time tracking
    const setupPresenceChannel = () => {
      const channel = supabase.channel('user_presence', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Presence sync:', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track user presence
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            
            // Set database status as online
            await setOnlineStatus(true);
          }
        });

      presenceChannelRef.current = channel;
    };

    // Set up heartbeat to keep presence alive
    const setupHeartbeat = () => {
      heartbeatRef.current = setInterval(async () => {
        if (presenceChannelRef.current) {
          await presenceChannelRef.current.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
        await setOnlineStatus(true);
      }, 30000); // Update every 30 seconds
    };

    // Initialize presence tracking
    setupPresenceChannel();
    setupHeartbeat();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOnlineStatus(false);
      } else {
        setOnlineStatus(true);
      }
    };

    // Handle beforeunload (user leaving)
    const handleBeforeUnload = () => {
      setOnlineStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Set user as offline
      setOnlineStatus(false);
    };
  }, [user?.id]);

  return {
    // This hook handles presence automatically
  };
}
