import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchFilters {
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType = 'jobs' } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompts = {
      jobs: `You are a smart job search assistant. Convert natural language job searches into structured filters.
      
Examples:
- "remote data analyst jobs in Mumbai with salary above 10 LPA" → {"query": "data analyst", "location": "Mumbai", "remote": true, "min_salary": 1000000}
- "entry level software engineer positions" → {"query": "software engineer", "experience_level": ["entry"], "employment_type": ["full-time"]}
- "UI/UX designer jobs at startups" → {"query": "UI UX designer", "company": "startup"}
- "part time marketing intern" → {"query": "marketing intern", "employment_type": ["part-time", "internship"]}

Extract these fields when relevant: query, location, remote, employment_type, experience_level, skills, min_salary, max_salary, industry, company.
Salary should be in INR (1 LPA = 100000). Experience levels: entry, mid, senior, executive.
Employment types: full-time, part-time, contract, internship, freelance.`,

      people: `You are a networking search assistant. Convert natural language people searches into structured filters.
      
Examples:
- "software engineers at Google in Bangalore" → {"query": "software engineer", "company": "Google", "location": "Bangalore"}
- "product managers with 5+ years experience" → {"query": "product manager", "years_experience": 5}
- "UI designers in startups" → {"query": "UI designer", "company": "startup"}
- "data scientists with Python skills" → {"query": "data scientist", "skills": ["Python"]}

Extract: query, location, company, skills, years_experience, industry, education_level.`,

      companies: `You are a company search assistant. Convert natural language company searches into structured filters.
      
Examples:
- "startups hiring ML engineers" → {"query": "startup", "industry": "technology", "skills": ["machine learning"]}
- "fintech companies in Mumbai" → {"query": "fintech", "location": "Mumbai", "industry": "financial services"}
- "remote-first companies" → {"query": "remote", "remote": true}
- "companies with good benefits" → {"query": "benefits"}

Extract: query, location, industry, remote, company size, founding year range.`,

      learning: `You are a learning search assistant. Convert natural language course searches into structured filters.
      
Examples:
- "Python courses for beginners" → {"query": "Python", "difficulty_level": "beginner"}
- "AI and machine learning in 3 months" → {"query": "AI machine learning", "duration_months": 3}
- "free web development courses" → {"query": "web development", "is_free": true}
- "data science certification" → {"query": "data science", "has_certificate": true}

Extract: query, difficulty_level, duration_months, is_free, has_certificate, category, skills.`,

      network: `You are a network search assistant. Convert natural language network searches into structured filters.
      
Examples:
- "posts about React development" → {"query": "React development"}
- "career advice posts" → {"query": "career advice"}
- "job opportunities in AI" → {"query": "AI jobs"}
- "networking events in Bangalore" → {"query": "networking events", "location": "Bangalore"}

Extract: query, location, post_type, hashtags, user_role.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompts[searchType as keyof typeof systemPrompts] || systemPrompts.jobs
          },
          { 
            role: 'user', 
            content: `Convert this search query to structured filters (return only valid JSON): "${query}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    // Parse the AI response as JSON
    let parsedFilters: Partial<SearchFilters>;
    try {
      // Remove any markdown formatting if present
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      parsedFilters = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to basic search
      parsedFilters = { query: query.toLowerCase() };
    }

    // Add search type and ensure query is set
    const result: SearchFilters = {
      ...parsedFilters,
      search_type: searchType as SearchFilters['search_type'],
      query: parsedFilters.query || query
    };

    return new Response(
      JSON.stringify({ filters: result, original_query: query }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-search-parser:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Search parsing failed', 
        details: error.message,
        filters: { query: '', search_type: 'jobs' } // Fallback
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});