import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const careerRealtimeService = {
  subscribeToPlayerProgress(
    userId: string,
    onProgressUpdate: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `career_realtime_${userId || 'guest'}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'career_xp_ledger',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          onProgressUpdate(payload);
        }
      )
      .subscribe();

    return channel;
  },

  unsubscribe(channel: RealtimeChannel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  },
};
