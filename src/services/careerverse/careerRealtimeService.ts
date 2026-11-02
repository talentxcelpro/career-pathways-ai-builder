import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class CareerRealtimeService {
  /**
   * Subscribe to real-time player level, XP, and coin updates.
   */
  static subscribeToPlayerUpdates(
    userId: string,
    onUpdate: (updatedPlayer: any) => void
  ): RealtimeChannel | null {
    if (!userId || userId === 'guest') return null;

    const channel = supabase
      .channel(`career_player_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'career_players',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Cleanly unsubscribe from a real-time channel.
   */
  static unsubscribe(channel: RealtimeChannel | null): void {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
}
