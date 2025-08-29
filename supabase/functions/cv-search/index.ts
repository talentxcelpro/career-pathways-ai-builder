import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://dthlgsnakhoftinssokm.supabase.co';
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

    const supabaseClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    });

    const { 
      searchTerm = '',
      filters = {},
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = await req.json();

    console.log('Search request:', { searchTerm, filters, page, limit });

    let query = supabaseClient
      .from('candidates')
      .select('*', { count: 'exact' });

    // Apply full-text search if search term provided
    if (searchTerm) {
      // Use PostgreSQL full-text search
      query = query.or(`
        name.ilike.%${searchTerm}%,
        title.ilike.%${searchTerm}%,
        company.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%,
        location.ilike.%${searchTerm}%
      `);
    }

    // Apply filters
    if (filters.source && filters.source.length > 0) {
      if (filters.source.includes('applied')) {
        query = query.eq('applied', true);
      } else if (filters.source.includes('platform')) {
        query = query.eq('applied', false);
      }
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters.location && filters.location.length > 0) {
      const locationConditions = filters.location.map((loc: string) => 
        `location.ilike.%${loc}%`
      ).join(',');
      query = query.or(locationConditions);
    }

    if (filters.companies && filters.companies.length > 0) {
      query = query.in('company', filters.companies);
    }

    if (filters.titles && filters.titles.length > 0) {
      const titleConditions = filters.titles.map((title: string) => 
        `title.ilike.%${title}%`
      ).join(',');
      query = query.or(titleConditions);
    }

    if (filters.hasResume === true) {
      query = query.not('resume_url', 'is', null);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'name', 'title', 'company', 'applied_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    
    query = query.order(sortColumn, { ascending: order === 'asc', nullsFirst: false });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: candidates, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // Get unique values for filters
    const { data: allCandidates } = await supabaseClient
      .from('candidates')
      .select('skills, location, company, title');

    const filterOptions = {
      skills: [...new Set(allCandidates?.flatMap(c => c.skills || []))].filter(Boolean),
      locations: [...new Set(allCandidates?.map(c => c.location).filter(Boolean))],
      companies: [...new Set(allCandidates?.map(c => c.company).filter(Boolean))],
      titles: [...new Set(allCandidates?.map(c => c.title).filter(Boolean))]
    };

    const totalPages = Math.ceil((count || 0) / limit);

    console.log(`Found ${candidates?.length || 0} candidates (${count} total)`);

    return new Response(
      JSON.stringify({
        candidates: candidates || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filterOptions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cv-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});