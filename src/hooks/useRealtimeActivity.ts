
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

      const activities = [];

      // Get recent post likes on user's posts
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('author_id', user.id);

      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map(p => p.id);
        
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('created_at, user_id, post_id')
          .in('post_id', postIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (likesData) {
          // Get user profiles for likes
          const likerIds = likesData.map(like => like.user_id);
          const { data: likerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url')
            .in('id', likerIds);

          const profilesMap = new Map(likerProfiles?.map(p => [p.id, p]) || []);

          likesData.forEach(like => {
            const profile = profilesMap.get(like.user_id);
            activities.push({
              id: `like-${like.created_at}`,
              type: 'like',
              user: profile?.full_name || 'Someone',
              action: 'liked your post',
              time: like.created_at,
              avatar: profile?.profile_picture_url
            });
          });
        }
      }

      // Get recent connections
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('created_at, status, requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (connectionsData) {
        // Get profiles for connection users
        const userIds = connectionsData.map(conn => 
          conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
        ).filter(Boolean);
        
        const { data: connectionProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', userIds);

        const profilesMap = new Map(connectionProfiles?.map(p => [p.id, p]) || []);

        connectionsData.forEach(conn => {
          const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
          const profile = profilesMap.get(otherUserId);
          
          activities.push({
            id: `connection-${conn.created_at}`,
            type: 'connection',
            user: profile?.full_name || 'Someone',
            action: conn.status === 'accepted' ? 'connected with you' : 'sent you a connection request',
            time: conn.created_at,
            avatar: profile?.profile_picture_url
          });
        });
      }

      // Get recent messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('created_at, content, sender_id')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesData) {
        // Get sender profiles
        const senderIds = messagesData.map(msg => msg.sender_id).filter(Boolean);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', senderIds);

        const profilesMap = new Map(senderProfiles?.map(p => [p.id, p]) || []);

        messagesData.forEach(msg => {
          const profile = profilesMap.get(msg.sender_id);
          activities.push({
            id: `message-${msg.created_at}`,
            type: 'message',
            user: profile?.full_name || 'Someone',
            action: 'sent you a message',
            time: msg.created_at,
            avatar: profile?.profile_picture_url
          });
        });
      }

      // Sort by time and return top 10
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
