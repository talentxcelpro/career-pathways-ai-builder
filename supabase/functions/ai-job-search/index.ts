import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  page?: number;
  limit?: number;
}

interface ParsedFilters {
  location?: string;
  remote?: boolean;
  employment_type?: string[];
  experience_level?: string[];
  min_salary?: number;
  max_salary?: number;
  skills?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1, limit = 50 }: SearchRequest = await req.json();

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Query must be at least 2 characters long' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Processing natural language job search:', { query, page, limit });

    // Parse natural language query to extract filters
    const parsedFilters = await parseNaturalLanguageQuery(query);
    console.log('📝 Parsed filters:', parsedFilters);

    // Use the enhanced job search function with parsed filters
    const { data: searchResults, error } = await supabase.rpc('ai_enhanced_job_search', {
      search_query: query,
      parsed_filters: parsedFilters,
      page_limit: limit,
      page_offset: (page - 1) * limit
    });

    if (error) {
      console.error('❌ Database search error:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Search failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform results to match expected format
    const jobs = searchResults?.map((job: any) => ({
      id: job.job_id,
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      is_remote: job.is_remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      skills_required: job.skills_required,
      description: job.description,
      posted_at: job.posted_at,
      relevance_score: job.relevance_score,
      company: {
        id: job.company_id,
        logo_url: job.company_logo,
        industry: job.company_industry
      }
    })) || [];

    console.log(`✅ Found ${jobs.length} jobs with relevance scoring`);

    return new Response(JSON.stringify({
      success: true,
      data: jobs,
      filters: parsedFilters,
      total_results: jobs.length,
      page,
      limit
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ AI job search error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function parseNaturalLanguageQuery(query: string): Promise<ParsedFilters> {
  const filters: ParsedFilters = {};
  const lowerQuery = query.toLowerCase();

  // Extract location information
  const locationMatches = [
    /in ([a-zA-Z\s]+?)(?:\s|$|,)/g,
    /from ([a-zA-Z\s]+?)(?:\s|$|,)/g,
    /at ([a-zA-Z\s]+?)(?:\s|$|,)/g,
    /(mumbai|bangalore|delhi|chennai|hyderabad|pune|kolkata|ahmedabad|surat|jaipur|lucknow|kanpur|nagpur|indore|thane|bhopal|visakhapatnam|pimpri)/gi
  ];

  for (const regex of locationMatches) {
    const matches = [...lowerQuery.matchAll(regex)];
    if (matches.length > 0) {
      filters.location = matches[0][1]?.trim() || matches[0][0]?.trim();
      break;
    }
  }

  // Check for remote work
  if (/remote|work from home|wfh|telecommute/i.test(query)) {
    filters.remote = true;
  }

  // Extract employment type
  if (/full.?time|permanent/i.test(query)) {
    filters.employment_type = ['Full-time'];
  } else if (/part.?time/i.test(query)) {
    filters.employment_type = ['Part-time'];
  } else if (/contract|freelance|consultant/i.test(query)) {
    filters.employment_type = ['Contract'];
  } else if (/intern|internship/i.test(query)) {
    filters.employment_type = ['Internship'];
  }

  // Extract experience level
  if (/entry.?level|junior|fresher|0.?2? years?|graduate|beginner/i.test(query)) {
    filters.experience_level = ['Entry Level'];
  } else if (/senior|lead|principal|architect|expert|5\+?\s*years?|experienced/i.test(query)) {
    filters.experience_level = ['Senior Level'];
  } else if (/mid.?level|intermediate|2.?5\s*years?|3.?5\s*years?/i.test(query)) {
    filters.experience_level = ['Mid Level'];
  }

  // Extract salary information
  const salaryMatch = query.match(/(\d+)(?:k|,000)?\s*(?:to|-)?\s*(\d+)?(?:k|,000)?\s*(?:lpa|per\s*annum|salary)?/i);
  if (salaryMatch) {
    const firstAmount = parseInt(salaryMatch[1]) * (salaryMatch[1].length <= 2 ? 1000 : 1);
    filters.min_salary = firstAmount;
    
    if (salaryMatch[2]) {
      const secondAmount = parseInt(salaryMatch[2]) * (salaryMatch[2].length <= 2 ? 1000 : 1);
      filters.max_salary = secondAmount;
    }
  }

  // Extract common skills and technologies
  const skillKeywords = [
    'react', 'angular', 'vue', 'javascript', 'typescript', 'python', 'java', 'php',
    'node.js', 'express', 'mongodb', 'mysql', 'postgresql', 'aws', 'azure', 'docker',
    'kubernetes', 'git', 'jenkins', 'ci/cd', 'devops', 'machine learning', 'ai',
    'data science', 'analytics', 'sql', 'nosql', 'redis', 'elasticsearch',
    'figma', 'sketch', 'photoshop', 'ui/ux', 'design', 'marketing', 'seo',
    'content writing', 'social media', 'digital marketing', 'sales', 'crm'
  ];

  const detectedSkills = skillKeywords.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(query)
  );

  if (detectedSkills.length > 0) {
    filters.skills = detectedSkills;
  }

  return filters;
}