import { supabase } from '@/integrations/supabase/client';
import { CareerPlayerService } from './careerPlayerService';

export interface CareerSkillPath {
  id: string;
  title: string;
  name?: string;
  description: string;
  icon: string;
}

export interface CareerTreeSkill {
  id: string;
  path_id: string;
  title: string;
  name?: string;
  level_range: string;
  category?: string;
  description?: string;
  prerequisites?: string[];
  prerequisite_id: string | null;
  position_x?: number;
  position_y?: number;
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
    return (data as any[] || []).map((p: any) => ({
      id: p.id,
      title: p.name || p.title || p.id,
      name: p.name || p.title || p.id,
      description: p.description || '',
      icon: p.icon || 'code'
    }));
  }

  static async getSkillsForPath(pathId: string = 'technology', userId?: string): Promise<CareerTreeSkill[]> {
    let resolvedPathId = pathId || 'technology';
    let { data: rawSkills, error } = await supabase
      .from('career_tree_skills' as any)
      .select('*')
      .eq('path_id', resolvedPathId)
      .order('position_y', { ascending: true });

    // Resilient fallback to 'technology' if candidate's specific subdiscipline path is not seeded
    if ((error || !rawSkills || rawSkills.length === 0) && resolvedPathId !== 'technology') {
      const fallback = await supabase
        .from('career_tree_skills' as any)
        .select('*')
        .eq('path_id', 'technology')
        .order('position_y', { ascending: true });
      if (!fallback.error && fallback.data && fallback.data.length > 0) {
        rawSkills = fallback.data;
        error = null;
      }
    }

    if (error) {
      console.error('Error fetching tree skills:', error);
      throw error;
    }

    const skills: CareerTreeSkill[] = (rawSkills || []).map((s: any) => ({
      id: s.id,
      path_id: s.path_id,
      title: s.name || s.title || 'Skill Node',
      name: s.name || s.title || 'Skill Node',
      level_range: s.level_range || 'Lv. 1-5',
      category: s.category || 'Core',
      description: s.description || '',
      prerequisites: s.prerequisites || [],
      prerequisite_id: (Array.isArray(s.prerequisites) && s.prerequisites.length > 0)
        ? s.prerequisites[0]
        : (s.prerequisite_id || null),
      xp_required: (s.min_player_level || 1) * 100,
      xp_reward: 150,
      order_index: (s.position_y ?? 0) * 10 + (s.position_x ?? 0),
      position_x: s.position_x ?? 0,
      position_y: s.position_y ?? 0,
    }));

    if (!userId || userId === 'guest') {
      return skills.map(s => ({
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

    return skills.map(s => {
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
