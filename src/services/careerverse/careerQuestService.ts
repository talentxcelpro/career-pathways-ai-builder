import { supabase } from '@/integrations/supabase/client';
import { careerPlayerService } from './careerPlayerService';

export interface CareerQuest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone' | 'special';
  xp_reward: number;
  coin_reward?: number;
  completed: boolean;
  action_url?: string;
}

export const careerQuestService = {
  async getUserQuestsWithStatus(userId: string): Promise<CareerQuest[]> {
    try {
      // 1. Fetch available quests from database
      const { data: dbQuests, error } = await supabase
        .from('career_quests')
        .select('id, title, description, category, xp_reward, coin_reward')
        .order('xp_reward', { ascending: true });

      // If database has quests, map them
      if (!error && dbQuests && dbQuests.length > 0) {
        // Query user quest completions if available
        const completedQuestIds = new Set<string>();
        if (userId && userId !== 'demo_user_id') {
          const { data: userQuests } = await supabase
            .from('career_user_quests')
            .select('quest_id, status')
            .eq('user_id', userId)
            .eq('status', 'completed');

          userQuests?.forEach((q) => completedQuestIds.add(q.quest_id));
        } else {
          // Default: first quest checked like screenshot
          completedQuestIds.add(dbQuests[0].id);
        }

        return dbQuests.map((q, idx) => ({
          id: q.id,
          title: q.title,
          description: q.description || '',
          category: (q.category as any) || 'daily',
          xp_reward: q.xp_reward || 50,
          coin_reward: q.coin_reward || 10,
          completed: completedQuestIds.has(q.id) || (idx === 0 && (!userId || userId === 'demo_user_id')),
        }));
      }

      // Default baseline matching reference screenshot
      return this.getDefaultQuests();
    } catch (err) {
      console.warn('careerQuestService.getUserQuestsWithStatus fallback:', err);
      return this.getDefaultQuests();
    }
  },

  async completeQuest(userId: string, questId: string): Promise<{ success: boolean; xp_awarded: number }> {
    try {
      const quests = await this.getUserQuestsWithStatus(userId);
      const quest = quests.find((q) => q.id === questId);
      const xpReward = quest ? quest.xp_reward : 50;

      const idempotencyKey = `quest_complete_${userId}_${questId}_${new Date().toISOString().slice(0, 10)}`;

      // Award XP through authoritative ledger
      await careerPlayerService.addXP(
        userId,
        xpReward,
        `Completed quest: ${quest?.title || questId}`,
        'quest',
        questId,
        idempotencyKey
      );

      // Record in career_user_quests
      if (userId && userId !== 'demo_user_id') {
        await supabase
          .from('career_user_quests')
          .upsert({
            user_id: userId,
            quest_id: questId,
            status: 'completed',
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,quest_id' });
      }

      return { success: true, xp_awarded: xpReward };
    } catch (err) {
      console.error('Error completing quest:', err);
      return { success: false, xp_awarded: 0 };
    }
  },

  getDefaultQuests(): CareerQuest[] {
    return [
      {
        id: 'q_passport',
        title: 'Update your Career Passport',
        description: 'Verify your latest skills and education credentials to keep recruiters updated.',
        category: 'daily',
        xp_reward: 50,
        coin_reward: 10,
        completed: true,
      },
      {
        id: 'q_react',
        title: 'Complete a React challenge',
        description: 'Solve an algorithmic or UI challenge using React hooks and state management.',
        category: 'daily',
        xp_reward: 100,
        coin_reward: 20,
        completed: false,
      },
      {
        id: 'q_mentor',
        title: 'Connect with 1 mentor',
        description: 'Initiate a verified networking dialogue with an active industry leader.',
        category: 'daily',
        xp_reward: 75,
        coin_reward: 15,
        completed: false,
      },
      {
        id: 'q_interview',
        title: 'Take a mock interview',
        description: 'Practice answering 5 technical scenario questions with the AI interviewer.',
        category: 'daily',
        xp_reward: 150,
        coin_reward: 30,
        completed: false,
      },
    ];
  },
};
