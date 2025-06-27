
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

      // Get accepted connections
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('connected_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching connections:', error);
        return [];
      }

      if (!connectionsData || connectionsData.length === 0) return [];

      // Get the other user IDs from connections
      const otherUserIds = connectionsData.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ).filter(Boolean);

      if (otherUserIds.length === 0) return [];

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url')
        .in('id', otherUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Transform data to include the other user's profile
      return connectionsData.map(conn => {
        const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        const otherUser = profilesMap.get(otherUserId);
        
        return {
          ...conn,
          otherUser: otherUser || {
            id: otherUserId,
            full_name: 'Unknown User',
            title: 'Professional',
            profile_picture_url: null
          }
        };
      });
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['connectionStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { connections: 0, messages: 0, events: 0, profileViews: 0 };

      console.log('Fetching connection stats for user:', user.id);

      // Get connections count
      const { count: connectionsCount, error: connectionsError } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) {
        console.error('Error fetching connections count:', connectionsError);
      }

      // Get unread messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (messagesError) {
        console.error('Error fetching messages count:', messagesError);
      }

      // Get upcoming events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString());

      if (eventsError) {
        console.error('Error fetching events count:', eventsError);
      }

      // Get profile views count
      const { count: profileViewsCount, error: profileViewsError } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      if (profileViewsError) {
        console.error('Error fetching profile views count:', profileViewsError);
      }

      const stats = {
        connections: connectionsCount || 0,
        messages: messagesCount || 0,
        events: eventsCount || 0,
        profileViews: profileViewsCount || 0
      };

      console.log('Connection stats:', stats);
      return stats;
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
          console.log('Connection change detected, refreshing data');
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
          console.log('Message change detected, refreshing stats');
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
          console.log('Profile view detected, refreshing stats');
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
