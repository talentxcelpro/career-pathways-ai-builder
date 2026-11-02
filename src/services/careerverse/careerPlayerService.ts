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
   * Fetch player profile for a given user ID, or automatically initialize one using authentic profile data.
   */
  static async getOrActivatePlayer(userId: string, defaultName?: string): Promise<CareerPlayer> {
    try {
      // 1. Check existing career_players record
      const { data, error } = await supabase
        .from('career_players' as any)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        return data as unknown as CareerPlayer;
      }

      // 2. Try inserting new player record if authenticated
      const { data: inserted } = await supabase
        .from('career_players' as any)
        .insert({
          id: userId,
          display_name: defaultName || 'Candidate',
          career_title: 'Career Explorer',
          college: '',
          career_path: 'technology',
          xp: 0,
          level: 1,
          career_coins: 0,
          streak_count: 0
        })
        .select()
        .maybeSingle();

      if (inserted) {
        return inserted as unknown as CareerPlayer;
      }

      // 3. Fallback: Hydrate player record directly from authentic profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const topEdu = Array.isArray(profile?.education_history) && profile.education_history.length > 0
        ? profile.education_history[0]
        : null;

      const playerFromProfile: CareerPlayer = {
        id: userId,
        display_name: profile?.full_name || defaultName || 'TalentXcel Candidate',
        career_title: profile?.headline || profile?.title || profile?.current_job_title || profile?.primary_role || 'Career Explorer',
        avatar_url: profile?.profile_photo_url || profile?.profile_picture_url || null,
        college: topEdu?.college || topEdu?.school || topEdu?.institution || '',
        xp: profile?.xp || 0,
        level: Math.max(1, Math.floor((profile?.xp || 0) / 250) + 1),
        career_coins: profile?.txc_coins || 0,
        current_streak: profile?.current_streak || 0,
        last_active_at: new Date().toISOString(),
        stats: {
          javascript: 0,
          react: 0,
          communication: 0
        },
        guild_id: null
      };

      return playerFromProfile;
    } catch (err) {
      console.error('CareerPlayerService.getOrActivatePlayer error:', err);
      throw err;
    }
  }

  /**
   * Award XP server-authoritatively using unique idempotency key.
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
      p_reason: params.action,
      p_source_type: params.sourceType,
      p_source_id: params.sourceId || null,
      p_idempotency_key: key
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
  /**
   * Convenience alias for awardXP with positional arguments.
   */
  static async addXP(
    userId: string,
    amount: number,
    action: string,
    sourceType: string,
    sourceId?: string,
    idempotencyKey?: string,
    metadata?: Record<string, any>
  ) {
    return this.awardXP({
      userId,
      amount,
      action,
      sourceType,
      sourceId,
      idempotencyKey,
      metadata
    });
  }
}

export const careerPlayerService = CareerPlayerService;
