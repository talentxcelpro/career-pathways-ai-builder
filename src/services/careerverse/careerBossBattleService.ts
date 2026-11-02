import { supabase } from '@/integrations/supabase/client';
import { careerPlayerService } from './careerPlayerService';

export interface BossBattleStage {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'locked';
}

export interface CareerBossBattle {
  id: string;
  title: string;
  company_name: string;
  company_logo: string;
  badge_subtitle: string;
  is_live: boolean;
  xp_reward: number;
  stages: BossBattleStage[];
  victory_rewards: {
    xp: number;
    badge: string;
    interview_fast_track: boolean;
  };
}

export const careerBossBattleService = {
  async getBossBattles(userId?: string): Promise<CareerBossBattle[]> {
    try {
      // Fetch boss battles from database if available
      const { data: dbBattles, error } = await supabase
        .from('career_boss_battles')
        .select('*');

      if (!error && dbBattles && dbBattles.length > 0) {
        return dbBattles.map((b) => ({
          id: b.id,
          title: b.title,
          company_name: b.company_name || 'Microsoft',
          company_logo: b.company_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
          badge_subtitle: b.badge_subtitle || 'Hiring Internship',
          is_live: b.is_live ?? true,
          xp_reward: b.xp_reward || 500,
          stages: (b.stages as BossBattleStage[]) || this.getDefaultStages(),
          victory_rewards: {
            xp: b.xp_reward || 500,
            badge: 'Verified Skill Badge',
            interview_fast_track: true,
          },
        }));
      }

      return [this.getDefaultBossBattle()];
    } catch (err) {
      console.warn('careerBossBattleService.getBossBattles fallback:', err);
      return [this.getDefaultBossBattle()];
    }
  },

  async advanceStage(
    userId: string,
    battleId: string,
    currentStageId: number
  ): Promise<{ success: boolean; completed: boolean; xp_awarded: number }> {
    try {
      const nextStageId = currentStageId + 1;
      const isComplete = nextStageId > 4;

      if (isComplete) {
        const idempotencyKey = `boss_battle_victory_${userId}_${battleId}_${Date.now()}`;
        await careerPlayerService.addXP(
          userId,
          500,
          `Victory in Boss Battle: ${battleId}`,
          'boss_battle',
          battleId,
          idempotencyKey
        );
        return { success: true, completed: true, xp_awarded: 500 };
      }

      return { success: true, completed: false, xp_awarded: 100 };
    } catch (err) {
      console.error('Error advancing boss battle stage:', err);
      return { success: false, completed: false, xp_awarded: 0 };
    }
  },

  getDefaultStages(): BossBattleStage[] {
    return [
      { id: 1, name: 'Code Challenge', description: 'Implement optimized custom virtualized list component in React & TypeScript.', status: 'completed' },
      { id: 2, name: 'Debug & Improve', description: 'Profile and eliminate 3 critical render bottlenecks in legacy codebase.', status: 'active' },
      { id: 3, name: 'Tech Interview', description: 'Realtime architectural system design and state concurrency discussion.', status: 'locked' },
      { id: 4, name: 'Final Interview', description: 'Culture, product alignment, and executive engineering debrief.', status: 'locked' },
    ];
  },

  getDefaultBossBattle(): CareerBossBattle {
    return {
      id: 'bb_microsoft_frontend',
      title: 'Frontend Developer Challenge',
      company_name: 'Microsoft',
      company_logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      badge_subtitle: 'Microsoft (Hiring Internship)',
      is_live: true,
      xp_reward: 500,
      stages: [
        { id: 1, name: 'Code Challenge', description: 'Implement optimized custom virtualized list component in React & TypeScript.', status: 'completed' },
        { id: 2, name: 'Debug & Improve', description: 'Profile and eliminate 3 critical render bottlenecks in legacy codebase.', status: 'active' },
        { id: 3, name: 'Tech Interview', description: 'Realtime architectural system design and state concurrency discussion.', status: 'locked' },
        { id: 4, name: 'Final Interview', description: 'Culture, product alignment, and executive engineering debrief.', status: 'locked' },
      ],
      victory_rewards: {
        xp: 500,
        badge: 'Verified Skill Badge',
        interview_fast_track: true,
      },
    };
  },
};
