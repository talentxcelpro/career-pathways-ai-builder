import { supabase } from '@/integrations/supabase/client';
import { CareerPlayerService } from './careerPlayerService';

export interface CareerSkillPath {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface CareerTreeSkill {
  id: string;
  path_id: string;
  title: string;
  level_range: string;
  prerequisite_id: string | null;
  xp_required: number;
  xp_reward: number;
  order_index: number;
  user_status?: 'locked' | 'unlocked' | 'mastered';
  user_progress?: number;
}

export class CareerSkillTreeService {
  static async getPaths(): Promise<CareerSkillPath[]> {
    const { data, error } = await supabase
      .from('career_skill_paths' as any)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching skill paths:', error);
      throw error;
    }
    return data as CareerSkillPath[];
  }

  static async getSkillsForPath(pathId: string, userId?: string): Promise<CareerTreeSkill[]> {
    const { data: skills, error } = await supabase
      .from('career_tree_skills' as any)
      .select('*')
      .eq('path_id', pathId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching tree skills:', error);
      throw error;
    }

    if (!userId || userId === 'guest') {
      return (skills as any[]).map(s => ({
        ...s,
        user_status: s.prerequisite_id === null ? 'unlocked' : 'locked',
        user_progress: s.prerequisite_id === null ? 50 : 0
      }));
    }

    const { data: userSkills } = await supabase
      .from('career_player_skills' as any)
      .select('*')
      .eq('player_id', userId);

    const userSkillMap = new Map<string, any>();
    (userSkills || []).forEach((us: any) => {
      userSkillMap.set(us.skill_id, us);
    });

    return (skills as any[]).map(s => {
      const us = userSkillMap.get(s.id);
      let status: 'locked' | 'unlocked' | 'mastered' = 'locked';
      let progress = 0;

      if (us) {
        status = us.status;
        progress = us.progress;
      } else if (!s.prerequisite_id) {
        status = 'unlocked';
      } else {
        const prereq = userSkillMap.get(s.prerequisite_id);
        if (prereq && prereq.status === 'mastered') {
          status = 'unlocked';
        }
      }

      return {
        ...s,
        user_status: status,
        user_progress: progress
      };
    });
  }

  static async unlockOrMasterSkill(userId: string, skill: CareerTreeSkill): Promise<void> {
    // 1. Mark mastered in player skills
    const { error } = await supabase
      .from('career_player_skills' as any)
      .upsert({
        player_id: userId,
        skill_id: skill.id,
        status: 'mastered',
        progress: 100,
        verified_at: new Date().toISOString()
      }, { onConflict: 'player_id,skill_id' });

    if (error) {
      console.error('Error mastering skill:', error);
      throw error;
    }

    // 2. Award XP
    await CareerPlayerService.awardXP({
      userId,
      amount: skill.xp_reward,
      coins: 25,
      action: `Mastered Skill: ${skill.title}`,
      sourceType: 'skill',
      sourceId: skill.id,
      idempotencyKey: `skill_${skill.id}_${userId}`
    });
  }
}


export const careerSkillTreeService = CareerSkillTreeService;
export default CareerSkillTreeService;
