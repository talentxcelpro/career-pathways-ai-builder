
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeConnections = () => {
  const queryClient = useQueryClient();

  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get accepted connections with profile data
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:requester_id(id, full_name, title, profile_picture_url),
          recipient:recipient_id(id, full_name, title, profile_picture_url)
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('connected_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform data to show the other person in the connection
      return connectionsData?.map(conn => ({
        ...conn,
        otherUser: conn.requester_id === user.id ? conn.recipient : conn.requester
      })) || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['connectionStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { connections: 0, messages: 0, events: 0, profileViews: 0 };

      // Get connections count
      const { count: connectionsCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      // Get unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      // Get upcoming events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString());

      // Get profile views count
      const { count: profileViewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      return {
        connections: connectionsCount || 0,
        messages: messagesCount || 0,
        events: eventsCount || 0,
        profileViews: profileViewsCount || 0
      };
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const connectionsChannel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connections'] });
          queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
        }
      )
      .subscribe();

    const profileViewsChannel = supabase
      .channel('profile-views-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_views'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profileViewsChannel);
    };
  }, [queryClient]);

  return { connections, stats, isLoading };
};
