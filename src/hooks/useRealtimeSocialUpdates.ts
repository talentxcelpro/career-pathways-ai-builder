import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeSocialUpdates() {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for new connections
    const connectionsChannel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections'
        },
        (payload) => {
          // Show notification for connection requests
          if (payload.new.status === 'pending') {
            toast({
              title: "New Connection Request",
              description: "You have a new connection request",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections'
        },
        (payload) => {
          // Show notification when connection is accepted
          if (payload.new.status === 'accepted' && payload.old.status === 'pending') {
            toast({
              title: "Connection Accepted",
              description: "Your connection request was accepted!",
            });
          }
        }
      )
      .subscribe();

    // Listen for new post likes
    const postLikesChannel = supabase
      .channel('post-likes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_likes'
        },
        (payload) => {
          // Could trigger UI updates for like counts
          console.log('New post like:', payload.new);
        }
      )
      .subscribe();

    // Listen for new job interactions
    const jobInteractionsChannel = supabase
      .channel('job-interactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_interactions'
        },
        (payload) => {
          console.log('New job interaction:', payload.new);
        }
      )
      .subscribe();

    // Listen for new user follows
    const userFollowsChannel = supabase
      .channel('user-follows-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_follows'
        },
        (payload) => {
          toast({
            title: "New Follower",
            description: "Someone started following you!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(postLikesChannel);
      supabase.removeChannel(jobInteractionsChannel);
      supabase.removeChannel(userFollowsChannel);
    };
  }, [toast]);
}