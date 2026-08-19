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
   * Helper to build affiliate / monetization tracking URL
   */
  getMonetizedUrl(originalUrl: string): string {
    try {
      const url = new URL(originalUrl);
      if (url.hostname.includes('microsoft.com')) {
        return originalUrl;
      }
      url.searchParams.set('ref', 'talentxcel');
      url.searchParams.set('utm_source', 'talentxcel_learning');
      url.searchParams.set('utm_medium', 'aggregator_handoff');
      url.searchParams.set('utm_campaign', 'career_intelligence');
      return url.toString();
    } catch {
      return originalUrl;
    }
  },

  /**
   * Convert prompt or designation string to clean slug
   */
  slugifyDesignation(input: string): string {
    let clean = input.toLowerCase()
      .replace(/i want to become a|i want to be a|how to become a|become a|become/gi, '')
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return clean || 'data-analyst';
  },

  /**
   * Convert slug back to Title Case Designation Name
   */
  unslugifyDesignation(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

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

      const { data, error } = await query;
      
      if (error) {
        console.warn("[TalentXcel DB Audit] public.aggregated_courses query notice:", error.message);
      }

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
      console.warn("[TalentXcel DB Audit] Database query error:", err);
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
      console.warn("Course DB lookup notice:", e);
    }

    const found = INITIAL_AGGREGATED_COURSES.find(c => c.id === identifier || c.slug === identifier);
    return found || INITIAL_AGGREGATED_COURSES[0];
  },

  /**
   * Get provider by Slug
   */
  async getProviderBySlug(slug: string): Promise<{ provider: LearningProvider; courses: AggregatedCourse[]; totalCount: number; categories: string[] } | null> {
    const provider = VERIFIED_PROVIDERS.find(p => p.slug === slug || p.id === slug) || VERIFIED_PROVIDERS[0];
    const courses = await this.getCourses({ providerId: provider.id });
    
    const categories = Array.from(new Set(courses.map(c => c.category)));

    return {
      provider: {
        ...provider,
        course_count: courses.length
      },
      courses,
      totalCount: courses.length,
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
      console.warn("Career pathways DB lookup notice:", e);
    }
    return INITIAL_CAREER_PATHWAYS;
  },

  /**
   * Get single career pathway by Slug
   */
  async getCareerPathwayBySlug(slug: string): Promise<CareerPathway | null> {
    const pathways = await this.getCareerPathways();
    const found = pathways.find(p => p.slug === slug || p.id === slug);
    return found || pathways[0];
  },

  /**
   * Log monetization handoff event to Supabase
   */
  async trackHandoff(event: CourseHandoffEvent): Promise<string> {
    const monetizedUrl = this.getMonetizedUrl(event.source_url);
    
    try {
      await supabase.from('course_handoff_events').insert({
        course_id: event.course_id,
        provider_id: event.provider_id,
        provider_name: event.provider_name,
        source_url: event.source_url,
        monetized_url: monetizedUrl,
        clicked_at: event.clicked_at || new Date().toISOString(),
        source_page: event.source_page || 'learning_hub'
      } as any);
    } catch (err) {
      console.warn("Handoff event logging notice:", err);
    }

    return monetizedUrl;
  },

  /**
   * Find course alternatives from other providers
   */
  async getAlternatives(targetCourse: AggregatedCourse): Promise<AggregatedCourse[]> {
    const allCourses = await this.getCourses();
    return allCourses.filter(c => 
      c.id !== targetCourse.id && 
      (c.category === targetCourse.category || c.skills.some(s => targetCourse.skills.includes(s)))
    ).slice(0, 3);
  }
};
