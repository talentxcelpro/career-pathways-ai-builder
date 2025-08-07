import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface AdzunaJobResponse {
  results: Array<{
    id: string;
    title: string;
    company: {
      display_name: string;
    };
    location: {
      display_name: string;
    };
    description: string;
    salary_min?: number;
    salary_max?: number;
    created: string;
    redirect_url: string;
    category: {
      label: string;
    };
    contract_type?: string;
  }>;
  count: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`🚀 Edge function called: ${req.method} ${req.url}`);

  try {
    // Parse request body with better error handling for GET requests
    let requestBody = {};
    
    if (req.method === 'POST') {
      try {
        const text = await req.text();
        console.log('📝 Raw request body:', text);
        
        if (text) {
          requestBody = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'GET') {
      // For GET requests, use query parameters
      const url = new URL(req.url);
      requestBody = {
        limit: parseInt(url.searchParams.get('limit') || '50'),
        location: url.searchParams.get('location') || 'india',
        keywords: url.searchParams.get('keywords') || '',
        page: parseInt(url.searchParams.get('page') || '1')
      };
    }

    const { 
      limit = 50, 
      location = 'india', 
      keywords = '', 
      page = 1,
      salary_min,
      salary_max 
    } = requestBody;

    console.log('🌐 Adzuna Import Started:', { limit, location, keywords, page });

    // Validate Adzuna API credentials
    const adzunaAppId = Deno.env.get('ADZUNA_APP_ID');
    const adzunaAppKey = Deno.env.get('ADZUNA_APP_KEY');

    if (!adzunaAppId || !adzunaAppKey) {
      console.error('❌ Missing Adzuna API credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Adzuna API credentials not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate Supabase environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return new Response(JSON.stringify({
        success: false,
        error: 'Supabase credentials not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build Adzuna API URL
    const adzunaUrl = new URL(`https://api.adzuna.com/v1/api/jobs/in/search/${page}`);
    adzunaUrl.searchParams.set('app_id', adzunaAppId);
    adzunaUrl.searchParams.set('app_key', adzunaAppKey);
    adzunaUrl.searchParams.set('results_per_page', limit.toString());
    adzunaUrl.searchParams.set('where', location);
    
    if (keywords) {
      adzunaUrl.searchParams.set('what', keywords);
    }
    if (salary_min) {
      adzunaUrl.searchParams.set('salary_min', salary_min.toString());
    }
    if (salary_max) {
      adzunaUrl.searchParams.set('salary_max', salary_max.toString());
    }

    console.log('🔗 Fetching from Adzuna:', adzunaUrl.toString());

    // Fetch jobs from Adzuna with timeout and better error handling
    let adzunaResponse;
    try {
      adzunaResponse = await fetch(adzunaUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'TalentXcel-JobBot/1.0',
          'Accept': 'application/json'
        }
      });
    } catch (fetchError) {
      console.error('❌ Failed to fetch from Adzuna:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to connect to Adzuna API',
        details: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!adzunaResponse.ok) {
      const errorText = await adzunaResponse.text();
      console.error('❌ Adzuna API error:', adzunaResponse.status, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Adzuna API error: ${adzunaResponse.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adzunaData: AdzunaJobResponse = await adzunaResponse.json();
    console.log(`📊 Received ${adzunaData.results.length} jobs from Adzuna`);

    const jobsToInsert = [];
    const duplicatesSkipped = [];

    for (const adzunaJob of adzunaData.results) {
      try {
        // Check for existing job by external URL or title+company combination
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .or(`external_url.eq.${adzunaJob.redirect_url},and(title.eq.${adzunaJob.title},company_name.eq.${adzunaJob.company.display_name})`)
          .limit(1);

        if (existingJob && existingJob.length > 0) {
          duplicatesSkipped.push({
            title: adzunaJob.title,
            company: adzunaJob.company.display_name,
            reason: 'duplicate'
          });
          continue;
        }

        // Map employment types from Adzuna to our schema (using proper case format)
        const mapEmploymentType = (adzunaType: string) => {
          if (!adzunaType) return 'Full-time';
          
          const typeMap: { [key: string]: string } = {
            'permanent': 'Full-time',
            'full-time': 'Full-time', 
            'full_time': 'Full-time',
            'contract': 'Contract', 
            'temporary': 'Contract',
            'part-time': 'Part-time',
            'part_time': 'Part-time',
            'freelance': 'Freelance',
            'internship': 'Internship'
          };
          
          const normalizedType = adzunaType.toLowerCase().replace(/\s+/g, '_');
          return typeMap[normalizedType] || 'Full-time';
        };

        // Map Adzuna job to our schema with only existing columns
        const mappedJob = {
          title: adzunaJob.title,
          company_name: adzunaJob.company.display_name,
          location: adzunaJob.location.display_name,
          description: adzunaJob.description,
          salary_min: adzunaJob.salary_min || null,
          salary_max: adzunaJob.salary_max || null,
          salary_range: adzunaJob.salary_min && adzunaJob.salary_max 
            ? `₹${adzunaJob.salary_min.toLocaleString()} - ₹${adzunaJob.salary_max.toLocaleString()}`
            : null,
          external_url: adzunaJob.redirect_url,
          source: 'adzuna.com',
          is_external: true,
          job_status: 'open',
          is_active: true,
          employment_type: mapEmploymentType(adzunaJob.contract_type),
          category: adzunaJob.category?.label || 'general',
          is_featured: false,
          is_government_job: false,
          views_count: 0,
          applications_count: 0,
          posted_at: new Date(adzunaJob.created).toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        jobsToInsert.push(mappedJob);

      } catch (error) {
        console.error('Error processing Adzuna job:', adzunaJob.id, error);
        duplicatesSkipped.push({
          title: adzunaJob.title,
          company: adzunaJob.company.display_name,
          reason: 'processing_error'
        });
      }
    }

    console.log(`💾 Inserting ${jobsToInsert.length} new jobs`);

    // Insert jobs in batches
    const batchSize = 100;
    let insertedCount = 0;
    const errors = [];

    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      const batch = jobsToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('Batch insert error:', error);
        errors.push(error);
      } else {
        insertedCount += data?.length || 0;
      }
    }

    // Remove the whitelist update section completely since the table structure is unknown
    // and this is causing errors in the logs

    const summary = {
      total_fetched: adzunaData.results.length,
      inserted: insertedCount,
      duplicates_skipped: duplicatesSkipped.length,
      errors: errors.length,
      source: 'adzuna.com'
    };

    console.log('✅ Adzuna import completed:', summary);

    return new Response(JSON.stringify({
      success: true,
      summary,
      stats: {
        total_scraped: adzunaData.results.length,
        valid_jobs: jobsToInsert.length,
        published_jobs: insertedCount,
        next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // 3 hours from now
      },
      jobs: jobsToInsert.slice(0, 10), // Return first 10 for preview
      duplicates: duplicatesSkipped,
      errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Adzuna import comprehensive error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});