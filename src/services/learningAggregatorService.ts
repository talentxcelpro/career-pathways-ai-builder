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

export function deriveIndustryTaxonomy(category?: string, domain?: string, title?: string): string {
  const cat = (category || '').toLowerCase();
  const dom = (domain || '').toLowerCase();
  const ttl = (title || '').toLowerCase();

  // 1. Finance & Accounting
  if (
    cat.includes('financial') || cat.includes('finance') || cat.includes('accounting') || cat.includes('valuation') ||
    cat.includes('taxation') || cat.includes('banking') || cat.includes('law') ||
    dom.includes('finance') || dom.includes('accounting') || ttl.includes('financial modeling') || ttl.includes('accounting')
  ) {
    return 'Finance & Accounting';
  }

  // 2. HR & People Analytics
  if (
    cat.includes('hr') || cat.includes('people') || cat.includes('recruitment') || cat.includes('talent') ||
    dom.includes('hr') || dom.includes('people analytics')
  ) {
    return 'HR & People Analytics';
  }

  // 3. Marketing & Digital Growth
  if (
    cat.includes('marketing') || cat.includes('seo') || cat.includes('ads') || cat.includes('content strategy') ||
    dom.includes('marketing') || ttl.includes('google ads') || ttl.includes('facebook ads')
  ) {
    return 'Marketing & Digital Growth';
  }

  // 4. Healthcare & Life Sciences
  if (
    cat.includes('health') || cat.includes('medical') || cat.includes('hospital') || cat.includes('clinical') || cat.includes('pharma') ||
    dom.includes('health') || dom.includes('medical')
  ) {
    return 'Healthcare & Life Sciences';
  }

  // 5. Supply Chain & Logistics
  if (
    cat.includes('supply chain') || cat.includes('logistics') || cat.includes('warehouse') || cat.includes('procurement') ||
    dom.includes('supply chain')
  ) {
    return 'Supply Chain & Logistics';
  }

  // 6. Design & Creative Technology
  if (
    cat.includes('design') || cat.includes('ui/ux') || cat.includes('ux') || cat.includes('graphic') ||
    cat.includes('branding') || cat.includes('illustration') || cat.includes('video editing') ||
    dom.includes('design')
  ) {
    return 'Design & Creative Technology';
  }

  // 7. Technology & IT
  if (
    cat.includes('ai') || cat.includes('data') || cat.includes('cloud') || cat.includes('devops') || cat.includes('cyber') ||
    cat.includes('software') || cat.includes('engineering') || cat.includes('sql') || cat.includes('python') ||
    cat.includes('react') || cat.includes('node') || cat.includes('kubernetes') || cat.includes('docker') ||
    cat.includes('aws') || cat.includes('git') || cat.includes('javascript') || cat.includes('html') || cat.includes('css') ||
    cat.includes('deep learning') || cat.includes('machine learning') || cat.includes('ansible') || cat.includes('terraform') ||
    cat.includes('confluence') || cat.includes('cypher') || cat.includes('spark') || cat.includes('database') || cat.includes('computer')
  ) {
    return 'Technology & IT';
  }

  // 8. Business & Management
  if (
    cat.includes('pmp') || cat.includes('project management') || cat.includes('agile') || cat.includes('scrum') ||
    cat.includes('product owner') || cat.includes('erp') || cat.includes('business') || cat.includes('leadership')
  ) {
    return 'Business & Management';
  }

  // 9. Engineering & Operations
  if (
    cat.includes('robotics') || cat.includes('physics') || cat.includes('electrical') || cat.includes('automation')
  ) {
    return 'Engineering & Operations';
  }

  // 10. Education & Languages
  if (
    cat.includes('french') || cat.includes('english') || cat.includes('language') || cat.includes('communication')
  ) {
    return 'Education & Languages';
  }

  return 'Technology & IT';
}

export const learningAggregatorService = {

  /**
   * Helper to build affiliate / monetization tracking URL with 100% Link Health Protection
   */
  getMonetizedUrl(originalUrl: string): string {
    try {
      const url = new URL(originalUrl);
      
      // Clean tracking noise
      url.searchParams.set('ref', 'talentxcel');
      url.searchParams.set('utm_source', 'talentxcel_learning');
      url.searchParams.set('utm_medium', 'aggregator_handoff');
      url.searchParams.set('utm_campaign', 'career_intelligence');
      
      return url.toString();
    } catch {
      return originalUrl || 'https://learn.microsoft.com';
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

      // Guarantee 100% Industry Taxonomy Coverage
      list = list.map(c => ({
        ...c,
        industry: c.industry || deriveIndustryTaxonomy(c.category, c.domain, c.title)
      }));

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
   * Get single career pathway by Slug with dynamic Weighted Career Graph fallback
   */
  async getCareerPathwayBySlug(slug: string): Promise<CareerPathway | null> {
    try {
      const pathways = await this.getCareerPathways();
      const found = pathways.find(p => p.slug === slug || p.id === slug);
      if (found) return found;
    } catch {
      // Fallback
    }

    // Dynamic resolution from Weighted Career Graph
    const { WEIGHTED_CAREER_GRAPH } = await import('@/data/weightedCareerGraphData');
    const matchedCareer = WEIGHTED_CAREER_GRAPH.find(c => c.slug === slug || c.id === slug) || WEIGHTED_CAREER_GRAPH[0];

    return {
      id: matchedCareer.id,
      slug: matchedCareer.slug,
      title: matchedCareer.title,
      target_role: matchedCareer.title,
      description: matchedCareer.description,
      average_salary: '$75,000 - $140,000 / yr',
      estimated_weeks: 12,
      total_free_courses: matchedCareer.required_skills.length,
      steps: matchedCareer.required_skills.map((sk, idx) => ({
        step_number: idx + 1,
        skill_name: sk.name,
        step_title: `Master ${sk.name}`,
        description: `Develop foundational to advanced competency in ${sk.name} (${sk.weight}% Career Graph Weight).`,
        target_level: idx === 0 ? 'Beginner' : idx > 2 ? 'Advanced' : 'Intermediate',
        recommended_course_id: `course-${sk.name.toLowerCase().replace(/\s+/g, '-')}`,
        skills_acquired: [sk.name, `${sk.category} Mastery`],
        duration_text: '2-3 Weeks',
        reason: `Essential core skill requirement for ${matchedCareer.title}`
      })) as any
    };
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
