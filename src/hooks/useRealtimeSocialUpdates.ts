import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useRealtimeSocialUpdates() {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // INCIDENT-FIX: skip unauthenticated subscriptions and scope to user to prevent platform-wide broadcast overload [date: 2026-11-21]
    if (!user?.id) return;

    // Consolidate into a single scoped channel instead of 4 separate global channels
    const socialChannel = supabase
      .channel(`user-social-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'pending') {
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
          table: 'connections',
          filter: `requester_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === 'accepted' && (payload.old as any)?.status === 'pending') {
            toast({
              title: "Connection Accepted",
              description: "Your connection request was accepted!",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_follows',
          filter: `following_id=eq.${user.id}`
        },
        () => {
          toast({
            title: "New Follower",
            description: "Someone started following you!",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(socialChannel);
    };
  }, [user?.id, toast]);
}