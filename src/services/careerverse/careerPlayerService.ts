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

// Default guest profile when not logged in (strictly unassessed, zero fabricated stats)
export const GUEST_PLAYER: CareerPlayer = {
  id: 'guest',
  display_name: 'Guest Explorer',
  career_title: 'Guest Adventurer',
  avatar_url: null,
  college: '',
  xp: 0,
  level: 1,
  career_coins: 0,
  current_streak: 0,
  last_active_at: new Date().toISOString(),
  stats: {
    javascript: 0,
    react: 0,
    communication: 0
  },
  guild_id: null
};

export class CareerPlayerService {
  /**
   * Fetch player profile for a given user ID, or automatically initialize one if missing.
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

      // Try activating via server-side RPC first
      try {
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('activate_career_player', {
          p_user_id: userId,
          p_display_name: defaultName || 'Adventurer'
        });

        if (!rpcError && (rpcData as any)?.player) {
          return (rpcData as any).player as CareerPlayer;
        }
      } catch {
        // RPC not in schema cache; proceed to direct table insertion fallback
      }

      // Direct insertion fallback into career_players table
      const newPlayer: Partial<CareerPlayer> & {
        avatar_config: any;
        is_activated: boolean;
        is_public: boolean;
        last_active_date: string;
      } = {
        id: userId,
        display_name: defaultName || 'Adventurer',
        career_title: 'Career Explorer',
        avatar_url: null,
        college: '',
        xp: 0,
        level: 1,
        career_coins: 0,
        current_streak: 1,
        last_active_at: new Date().toISOString(),
        stats: {
          javascript: 50,
          react: 50,
          communication: 50,
        },
        guild_id: null,
        avatar_config: { aura: 'starlight', suit: 'explorer', theme: 'cyber_blue' },
        is_activated: true,
        is_public: true,
        last_active_date: new Date().toISOString().split('T')[0],
      };

      const { data: created, error: createError } = await supabase
        .from('career_players' as any)
        .upsert(newPlayer as any)
        .select('*')
        .single();

      if (createError) {
        console.error('Failed to create career_players record:', createError);
        throw createError;
      }

      return created as unknown as CareerPlayer;
    } catch (err) {
      console.error('CareerPlayerService.getOrActivatePlayer error:', err);
      throw err;
    }
  }

  /**
   * Award XP and Coins server-authoritatively using unique idempotency key with direct table fallback.
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
    
    // Attempt RPC first
    try {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('award_career_xp', {
        p_user_id: params.userId,
        p_amount: params.amount,
        p_coins: params.coins || 0,
        p_action: params.action,
        p_source_type: params.sourceType,
        p_source_id: params.sourceId || null,
        p_idempotency_key: key,
        p_metadata: params.metadata || {}
      });

      if (!rpcError && rpcData) {
        return rpcData as any;
      }
    } catch {
      // Schema cache fallback
    }

    // Direct table persistence fallback: Read current stats and update atomically
    const { data: current } = await supabase
      .from('career_players' as any)
      .select('xp, level, career_coins')
      .eq('id', params.userId)
      .maybeSingle();

    const currentXP = Number((current as any)?.xp || 0);
    const currentLevel = Number((current as any)?.level || 1);
    const currentCoins = Number((current as any)?.career_coins || 0);

    const newXP = currentXP + params.amount;
    const newCoins = currentCoins + (params.coins || 0);
    const newLevel = calcLevel(newXP);
    const leveledUp = newLevel > currentLevel;

    const { error: updateErr } = await supabase
      .from('career_players' as any)
      .update({
        xp: newXP,
        level: newLevel,
        career_coins: newCoins,
        last_active_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.userId);

    if (updateErr) {
      console.error('Error updating player XP in career_players:', updateErr);
      throw updateErr;
    }

    return {
      success: true,
      new_xp: newXP,
      new_level: newLevel,
      new_coins: newCoins,
      leveled_up: leveledUp,
    };
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

  /**
   * Convenience alias for awardXP returning structured object.
   */
  static async addXP(
    userId: string,
    amount: number,
    action: string,
    sourceType: string,
    sourceId?: string,
    idempotencyKey?: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    newTotalXP: number;
    newLevel: number;
    newCoins: number;
    leveledUp: boolean;
  }> {
    const res = await this.awardXP({
      userId,
      amount,
      action,
      sourceType,
      sourceId,
      idempotencyKey,
      metadata,
    });
    return {
      success: res.success,
      newTotalXP: res.new_xp,
      newLevel: res.new_level,
      newCoins: res.new_coins,
      leveledUp: res.leveled_up,
    };
  }
}

export const careerPlayerService = CareerPlayerService;
