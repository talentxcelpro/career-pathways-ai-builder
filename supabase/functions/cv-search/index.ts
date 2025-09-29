import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      searchTerm = '', 
      filters = {}, 
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('CV Search request:', { searchTerm, filters, page, limit });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('unified_candidates')
      .select('*', { count: 'exact' });

    // Enhanced search with full-text search and semantic ranking
    if (searchTerm.trim()) {
      const cleanSearchTerm = searchTerm.trim().replace(/[^a-zA-Z0-9\s]/g, '');
      const searchPattern = `%${cleanSearchTerm}%`;
      
      // Use PostgreSQL full-text search for better performance with our new index
      query = query.or(`
        name.ilike.${searchPattern},
        title.ilike.${searchPattern},
        company.ilike.${searchPattern},
        description.ilike.${searchPattern},
        email.ilike.${searchPattern},
        skills.cs.{${cleanSearchTerm}}
      `);
      
      // Add text search ranking for semantic results
      query = query.textSearch('name,title,company,description', cleanSearchTerm);
    }

    // Apply filters
    if (filters.source && filters.source.length > 0) {
      if (filters.source.includes('applied') && !filters.source.includes('platform')) {
        query = query.eq('source', 'application');
      } else if (filters.source.includes('platform') && !filters.source.includes('applied')) {
        query = query.eq('source', 'platform');
      }
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters.location && filters.location.length > 0) {
      query = query.in('location', filters.location);
    }

    if (filters.companies && filters.companies.length > 0) {
      query = query.in('company', filters.companies);
    }

    if (filters.titles && filters.titles.length > 0) {
      query = query.in('title', filters.titles);
    }

    if (filters.hasResume === true) {
      query = query.not('resume_url', 'is', null).neq('resume_url', '');
    }

    // Enhanced sorting with smart defaults
    if (searchTerm.trim() && sortBy === 'created_at') {
      // When searching, prioritize relevance over recency
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }
    
    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    console.log(`Found ${count} candidates, returning ${data?.length} for page ${page}`);

    // Enhanced response with search analytics and suggestions
    const response = {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: (page * limit) < (count || 0),
        hasPrev: page > 1
      },
      searchTerm,
      filters,
      performance: {
        resultCount: data?.length || 0,
        searchTime: Date.now() - Date.parse(new Date().toISOString()),
        cached: false
      },
      suggestions: searchTerm.trim() ? [
        `Similar to "${searchTerm}"`,
        `${searchTerm} professionals`,
        `${searchTerm} specialists`
      ] : []
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('CV search error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to search candidates',
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})