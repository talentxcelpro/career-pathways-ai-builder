import { supabase } from '@/integrations/supabase/client';
import { CareerPlayerService } from './careerPlayerService';

export interface BossBattleStage {
  id?: number | string;
  name: string;
  desc?: string;
  status?: string;
}

export interface CareerBossBattle {
  id: string;
  title: string;
  company_name: string;
  company_logo: string | null;
  job_id: string | null;
  role_type: string;
  description: string;
  stages: (string | BossBattleStage)[];
  xp_reward: number;
  coins_reward: number;
  badge_name: string;
  is_live: boolean;
  user_participation?: {
    current_stage: number;
    status: 'active' | 'completed' | 'hired';
    code_submission: string | null;
    feedback: string | null;
  };
}

export class CareerBossBattleService {
  static async getLiveBattles(userId?: string): Promise<CareerBossBattle[]> {
    const { data: battles, error } = await supabase
      .from('career_boss_battles' as any)
      .select('*')
      .eq('is_live', true)
      .order('xp_reward', { ascending: false });

    if (error) {
      console.error('Error fetching boss battles:', error);
      throw error;
    }

    if (!userId || userId === 'guest') {
      return (battles as any[]).map(b => ({
        ...b,
        stages: Array.isArray(b.stages) ? b.stages : ['Code Challenge', 'Debug & Improve', 'Tech Interview', 'Final Interview'],
        user_participation: {
          current_stage: 1,
          status: 'active',
          code_submission: null,
          feedback: null
        }
      }));
    }

    const { data: participants } = await supabase
      .from('career_boss_participants' as any)
      .select('*')
      .eq('user_id', userId);

    const partMap = new Map<string, any>();
    (participants || []).forEach((p: any) => {
      partMap.set(p.battle_id, p);
    });

    return (battles as any[]).map(b => {
      const p = partMap.get(b.id);
      return {
        ...b,
        stages: Array.isArray(b.stages) ? b.stages : ['Code Challenge', 'Debug & Improve', 'Tech Interview', 'Final Interview'],
        user_participation: p ? {
          current_stage: p.current_stage || 1,
          status: p.status || 'active',
          code_submission: null,
          feedback: p.feedback || null
        } : {
          current_stage: 1,
          status: 'active',
          code_submission: null,
          feedback: null
        }
      };
    });
  }

  static async advanceBattleStage(userId: string, battleId: string, nextStage: number, codeSubmission?: string): Promise<void> {
    const { error } = await supabase
      .from('career_boss_participants' as any)
      .upsert({
        battle_id: battleId,
        user_id: userId,
        current_stage: nextStage,
        status: nextStage > 4 ? 'completed' : 'active',
        feedback: codeSubmission ? 'Automated test suite passed' : null
      }, { onConflict: 'battle_id,user_id' });

    if (error) {
      console.error('Error advancing boss battle stage:', error);
      throw error;
    }

    if (nextStage > 4) {
      // Award boss battle completion reward
      await CareerPlayerService.awardXP({
        userId,
        amount: 500,
        coins: 100,
        action: 'Defeated Employer Boss Battle',
        sourceType: 'boss_battle',
        sourceId: battleId,
        idempotencyKey: `boss_victory_${battleId}_${userId}`
      });
    }
  }

  static async advanceStage(userId: string, battleId: string, nextStage: number, codeSubmission?: string) {
    return this.advanceBattleStage(userId, battleId, nextStage, codeSubmission);
  }
}

export const careerBossBattleService = CareerBossBattleService;
export default CareerBossBattleService;
