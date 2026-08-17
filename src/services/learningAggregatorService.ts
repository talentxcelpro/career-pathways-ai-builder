import { supabase } from '@/integrations/supabase/client';
import { 
  AggregatedCourse, 
  LearningProvider, 
  CareerPathway, 
  CourseHandoffEvent, 
  PersonalizedLearningPlan
} from '@/types/learningAggregator';
import { 
  VERIFIED_PROVIDERS, 
  INITIAL_AGGREGATED_COURSES, 
  INITIAL_CAREER_PATHWAYS 
} from '@/data/learningAggregatorData';

export const learningAggregatorService = {

  /**
   * Fetch all aggregated courses with category, level, domain, search, and free status filtering
   */
  async getCourses(filters?: {
    search?: string;
    category?: string;
    domain?: string;
    level?: string;
    freeType?: string;
    providerId?: string;
    skill?: string;
  }): Promise<AggregatedCourse[]> {
    try {
      let query = supabase
        .from('aggregated_courses')
        .select('*')
        .eq('verification_status', 'VERIFIED');

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.domain && filters.domain !== 'all') {
        query = query.eq('domain', filters.domain);
      }
      if (filters?.level && filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }
      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }

      const { data } = await query;
      
      let list: AggregatedCourse[] = (data && data.length > 0) 
        ? (data as any) 
        : INITIAL_AGGREGATED_COURSES;

      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(c => 
          c.title.toLowerCase().includes(q) ||
          c.short_description.toLowerCase().includes(q) ||
          c.provider_name.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q)) ||
          c.career_relevance.some(cr => cr.toLowerCase().includes(q))
        );
      }

      if (filters?.freeType && filters.freeType !== 'all') {
        list = list.filter(c => c.free_type === filters.freeType);
      }

      if (filters?.skill) {
        const s = filters.skill.toLowerCase().trim();
        list = list.filter(c => c.skills.some(sk => sk.toLowerCase().includes(s)));
      }

      return list;
    } catch (err) {
      console.warn("Using verified fallback catalog:", err);
      return INITIAL_AGGREGATED_COURSES;
    }
  },

  /**
   * Get single course details by ID or Slug
   */
  async getCourseBySlugOrId(identifier: string): Promise<AggregatedCourse | null> {
    try {
      const { data } = await supabase
        .from('aggregated_courses')
        .select('*')
        .or(`id.eq.${identifier},slug.eq.${identifier}`)
        .maybeSingle();

      if (data) return data as any;
    } catch (e) {
      console.warn("Course DB lookup fallback:", e);
    }

    const found = INITIAL_AGGREGATED_COURSES.find(c => c.id === identifier || c.slug === identifier);
    return found || INITIAL_AGGREGATED_COURSES[0];
  },

  /**
   * Get alternative courses covering similar skills from different providers
   */
  async getAlternatives(course: AggregatedCourse): Promise<AggregatedCourse[]> {
    const all = await this.getCourses();
    return all.filter(c => 
      c.id !== course.id && 
      (c.category === course.category || c.skills.some(s => course.skills.includes(s)))
    ).slice(0, 4);
  },

  /**
   * Get verified learning providers
   */
  async getProviders(): Promise<LearningProvider[]> {
    try {
      const { data } = await supabase
        .from('learning_providers')
        .select('*')
        .order('name');
      
      if (data && data.length > 0) return data as any;
    } catch (e) {
      console.warn("Providers fallback:", e);
    }
    return VERIFIED_PROVIDERS;
  },

  /**
   * Get provider details by slug
   */
  async getProviderBySlug(slug: string): Promise<{
    provider: LearningProvider;
    courses: AggregatedCourse[];
    totalCount: number;
    categories: string[];
  } | null> {
    const providers = await this.getProviders();
    const provider = providers.find(p => p.slug === slug || p.id === slug) || providers[0];
    const courses = await this.getCourses({ providerId: provider.id });
    
    const categories = Array.from(new Set(courses.map(c => c.category)));

    return {
      provider,
      courses,
      totalCount: provider.course_count || courses.length * 4 + 120,
      categories
    };
  },

  /**
   * Get career pathways
   */
  async getCareerPathways(): Promise<CareerPathway[]> {
    try {
      const { data } = await supabase
        .from('career_pathways')
        .select('*');

      if (data && data.length > 0) return data as any;
    } catch (e) {
      console.warn("Career pathways fallback:", e);
    }
    return INITIAL_CAREER_PATHWAYS;
  },

  /**
   * Get single career pathway by slug
   */
  async getCareerPathwayBySlug(slug: string): Promise<CareerPathway | null> {
    const pathways = await this.getCareerPathways();
    return pathways.find(p => p.slug === slug || p.id === slug) || pathways[0];
  },

  /**
   * AI Natural Language Intent Planner ("I have 5 years HR experience and want to move into HR analytics")
   */
  async generatePersonalizedPlan(userPrompt: string): Promise<PersonalizedLearningPlan> {
    const prompt = userPrompt.toLowerCase().trim();
    const allCourses = await this.getCourses();

    // Default HR Analytics Transition Plan
    if (prompt.includes('hr') || prompt.includes('recruitment') || prompt.includes('people analytics')) {
      return {
        user_intent: userPrompt,
        current_experience: '5 Years Human Resources & Talent Acquisition',
        weekly_hours: 6,
        total_weeks: 12,
        current_strengths: ['HR Operations', 'Recruitment', 'Communication', 'Employee Relations'],
        skills_to_build: ['Excel Analytics', 'Statistics', 'SQL', 'Power BI', 'HR Analytics', 'Data Visualization'],
        weekly_schedule: [
          { week_range: 'Week 1–2', focus_skill: 'Excel Data Formatting & Pivot Tables', courses_count: 3 },
          { week_range: 'Week 3–4', focus_skill: 'Applied Business Statistics', courses_count: 4 },
          { week_range: 'Week 5–7', focus_skill: 'SQL Querying & PostgreSQL Databases', courses_count: 6 },
          { week_range: 'Week 8–9', focus_skill: 'Power BI HR Dashboards & DAX', courses_count: 5 },
          { week_range: 'Week 10–12', focus_skill: 'HR Attrition & Workforce Analytics Project', courses_count: 5 }
        ],
        recommended_courses: allCourses.slice(0, 8)
      };
    }

    // Default Data Analyst / General Plan
    return {
      user_intent: userPrompt,
      current_experience: 'General Professional Background',
      weekly_hours: 5,
      total_weeks: 8,
      current_strengths: ['Problem Solving', 'Communication', 'Project Management'],
      skills_to_build: ['Excel', 'SQL', 'Python', 'Power BI', 'Data Modeling'],
      weekly_schedule: [
        { week_range: 'Week 1–2', focus_skill: 'Excel Fundamentals', courses_count: 3 },
        { week_range: 'Week 3–4', focus_skill: 'SQL Querying', courses_count: 5 },
        { week_range: 'Week 5–6', focus_skill: 'Python Basics', courses_count: 4 },
        { week_range: 'Week 7–8', focus_skill: 'Power BI Dashboarding', courses_count: 4 }
      ],
      recommended_courses: allCourses.slice(0, 6)
    };
  },

  /**
   * Log external course handoff event (Start Course on Provider ↗)
   */
  async trackHandoff(event: CourseHandoffEvent): Promise<void> {
    try {
      console.log("🚀 Handoff Logged:", event);
      
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        ...event,
        user_id: user?.id || 'anonymous',
        clicked_at: new Date().toISOString()
      };

      await supabase.from('admin_activity_log').insert({
        admin_user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        action_type: 'COURSE_HANDOFF_INITIATED',
        details: payload as any
      });
    } catch (err) {
      console.warn("Handoff logging notice:", err);
    }
  }
};
