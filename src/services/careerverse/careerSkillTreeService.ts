import { supabase } from '@/integrations/supabase/client';
import { careerPlayerService } from './careerPlayerService';

export interface CareerSkillNode {
  id: string;
  name: string;
  level_range: string;
  category: string;
  status: 'unlocked' | 'active' | 'locked' | 'mastered';
  prerequisites: string[];
  xp_required?: number;
  description?: string;
  verification_status?: 'verified' | 'in_progress' | 'unverified';
}

export const careerSkillTreeService = {
  async getTreeNodes(pathCategory: string = 'technology', userId?: string): Promise<CareerSkillNode[]> {
    try {
      // 1. Fetch skills from career_tree_skills
      const { data: dbSkills, error } = await supabase
        .from('career_tree_skills')
        .select('id, name, category, level_range, prerequisites');

      if (!error && dbSkills && dbSkills.length > 0) {
        return dbSkills.map((s, idx) => {
          let status: CareerSkillNode['status'] = 'locked';
          if (idx === 0) status = 'mastered';
          else if (idx === 1) status = 'active';
          else if (idx === 2) status = 'unlocked';

          return {
            id: s.id,
            name: s.name,
            level_range: s.level_range || 'Lv. 1–5',
            category: s.category || pathCategory,
            status,
            prerequisites: Array.isArray(s.prerequisites) ? s.prerequisites : [],
            verification_status: idx === 0 ? 'verified' : 'unverified',
          };
        });
      }

      return this.getDefaultTreeNodes();
    } catch (err) {
      console.warn('careerSkillTreeService.getTreeNodes fallback:', err);
      return this.getDefaultTreeNodes();
    }
  },

  async verifySkill(userId: string, skillId: string): Promise<{ success: boolean; xp_awarded: number }> {
    try {
      const idempotencyKey = `skill_verify_${userId}_${skillId}_${Date.now()}`;
      await careerPlayerService.addXP(
        userId,
        120,
        `Mastered and verified skill node: ${skillId}`,
        'skill_tree',
        skillId,
        idempotencyKey
      );
      return { success: true, xp_awarded: 120 };
    } catch (err) {
      console.error('Error verifying skill node:', err);
      return { success: false, xp_awarded: 0 };
    }
  },

  getDefaultTreeNodes(): CareerSkillNode[] {
    return [
      {
        id: 'node_frontend',
        name: 'Frontend',
        level_range: 'Lv. 1–5',
        category: 'core',
        status: 'mastered',
        prerequisites: [],
        description: 'HTML5, CSS3, DOM APIs, Responsive Design and Web Core Vitals.',
        verification_status: 'verified',
      },
      {
        id: 'node_react',
        name: 'React',
        level_range: 'Lv. 6–10',
        category: 'specialization',
        status: 'active',
        prerequisites: ['node_frontend'],
        description: 'Modern React 19, JSX, Hooks, State Architecture & Server Components.',
        verification_status: 'in_progress',
      },
      {
        id: 'node_backend',
        name: 'Backend',
        level_range: 'Lv. 6–10',
        category: 'specialization',
        status: 'unlocked',
        prerequisites: ['node_frontend'],
        description: 'Node.js, Express, RESTful APIs, PostgREST & Database Schemas.',
        verification_status: 'unverified',
      },
      {
        id: 'node_fullstack',
        name: 'Full Stack',
        level_range: 'Lv. 11–15',
        category: 'advanced',
        status: 'unlocked',
        prerequisites: ['node_react', 'node_backend'],
        description: 'End-to-end architectural engineering, Supabase SSR, Auth & Caching.',
        verification_status: 'unverified',
      },
      {
        id: 'node_aiml',
        name: 'AI/ML',
        level_range: 'Lv. 11–15',
        category: 'advanced',
        status: 'locked',
        prerequisites: ['node_backend'],
        description: 'LLM Integration, Prompt Engineering, Vector Embeddings & Agentic Systems.',
        verification_status: 'unverified',
      },
    ];
  },
};
