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
   * Dynamic Career Pathway Lookup / Synthesizer for ANY Designation
   */
  async getCareerPathwayBySlug(slug: string): Promise<CareerPathway> {
    const pathways = await this.getCareerPathways();
    const found = pathways.find(p => p.slug === slug || p.id === slug);
    if (found) return found;

    // Dynamically synthesize a custom pathway for any designation
    const title = this.unslugifyDesignation(slug);
    const allCourses = await this.getCourses();

    return {
      id: `path-dynamic-${slug}`,
      slug: slug,
      title: `Become a ${title}`,
      target_role: title,
      description: `Master core operational methodologies, data analytics, process management, and strategic leadership required for ${title} roles.`,
      average_salary: '$85,000 - $150,000 / year (₹10 - ₹28 LPA)',
      estimated_weeks: 10,
      total_free_courses: 4,
      steps: [
        {
          step_number: 1,
          skill_name: `${title} Fundamentals & Core Strategy`,
          target_level: 'Beginner',
          recommended_course_id: allCourses[0]?.id || 'course-google-data-analytics-intro',
          duration_text: '12 Hours',
          reason: `Build foundational competencies, industry standards, and workflows for ${title} roles.`
        },
        {
          step_number: 2,
          skill_name: 'Data Analytics & Business Intelligence',
          target_level: 'Intermediate',
          recommended_course_id: 'course-ms-powerbi-data-analyst',
          duration_text: '6 Hours',
          reason: `Learn how to measure KPIs, build interactive executive dashboards, and track operational metrics.`
        },
        {
          step_number: 3,
          skill_name: 'Artificial Intelligence & Process Automation',
          target_level: 'Intermediate',
          recommended_course_id: 'course-ibm-ai-foundations',
          duration_text: '7 Hours',
          reason: `Leverage Generative AI and automated tooling to drive productivity and team efficiency.`
        }
      ]
    };
  },

  /**
   * AI Natural Language Intent Planner ("I want to become a Sales manager")
   */
  async generatePersonalizedPlan(userPrompt: string): Promise<PersonalizedLearningPlan> {
    const prompt = userPrompt.toLowerCase().trim();
    const slug = this.slugifyDesignation(userPrompt);
    const roleTitle = this.unslugifyDesignation(slug);
    const allCourses = await this.getCourses();

    // 1. Sales / Business Development / Sales Manager
    if (prompt.includes('sales') || prompt.includes('business development') || prompt.includes('account manager') || prompt.includes('crm')) {
      return {
        user_intent: userPrompt,
        current_experience: 'Sales & Client Relations Background',
        weekly_hours: 6,
        total_weeks: 8,
        current_strengths: ['Customer Relationship Management', 'Negotiation', 'Communication', 'Pipeline Management'],
        skills_to_build: ['Sales Analytics', 'Salesforce CRM', 'Data-Driven Forecasting', 'Power BI Dashboards', 'Lead Generation'],
        weekly_schedule: [
          { week_range: 'Week 1–2', focus_skill: 'Salesforce CRM & Pipeline Management', courses_count: 3 },
          { week_range: 'Week 3–5', focus_skill: 'Sales Analytics & Revenue Forecasting', courses_count: 4 },
          { week_range: 'Week 6–8', focus_skill: 'Executive Leadership & Key Account Strategy', courses_count: 4 }
        ],
        recommended_courses: allCourses.slice(0, 6),
        matched_pathway_slug: slug
      };
    }

    // 2. VP / Operations / Executive leadership intent
    if (prompt.includes('president') || prompt.includes('operation') || prompt.includes('executive') || prompt.includes('vp') || prompt.includes('chief') || prompt.includes('head')) {
      return {
        user_intent: userPrompt,
        current_experience: 'Senior Professional / Leadership Track',
        weekly_hours: 8,
        total_weeks: 12,
        current_strengths: ['Operations Strategy', 'Team Leadership', 'Resource Allocation', 'Project Execution'],
        skills_to_build: ['Strategic Business Intelligence', 'Power BI Executive Dashboards', 'AI for Leaders', 'Process Optimization', 'P&L Data Analytics'],
        weekly_schedule: [
          { week_range: 'Week 1–3', focus_skill: 'Enterprise Business Intelligence & Power BI', courses_count: 4 },
          { week_range: 'Week 4–7', focus_skill: 'Data-Driven Process Optimization & Analytics', courses_count: 5 },
          { week_range: 'Week 8–12', focus_skill: 'Executive Artificial Intelligence & Automation Strategy', courses_count: 6 }
        ],
        recommended_courses: allCourses.slice(0, 6),
        matched_pathway_slug: slug
      };
    }

    // 3. AI / ML intent
    if (prompt.includes('ai') || prompt.includes('machine learning') || prompt.includes('ml') || prompt.includes('llm') || prompt.includes('prompt')) {
      return {
        user_intent: userPrompt,
        current_experience: 'Technology / Engineering Background',
        weekly_hours: 7,
        total_weeks: 10,
        current_strengths: ['Problem Solving', 'Python Basics', 'Analytical Mindset'],
        skills_to_build: ['Generative AI', 'Large Language Models (LLMs)', 'Prompt Engineering', 'PyTorch', 'AWS Cloud Infrastructure'],
        weekly_schedule: [
          { week_range: 'Week 1–2', focus_skill: 'Python & CS Foundations', courses_count: 3 },
          { week_range: 'Week 3–6', focus_skill: 'Generative AI & Machine Learning', courses_count: 5 },
          { week_range: 'Week 7–10', focus_skill: 'Cloud AI Model Deployment', courses_count: 4 }
        ],
        recommended_courses: allCourses.filter(c => c.category.includes('AI') || c.skills.includes('Python')),
        matched_pathway_slug: slug
      };
    }

    // 4. Software Developer intent
    if (prompt.includes('software') || prompt.includes('developer') || prompt.includes('programmer') || prompt.includes('coder') || prompt.includes('web')) {
      return {
        user_intent: userPrompt,
        current_experience: 'Tech & Development Interest',
        weekly_hours: 10,
        total_weeks: 10,
        current_strengths: ['Logic', 'Problem Solving', 'Git Fundamentals'],
        skills_to_build: ['Computer Science', 'Python', 'PostgreSQL', 'Algorithms', 'System Design'],
        weekly_schedule: [
          { week_range: 'Week 1–4', focus_skill: 'Computer Science & Python Foundations', courses_count: 4 },
          { week_range: 'Week 5–8', focus_skill: 'Relational Databases & PostgreSQL', courses_count: 4 },
          { week_range: 'Week 9–10', focus_skill: 'Full-Stack Architecture & Cloud', courses_count: 3 }
        ],
        recommended_courses: allCourses.filter(c => c.category.includes('Programming')),
        matched_pathway_slug: slug
      };
    }

    // 5. Cybersecurity intent
    if (prompt.includes('security') || prompt.includes('cyber') || prompt.includes('soc') || prompt.includes('hacking')) {
      return {
        user_intent: userPrompt,
        current_experience: 'IT Operations & Networking Interest',
        weekly_hours: 6,
        total_weeks: 8,
        current_strengths: ['Network Troubleshooting', 'Systems Administration'],
        skills_to_build: ['Network Defense', 'Firewalls', 'Threat Mitigation', 'Security Protocols'],
        weekly_schedule: [
          { week_range: 'Week 1–3', focus_skill: 'Cisco Network Security Fundamentals', courses_count: 3 },
          { week_range: 'Week 4–8', focus_skill: 'Threat Prevention & Enterprise Defense', courses_count: 4 }
        ],
        recommended_courses: allCourses.filter(c => c.category.includes('Cybersecurity')),
        matched_pathway_slug: slug
      };
    }

    // 6. Generic Dynamic Designation Fallback for ANY job title (e.g. Sales Manager, Product Designer, HR Manager, Mechanical Engineer)
    return {
      user_intent: userPrompt,
      current_experience: `Professional Experience in ${roleTitle}`,
      weekly_hours: 6,
      total_weeks: 8,
      current_strengths: ['Problem Solving', 'Strategic Execution', 'Team Collaboration', 'Communication'],
      skills_to_build: [`${roleTitle} Core Strategy`, 'Data Analytics', 'Business Intelligence', 'Process Optimization'],
      weekly_schedule: [
        { week_range: 'Week 1–2', focus_skill: `${roleTitle} Strategy & Industry Workflows`, courses_count: 3 },
        { week_range: 'Week 3–5', focus_skill: 'Data Analytics & Metric Dashboards', courses_count: 4 },
        { week_range: 'Week 6–8', focus_skill: 'AI Tooling & Automation Execution', courses_count: 4 }
      ],
      recommended_courses: allCourses.slice(0, 6),
      matched_pathway_slug: slug
    };
  },

  /**
   * Log external course handoff event with monetization referral tracking
   */
  async trackHandoff(event: CourseHandoffEvent): Promise<string> {
    const monetizedUrl = this.getMonetizedUrl(event.source_url);
    try {
      console.log("🚀 Monetized Handoff Logged:", { ...event, monetized_url: monetizedUrl });
      
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        ...event,
        monetized_url: monetizedUrl,
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
    return monetizedUrl;
  }
};
