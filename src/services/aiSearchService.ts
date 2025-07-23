import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  query?: string;
  location?: string;
  remote?: boolean;
  employment_type?: string[];
  experience_level?: string[];
  skills?: string[];
  min_salary?: number;
  max_salary?: number;
  industry?: string;
  company?: string;
  job_type?: string;
  education_level?: string;
  years_experience?: number;
  search_type: 'jobs' | 'people' | 'companies' | 'learning' | 'network';
  difficulty_level?: string;
  duration_months?: number;
  is_free?: boolean;
  has_certificate?: boolean;
  category?: string;
  post_type?: string;
  hashtags?: string[];
  user_role?: string;
}

export class AISearchService {
  private static async parseQuery(query: string, searchType: SearchFilters['search_type']): Promise<SearchFilters> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-parser', {
        body: { query, searchType }
      });

      if (error) {
        console.error('AI search parsing error:', error);
        return { query: query.toLowerCase(), search_type: searchType };
      }

      return data.filters;
    } catch (error) {
      console.error('Failed to parse search query:', error);
      return { query: query.toLowerCase(), search_type: searchType };
    }
  }

  static async searchJobs(query: string) {
    const filters = await this.parseQuery(query, 'jobs');
    
    let dbQuery = supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry
        )
      `)
      .eq('is_active', true)
      .eq('job_status', 'open');

    // Apply parsed filters
    if (filters.query) {
      dbQuery = dbQuery.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    
    if (filters.location) {
      dbQuery = dbQuery.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.remote !== undefined) {
      dbQuery = dbQuery.eq('is_remote', filters.remote);
    }
    
    if (filters.employment_type && filters.employment_type.length > 0) {
      dbQuery = dbQuery.in('employment_type', filters.employment_type);
    }
    
    if (filters.experience_level && filters.experience_level.length > 0) {
      dbQuery = dbQuery.in('experience_level', filters.experience_level);
    }
    
    if (filters.min_salary && filters.min_salary > 0) {
      dbQuery = dbQuery.gte('salary_min', filters.min_salary);
    }
    
    if (filters.max_salary && filters.max_salary > 0) {
      dbQuery = dbQuery.lte('salary_max', filters.max_salary);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      const skillFilters = filters.skills.map(skill => `skills_required.cs.{"${skill}"}`);
      dbQuery = dbQuery.or(skillFilters.join(','));
    }

    const { data, error } = await dbQuery
      .order('posted_at', { ascending: false })
      .limit(50);

    return { data: data || [], error, filters };
  }

  static async searchCompanies(query: string) {
    const filters = await this.parseQuery(query, 'companies');
    
    let dbQuery = supabase
      .from('companies')
      .select('*');

    if (filters.query) {
      dbQuery = dbQuery.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,industry.ilike.%${filters.query}%`);
    }
    
    if (filters.location) {
      dbQuery = dbQuery.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.industry) {
      dbQuery = dbQuery.ilike('industry', `%${filters.industry}%`);
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error, filters };
  }

  static async searchCourses(query: string) {
    const filters = await this.parseQuery(query, 'learning');
    
    let dbQuery = supabase
      .from('courses')
      .select('*')
      .eq('is_active', true);

    if (filters.query) {
      dbQuery = dbQuery.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    
    if (filters.difficulty_level) {
      dbQuery = dbQuery.eq('difficulty_level', filters.difficulty_level);
    }
    
    if (filters.category) {
      dbQuery = dbQuery.eq('category', filters.category);
    }
    
    if (filters.is_free !== undefined) {
      dbQuery = dbQuery.eq('is_free', filters.is_free);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      const skillFilters = filters.skills.map(skill => `skills_taught.cs.{"${skill}"}`);
      dbQuery = dbQuery.or(skillFilters.join(','));
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error, filters };
  }

  static async searchPeople(query: string) {
    const filters = await this.parseQuery(query, 'people');
    
    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name, email, user_role, about, profile_photo_url, location, skills, current_company')
      .not('full_name', 'is', null)
      .neq('full_name', '');

    if (filters.query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${filters.query}%,about.ilike.%${filters.query}%,current_company.ilike.%${filters.query}%`);
    }
    
    if (filters.location) {
      dbQuery = dbQuery.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      const skillFilters = filters.skills.map(skill => `skills.cs.{"${skill}"}`);
      dbQuery = dbQuery.or(skillFilters.join(','));
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error, filters };
  }

  static async searchPeopleBasic(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_role, about, profile_photo_url, location, skills, current_company')
      .not('full_name', 'is', null)
      .neq('full_name', '')
      .or(`full_name.ilike.%${query}%,about.ilike.%${query}%,current_company.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error };
  }

  static async getAllPeople() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, user_role, about, profile_photo_url, location, skills, current_company')
      .not('full_name', 'is', null)
      .neq('full_name', '')
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error };
  }

  static async searchPosts(query: string) {
    const filters = await this.parseQuery(query, 'network');
    
    let dbQuery = supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey (
          id,
          full_name,
          avatar_url,
          user_role
        )
      `);

    if (filters.query) {
      dbQuery = dbQuery.or(`content.ilike.%${filters.query}%,title.ilike.%${filters.query}%`);
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data || [], error, filters };
  }

  static getSearchSuggestions(searchType: SearchFilters['search_type']) {
    const suggestions = {
      jobs: [
        'remote software engineer jobs',
        'data analyst positions in Mumbai',
        'UI/UX designer jobs at startups',
        'entry level marketing roles',
        'full stack developer with React',
        'product manager 3+ years experience',
        'part time content writer jobs',
        'senior data scientist positions'
      ],
      companies: [
        'startups hiring developers',
        'fintech companies in Bangalore',
        'remote-first companies',
        'AI companies with good culture',
        'unicorn startups in India',
        'companies with flexible hours'
      ],
      learning: [
        'Python courses for beginners',
        'free web development courses',
        'AI and machine learning certification',
        'data science bootcamp',
        'React Native mobile development',
        'digital marketing courses'
      ],
      people: [
        'software engineers at Google',
        'product managers in fintech',
        'UI designers with Figma skills',
        'data scientists with Python',
        'startup founders in Bangalore',
        'marketing professionals'
      ],
      network: [
        'career advice posts',
        'job opportunities in AI',
        'startup funding news',
        'tech industry insights',
        'remote work tips',
        'interview preparation'
      ]
    };

    return suggestions[searchType] || suggestions.jobs;
  }
}
