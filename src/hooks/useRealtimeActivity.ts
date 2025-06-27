
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeActivity = () => {
  const queryClient = useQueryClient();

  const { data: recentActivity, isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get recent post likes
      const { data: likesData } = await supabase
        .from('post_likes')
        .select(`
          created_at,
          user:user_id(full_name, profile_picture_url),
          post:post_id(content)
        `)
        .in('post_id', 
          await supabase
            .from('posts')
            .select('id')
            .eq('author_id', user.id)
            .then(res => res.data?.map(p => p.id) || [])
        )
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent connections
      const { data: connectionsData } = await supabase
        .from('connections')
        .select(`
          created_at,
          status,
          requester:requester_id(full_name, profile_picture_url),
          recipient:recipient_id(full_name, profile_picture_url)
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          created_at,
          content,
          sender:sender_id(full_name, profile_picture_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and format activities
      const activities = [];

      // Add likes
      likesData?.forEach(like => {
        activities.push({
          id: `like-${like.created_at}`,
          type: 'like',
          user: like.user?.full_name || 'Someone',
          action: 'liked your post',
          time: like.created_at,
          avatar: like.user?.profile_picture_url
        });
      });

      // Add connections
      connectionsData?.forEach(conn => {
        const otherUser = conn.requester_id === user.id ? conn.recipient : conn.requester;
        activities.push({
          id: `connection-${conn.created_at}`,
          type: 'connection',
          user: otherUser?.full_name || 'Someone',
          action: conn.status === 'accepted' ? 'connected with you' : 'sent you a connection request',
          time: conn.created_at,
          avatar: otherUser?.profile_picture_url
        });
      });

      // Add messages
      messagesData?.forEach(msg => {
        activities.push({
          id: `message-${msg.created_at}`,
          type: 'message',
          user: msg.sender?.full_name || 'Someone',
          action: 'sent you a message',
          time: msg.created_at,
          avatar: msg.sender?.profile_picture_url
        });
      });

      // Sort by time
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const activityChannel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, [queryClient]);

  return { recentActivity, isLoading };
};
