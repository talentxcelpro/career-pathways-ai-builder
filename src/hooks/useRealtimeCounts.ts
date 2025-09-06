import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useRealtimeCounts() {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Feed count (posts from last 24h)
  const { data: feedCount = 0 } = useQuery({
    queryKey: ['feed-count', lastUpdate],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true)
        .gte('created_at', yesterday.toISOString());
      
      return Math.min(count || 0, 99);
    },
    refetchInterval: 30000 // Update every 30 seconds
  });

  // Network count (potential connections)
  const { data: networkCount = 0 } = useQuery({
    queryKey: ['network-count', user?.id, lastUpdate],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get existing connections
      const { data: connections } = await supabase
        .from('connections')
        .select('recipient_id, requester_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectedIds = connections?.map(c => 
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      ) || [];

      // Count available connections (excluding current user and connected users)
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', user.id);

      if (connectedIds.length > 0) {
        query = query.not('id', 'in', `(${connectedIds.join(',')})`);
      }

      const { count } = await query;
      return Math.min(count || 0, 999);
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Update every minute
  });

  // Messages count (unread)
  const { data: messagesCount = 0 } = useQuery({
    queryKey: ['messages-count', user?.id, lastUpdate],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 10000 // Update every 10 seconds for messages
  });

  // Events count (upcoming events)
  const { data: eventsCount = 0 } = useQuery({
    queryKey: ['events-count', lastUpdate],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_date', now)
        .eq('is_public', true);
      
      return count || 0;
    },
    refetchInterval: 120000 // Update every 2 minutes
  });

  // Jobs count (new jobs from last week)
  const { data: jobsCount = 0 } = useQuery({
    queryKey: ['jobs-count', lastUpdate],
    queryFn: async () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('created_at', lastWeek.toISOString());
      
      return Math.min(count || 0, 999);
    },
    refetchInterval: 300000 // Update every 5 minutes
  });

  // Set up real-time updates for FOMO effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 15000); // Trigger updates every 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time subscriptions for immediate updates
  useEffect(() => {
    const postsChannel = supabase
      .channel('posts_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, () => {
        setLastUpdate(Date.now());
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}`
      }, () => {
        setLastUpdate(Date.now());
      })
      .subscribe();

    const jobsChannel = supabase
      .channel('jobs_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'jobs'
      }, () => {
        setLastUpdate(Date.now());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, [user?.id]);

  return {
    feedCount,
    networkCount,
    messagesCount,
    eventsCount,
    jobsCount,
    isLoading: false // We want instant display, not loading states
  };
}