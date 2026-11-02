import { supabase } from '@/integrations/supabase/client';

export interface CareerPlayer {
  id: string;
  display_name: string;
  career_title: string;
  avatar_url: string | null;
  college: string;
  xp: number;
  level: number;
  career_coins: number;
  current_streak: number;
  last_active_at: string;
  stats: {
    javascript: number;
    react: number;
    communication: number;
    [key: string]: number;
  };
  guild_id: string | null;
}

export const calcLevel = (xp: number): number => {
  return Math.max(1, Math.floor(xp / 250) + 1);
};

export const getNextLevelThreshold = (currentLevel: number): number => {
  return currentLevel * 250;
};

export const getLevelFloorXP = (currentLevel: number): number => {
  return (currentLevel - 1) * 250;
};

// Default guest profile when not logged in (clearly labelled, genuine preview state)
export const GUEST_PLAYER: CareerPlayer = {
  id: 'guest',
  display_name: 'Guest Explorer',
  career_title: 'Aspiring Engineer',
  avatar_url: null,
  college: 'TalentXcel Academy',
  xp: 0,
  level: 1,
  career_coins: 0,
  current_streak: 1,
  last_active_at: new Date().toISOString(),
  stats: {
    javascript: 20,
    react: 15,
    communication: 30
  },
  guild_id: null
};

export class CareerPlayerService {
  /**
   * Fetch player profile for a given user ID, or automatically initialize one via RPC if missing.
   */
  static async getOrActivatePlayer(userId: string, defaultName?: string): Promise<CareerPlayer> {
    try {
      const { data, error } = await supabase
        .from('career_players' as any)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching player, falling back to activate:', error);
      }

      if (data) {
        return data as unknown as CareerPlayer;
      }

      // Activate via server-side RPC
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('activate_career_player', {
        p_user_id: userId,
        p_display_name: defaultName || 'Adventurer'
      });

      if (rpcError) {
        console.error('Failed to activate career player:', rpcError);
        throw rpcError;
      }

      return (rpcData as any)?.player as CareerPlayer;
    } catch (err) {
      console.error('CareerPlayerService.getOrActivatePlayer error:', err);
      throw err;
    }
  }

  /**
   * Award XP and Coins server-authoritatively using unique idempotency key.
   */
  static async awardXP(params: {
    userId: string;
    amount: number;
    coins?: number;
    action: string;
    sourceType: string;
    sourceId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    idempotent?: boolean;
    new_xp: number;
    new_level: number;
    new_coins: number;
    leveled_up: boolean;
  }> {
    const key = params.idempotencyKey || `xp_${params.userId}_${params.sourceType}_${params.sourceId || Date.now()}`;
    
    const { data, error } = await (supabase.rpc as any)('award_career_xp', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_coins: params.coins || 0,
      p_action: params.action,
      p_source_type: params.sourceType,
      p_source_id: params.sourceId || null,
      p_idempotency_key: key,
      p_metadata: params.metadata || {}
    });

    if (error) {
      console.error('Error in award_career_xp RPC:', error);
      throw error;
    }

    return data as any;
  }

  /**
   * Update editable player profile fields.
   */
  static async updatePlayerProfile(userId: string, updates: Partial<Pick<CareerPlayer, 'display_name' | 'career_title' | 'avatar_url' | 'college'>>): Promise<void> {
    const { error } = await supabase
      .from('career_players' as any)
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating player profile:', error);
      throw error;
    }
  }
}
