import { supabase } from '@/integrations/supabase/client';
import { CareerPlayerService } from './careerPlayerService';

export interface CareerQuest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone' | 'learning';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  coins_reward: number;
  action_type: string;
  requirements: Record<string, any>;
  is_active: boolean;
  user_progress?: {
    status: 'available' | 'in_progress' | 'completed' | 'claimed';
    progress: number;
    completed_at: string | null;
    claimed_at: string | null;
  };
}

export class CareerQuestService {
  /**
   * Fetch active quests, joined with the user's progress if logged in.
   */
  static async getQuests(userId?: string): Promise<CareerQuest[]> {
    const { data: quests, error: questError } = await supabase
      .from('career_quests' as any)
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('xp_reward', { ascending: true });

    if (questError) {
      console.error('Error fetching quests:', questError);
      throw questError;
    }

    if (!userId || userId === 'guest') {
      return (quests as any[]).map(q => ({
        ...q,
        user_progress: {
          status: 'available',
          progress: 0,
          completed_at: null,
          claimed_at: null
        }
      }));
    }

    // Fetch user progress
    const { data: progressList, error: progressError } = await supabase
      .from('career_player_quests' as any)
      .select('*')
      .eq('player_id', userId);

    if (progressError) {
      console.warn('Error fetching player quest progress:', progressError);
    }

    const progressMap = new Map<string, any>();
    (progressList || []).forEach((p: any) => {
      progressMap.set(p.quest_id, p);
    });

    return (quests as any[]).map(q => {
      const p = progressMap.get(q.id);
      return {
        ...q,
        user_progress: p ? {
          status: p.status,
          progress: p.progress,
          completed_at: p.completed_at,
          claimed_at: p.claimed_at
        } : {
          status: 'available',
          progress: 0,
          completed_at: null,
          claimed_at: null
        }
      };
    });
  }

  /**
   * Mark a quest as started or in progress.
   */
  static async startQuest(userId: string, questId: string): Promise<void> {
    const { error } = await supabase
      .from('career_player_quests' as any)
      .upsert({
        player_id: userId,
        quest_id: questId,
        status: 'in_progress',
        progress: 25
      }, { onConflict: 'player_id,quest_id' });

    if (error) {
      console.error('Error starting quest:', error);
      throw error;
    }
  }

  /**
   * Submit completion and claim rewards server-side.
   */
  static async completeAndClaimQuest(userId: string, quest: CareerQuest): Promise<{
    new_xp: number;
    new_level: number;
    new_coins: number;
    leveled_up: boolean;
  }> {
    // 1. Award XP server-authoritatively via idempotent RPC
    const idempotencyKey = `quest_${quest.id}_${userId}_${new Date().toISOString().slice(0, 10)}`;
    const awardResult = await CareerPlayerService.awardXP({
      userId,
      amount: quest.xp_reward,
      coins: quest.coins_reward,
      action: `Completed Quest: ${quest.title}`,
      sourceType: 'quest',
      sourceId: quest.id,
      idempotencyKey,
      metadata: { quest_title: quest.title, category: quest.category }
    });

    // 2. Update player quest status
    const { error } = await supabase
      .from('career_player_quests' as any)
      .upsert({
        player_id: userId,
        quest_id: quest.id,
        status: 'claimed',
        progress: 100,
        completed_at: new Date().toISOString(),
        claimed_at: new Date().toISOString()
      }, { onConflict: 'player_id,quest_id' });

    if (error) {
      console.error('Error updating player quest claim status:', error);
    }

    return awardResult;
  }
}


export const careerQuestService = CareerQuestService;
export default CareerQuestService;
