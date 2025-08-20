import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSubscription {
  table: string;
  event: RealtimeEvent;
  schema?: string;
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

/**
 * Global Realtime Manager Hook
 * Manages Supabase realtime subscriptions for multiple tables
 */
export function useRealtimeSubscriptions(subscriptions: RealtimeSubscription[]) {
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Cleanup existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Create new subscriptions
    subscriptions.forEach((subscription, index) => {
      const channelName = `realtime-${subscription.table}-${index}`;
      const channel = supabase.channel(channelName);

      const config: any = {
        event: subscription.event,
        schema: subscription.schema || 'public',
        table: subscription.table,
      };

      if (subscription.filter) {
        config.filter = subscription.filter;
      }

      channel
        .on('postgres_changes', config, subscription.callback)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          }
        });

      channelsRef.current.push(channel);
    });

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setIsConnected(false);
    };
  }, [subscriptions]);

  return { isConnected };
}

/**
 * Network Module Realtime Hook
 */
export function useNetworkRealtime(
  onPostUpdate: (payload: any) => void,
  onConnectionUpdate: (payload: any) => void
) {
  return useRealtimeSubscriptions([
    {
      table: 'posts',
      event: '*',
      callback: onPostUpdate
    },
    {
      table: 'post_likes',
      event: '*',
      callback: onPostUpdate
    },
    {
      table: 'post_comments',
      event: '*',
      callback: onPostUpdate
    },
    {
      table: 'connections',
      event: '*',
      callback: onConnectionUpdate
    },
    {
      table: 'messages',
      event: '*',
      callback: onConnectionUpdate
    }
  ]);
}

/**
 * Jobs Module Realtime Hook
 */
export function useJobsRealtime(
  onJobUpdate: (payload: any) => void,
  onApplicationUpdate: (payload: any) => void
) {
  return useRealtimeSubscriptions([
    {
      table: 'jobs',
      event: '*',
      callback: onJobUpdate
    },
    {
      table: 'job_applications',
      event: '*',
      callback: onApplicationUpdate
    },
    {
      table: 'job_views',
      event: 'INSERT',
      callback: onJobUpdate
    }
  ]);
}

/**
 * Learning Module Realtime Hook
 */
export function useLearningRealtime(
  onProgressUpdate: (payload: any) => void,
  onEnrollmentUpdate: (payload: any) => void
) {
  return useRealtimeSubscriptions([
    {
      table: 'course_enrollments',
      event: '*',
      callback: onEnrollmentUpdate
    },
    {
      table: 'lesson_progress',
      event: '*',
      callback: onProgressUpdate
    },
    {
      table: 'course_progress',
      event: '*',
      callback: onProgressUpdate
    }
  ]);
}

/**
 * Employer Module Realtime Hook
 */
export function useEmployerRealtime(
  userId: string,
  onApplicationUpdate: (payload: any) => void,
  onJobStatsUpdate: (payload: any) => void
) {
  return useRealtimeSubscriptions([
    {
      table: 'job_applications',
      event: '*',
      callback: onApplicationUpdate
    },
    {
      table: 'jobs',
      event: 'UPDATE',
      filter: `created_by=eq.${userId}`,
      callback: onJobStatsUpdate
    }
  ]);
}

/**
 * Admin Module Realtime Hook
 */
export function useAdminRealtime(
  onUserUpdate: (payload: any) => void,
  onRequestUpdate: (payload: any) => void,
  onSystemUpdate: (payload: any) => void
) {
  return useRealtimeSubscriptions([
    {
      table: 'profiles',
      event: '*',
      callback: onUserUpdate
    },
    {
      table: 'employer_requests',
      event: '*',
      callback: onRequestUpdate
    },
    {
      table: 'company_access_requests',
      event: '*',
      callback: onRequestUpdate
    },
    {
      table: 'admin_activity_log',
      event: 'INSERT',
      callback: onSystemUpdate
    }
  ]);
}

/**
 * Generic table realtime hook
 */
export function useTableRealtime<T = any>(
  table: string,
  event: RealtimeEvent = '*',
  onUpdate: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
) {
  return useRealtimeSubscriptions([
    {
      table,
      event,
      callback: onUpdate,
      filter
    }
  ]);
}

// Auto-refresh hooks for specific use cases
export function useAutoRefreshPosts(refreshInterval: number = 30000) {
  const [posts, setPosts] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time subscription for instant updates
  useNetworkRealtime(
    (payload) => {
      console.log('Post updated in real-time:', payload);
      setLastRefresh(new Date());
    },
    (payload) => {
      console.log('Connection updated in real-time:', payload);
    }
  );

  // Periodic refresh as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { posts, lastRefresh };
}

export function useAutoRefreshJobs(refreshInterval: number = 60000) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time subscription for instant updates
  useJobsRealtime(
    (payload) => {
      console.log('Job updated in real-time:', payload);
      setLastRefresh(new Date());
    },
    (payload) => {
      console.log('Application updated in real-time:', payload);
      setLastRefresh(new Date());
    }
  );

  // Periodic refresh as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { jobs, lastRefresh };
}