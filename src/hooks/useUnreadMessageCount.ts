import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';

export function useUnreadMessageCount() {
  const { user } = useOptimizedAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: unreadCount = 0, isLoading, refetch } = useQuery({
    queryKey: ['unread-messages-count', userId],
    queryFn: async (): Promise<number> => {
      if (!userId) return 0;

      try {
        const [resMessages, resDirectMessages] = await Promise.all([
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .or('is_read.is.null,is_read.eq.false'),
          supabase
            .from('direct_messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .eq('is_read', false)
        ]);

        const count1 = resMessages.count || 0;
        const count2 = resDirectMessages.count || 0;
        return count1 + count2;
      } catch (err) {
        console.warn('Failed to fetch unread message count:', err);
        return 0;
      }
    },
    enabled: Boolean(userId),
    staleTime: 30000,
  });

  // Real-time channel for instantaneous unread count sync
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-unread-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count', userId] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    unreadCount,
    isLoading,
    refetch
  };
}

export default useUnreadMessageCount;
