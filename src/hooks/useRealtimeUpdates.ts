import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeEvent } from '@/types/platform';

interface UseRealtimeUpdatesOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  enabled?: boolean;
  onUpdate?: (event: RealtimeEvent) => void;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'disconnected'>('disconnected');

  const handleRealtimeEvent = useCallback((payload: any) => {
    const event: RealtimeEvent = {
      eventType: payload.eventType,
      payload: payload.new || payload.old || payload,
      timestamp: new Date().toISOString(),
      source: options.table
    };

    setLastEvent(event);
    setEventCount(prev => prev + 1);
    
    if (options.onUpdate) {
      options.onUpdate(event);
    }

    // Log event for debugging
    console.log(`[Realtime] ${options.table}:`, event);
  }, [options.onUpdate, options.table]);

  useEffect(() => {
    if (!options.enabled || !user?.id) {
      return;
    }

    let channel: RealtimeChannel;
    let healthCheckInterval: NodeJS.Timeout;

    const connectToRealtime = () => {
      try {
        channel = supabase
          .channel(`${options.table}_changes_${user.id}`)
          .on(
            'postgres_changes' as any,
            {
              event: options.event || '*',
              schema: 'public',
              table: options.table,
              filter: options.filter
            },
            handleRealtimeEvent
          )
          .subscribe((status) => {
            console.log(`[Realtime] ${options.table} subscription status:`, status);
            
            switch (status) {
              case 'SUBSCRIBED':
                setIsConnected(true);
                setConnectionHealth('healthy');
                break;
              case 'CHANNEL_ERROR':
              case 'TIMED_OUT':
                setIsConnected(false);
                setConnectionHealth('disconnected');
                // Attempt reconnection after delay
                setTimeout(connectToRealtime, 5000);
                break;
              case 'CLOSED':
                setIsConnected(false);
                setConnectionHealth('disconnected');
                break;
            }
          });

        // Health check ping every 30 seconds
        healthCheckInterval = setInterval(() => {
          if (channel.state === 'joined') {
            setConnectionHealth('healthy');
          } else {
            setConnectionHealth('degraded');
          }
        }, 30000);

      } catch (error) {
        console.error(`[Realtime] Connection error for ${options.table}:`, error);
        setConnectionHealth('disconnected');
        setIsConnected(false);
      }
    };

    connectToRealtime();

    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
        setConnectionHealth('disconnected');
      }
    };
  }, [user?.id, options.enabled, options.table, options.event, options.filter, handleRealtimeEvent]);

  return {
    isConnected,
    lastEvent,
    eventCount,
    connectionHealth,
    reconnect: useCallback(() => {
      // Force reconnection by toggling the effect dependency
      setEventCount(0);
    }, [])
  };
}

// Specialized hooks for different modules
export function useCareerPassportUpdates(userId?: string) {
  return useRealtimeUpdates({
    table: 'career_passport',
    event: 'UPDATE',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId
  });
}

export function useProfileUpdates(userId?: string) {
  return useRealtimeUpdates({
    table: 'profiles',
    event: 'UPDATE',
    filter: userId ? `id=eq.${userId}` : undefined,
    enabled: !!userId
  });
}

export function useNetworkUpdates(userId?: string) {
  return useRealtimeUpdates({
    table: 'connections',
    event: '*',
    filter: userId ? `requester_id=eq.${userId}` : undefined,
    enabled: !!userId
  });
}

export function useJobApplicationUpdates(userId?: string) {
  return useRealtimeUpdates({
    table: 'job_applications',
    event: '*',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId
  });
}

export function useResumeUpdates(userId?: string) {
  return useRealtimeUpdates({
    table: 'ai_resumes',
    event: '*',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId
  });
}

// Multi-table realtime hook for comprehensive updates
export function usePlatformRealtimeUpdates(userId?: string) {
  const careerPassport = useCareerPassportUpdates(userId);
  const profile = useProfileUpdates(userId);
  const network = useNetworkUpdates(userId);
  const jobs = useJobApplicationUpdates(userId);
  const resumes = useResumeUpdates(userId);

  const overallHealth: 'healthy' | 'degraded' | 'disconnected' = [
    careerPassport.connectionHealth,
    profile.connectionHealth,
    network.connectionHealth,
    jobs.connectionHealth,
    resumes.connectionHealth
  ].every(health => health === 'healthy') ? 'healthy' : 
    [careerPassport.connectionHealth,
     profile.connectionHealth,
     network.connectionHealth,
     jobs.connectionHealth,
     resumes.connectionHealth
    ].some(health => health === 'healthy') ? 'degraded' : 'disconnected';

  return {
    careerPassport,
    profile,
    network,
    jobs,
    resumes,
    overallHealth,
    totalEvents: careerPassport.eventCount + profile.eventCount + network.eventCount + jobs.eventCount + resumes.eventCount,
    isAnyConnected: careerPassport.isConnected || profile.isConnected || network.isConnected || jobs.isConnected || resumes.isConnected
  };
}