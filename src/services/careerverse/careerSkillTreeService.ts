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
  order_index?: number;
  name?: string;
  prerequisites?: string[];
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
    // Map granular role paths to their root category in Supabase
    const normalizedPath = ['frontend', 'backend', 'fullstack', 'ai_ml', 'devops', 'cybersecurity'].includes(pathId)
      ? 'technology'
      : (pathId || 'technology');

    let { data: skills, error } = await supabase
      .from('career_tree_skills' as any)
      .select('*')
      .eq('path_id', normalizedPath)
      .order('created_at', { ascending: true });

    if (error || !skills || skills.length === 0) {
      // Fallback query to 'technology' root path
      const { data: fallbackSkills } = await supabase
        .from('career_tree_skills' as any)
        .select('*')
        .eq('path_id', 'technology')
        .order('created_at', { ascending: true });
      skills = fallbackSkills || [];
    }

    if (!userId || userId === 'guest') {
      return (skills as any[]).map(s => ({
        ...s,
        title: s.name || s.title,
        user_status: (!s.prerequisites || s.prerequisites.length === 0) ? 'unlocked' : 'locked',
        user_progress: (!s.prerequisites || s.prerequisites.length === 0) ? 50 : 0
      }));
    }

    // Fetch user's actual database completions and declared skills
    const [userSkillsRes, profileRes] = await Promise.all([
      supabase.from('career_player_skills' as any).select('*').eq('player_id', userId),
      supabase.from('profiles').select('skills').eq('id', userId).maybeSingle(),
    ]);

    const userSkillMap = new Map<string, any>();
    (userSkillsRes.data || []).forEach((us: any) => {
      userSkillMap.set(us.skill_id, us);
    });

    const declaredSkills: string[] = Array.isArray(profileRes.data?.skills)
      ? profileRes.data.skills.map((s: string) => s.toLowerCase().trim())
      : [];

    return (skills as any[]).map(s => {
      const us = userSkillMap.get(s.id);
      const skillNameLower = (s.name || s.title || '').toLowerCase();

      let status: 'locked' | 'unlocked' | 'mastered' = 'locked';
      let progress = 0;

      if (us) {
        status = us.status;
        progress = us.progress;
      } else {
        // Evaluate dynamic unlocking against the user's authentic profile skills
        const hasDirectMatch = declaredSkills.some(ds => ds.includes(skillNameLower) || skillNameLower.includes(ds));
        const hasReact = declaredSkills.some(ds => ds.includes('react'));
        const hasNodeOrSql = declaredSkills.some(ds => ds.includes('node') || ds.includes('postgres') || ds.includes('sql') || ds.includes('api'));
        
        if (skillNameLower === 'frontend' && (hasReact || declaredSkills.includes('tailwind css'))) {
          status = 'mastered';
          progress = 100;
        } else if (skillNameLower === 'react' && hasReact) {
          status = 'unlocked';
          progress = 85;
        } else if (skillNameLower === 'backend' && hasNodeOrSql) {
          status = 'unlocked';
          progress = 80;
        } else if (skillNameLower === 'full stack' && hasReact && hasNodeOrSql) {
          status = 'unlocked';
          progress = 75;
        } else if (hasDirectMatch) {
          status = 'unlocked';
          progress = 70;
        } else if (!s.prerequisite_id && (!s.prerequisites || s.prerequisites.length === 0)) {
          status = 'unlocked';
          progress = 30;
        } else {
          status = 'locked';
          progress = 0;
        }
      }

      return {
        ...s,
        title: s.name || s.title,
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
      amount: skill.xp_reward || 100,
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
