import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { dbOptimizer } from '@/utils/databaseOptimizer';

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

    // Listen for new post likes and invalidate cache
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
          // Invalidate posts cache for real-time updates
          dbOptimizer.invalidateCache('posts');
          console.log('New post like:', payload.new);
        }
      )
      .subscribe();

    // Listen for new posts and invalidate cache
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          // Invalidate posts cache when new posts are created
          dbOptimizer.invalidateCache('posts');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          // Invalidate posts cache when posts are updated
          dbOptimizer.invalidateCache('posts');
        }
      )
      .subscribe();

    // Listen for post comments and invalidate cache
    const postCommentsChannel = supabase
      .channel('post-comments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments'
        },
        (payload) => {
          // Invalidate posts cache when new comments are added
          dbOptimizer.invalidateCache('posts');
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
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(postCommentsChannel);
      supabase.removeChannel(jobInteractionsChannel);
      supabase.removeChannel(userFollowsChannel);
    };
  }, [toast]);
}