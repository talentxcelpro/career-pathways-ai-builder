import { supabase } from '@/integrations/supabase/client';

export interface CareerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface CareerReward {
  id: string;
  title: string;
  description: string;
  category: string;
  coin_cost: number;
  stock: number;
}

export interface CareerEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  category: string;
  is_registered?: boolean;
}

export class CareerBadgeAndRewardsService {
  static async getBadges(userId?: string): Promise<CareerBadge[]> {
    const { data: badges, error } = await supabase
      .from('career_badges' as any)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching badges:', error);
      throw error;
    }

    if (!userId || userId === 'guest') {
      return (badges as any[]).map(b => ({
        ...b,
        is_unlocked: false
      }));
    }

    const { data: unlocked } = await supabase
      .from('career_player_badges' as any)
      .select('badge_id, unlocked_at')
      .eq('player_id', userId);

    const unlockedMap = new Map<string, string>();
    (unlocked || []).forEach((u: any) => {
      unlockedMap.set(u.badge_id, u.unlocked_at);
    });

    return (badges as any[]).map(b => ({
      ...b,
      is_unlocked: unlockedMap.has(b.id),
      unlocked_at: unlockedMap.get(b.id)
    }));
  }

  static async getRewards(): Promise<CareerReward[]> {
    const { data, error } = await supabase
      .from('career_rewards' as any)
      .select('*')
      .gt('stock', 0)
      .order('coin_cost', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
    return data as CareerReward[];
  }

  static async redeemReward(userId: string, reward: CareerReward, currentCoins: number): Promise<void> {
    if (currentCoins < reward.coin_cost) {
      throw new Error(`Insufficient Career Coins. You need ${reward.coin_cost} coins, but have ${currentCoins}.`);
    }

    // 1. Record redemption
    const { error: redError } = await supabase
      .from('career_reward_redemptions' as any)
      .insert({
        player_id: userId,
        reward_id: reward.id,
        coins_spent: reward.coin_cost
      });

    if (redError) {
      console.error('Error recording reward redemption:', redError);
      throw redError;
    }

    // 2. Deduct coins from player
    const { error: playerError } = await supabase
      .from('career_players' as any)
      .update({
        career_coins: currentCoins - reward.coin_cost
      })
      .eq('id', userId);

    if (playerError) {
      console.error('Error deducting player coins:', playerError);
      throw playerError;
    }
  }

  static async getEvents(userId?: string): Promise<CareerEvent[]> {
    const { data: events, error } = await supabase
      .from('career_events' as any)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    if (!userId || userId === 'guest') {
      return (events as any[]).map(e => ({ ...e, is_registered: false }));
    }

    const { data: registrations } = await supabase
      .from('career_event_registrations' as any)
      .select('event_id')
      .eq('player_id', userId);

    const regSet = new Set((registrations || []).map((r: any) => r.event_id));

    return (events as any[]).map(e => ({
      ...e,
      is_registered: regSet.has(e.id)
    }));
  }

  static async registerForEvent(userId: string, eventId: string): Promise<void> {
    const { error } = await supabase
      .from('career_event_registrations' as any)
      .insert({
        player_id: userId,
        event_id: eventId
      });

    if (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }
}


export const careerBadgeAndRewardsService = CareerBadgeAndRewardsService;
export default CareerBadgeAndRewardsService;
