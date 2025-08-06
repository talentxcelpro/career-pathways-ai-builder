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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      limit = 50, 
      location = 'india', 
      keywords = '', 
      page = 1,
      salary_min,
      salary_max 
    } = await req.json();

    console.log('🌐 Adzuna Import Started:', { limit, location, keywords, page });

    // Get Adzuna API credentials
    const adzunaAppId = Deno.env.get('ADZUNA_APP_ID');
    const adzunaAppKey = Deno.env.get('ADZUNA_APP_KEY');

    if (!adzunaAppId || !adzunaAppKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Fetch jobs from Adzuna
    const adzunaResponse = await fetch(adzunaUrl.toString());
    
    if (!adzunaResponse.ok) {
      throw new Error(`Adzuna API error: ${adzunaResponse.status} ${adzunaResponse.statusText}`);
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

        // Map Adzuna job to our schema
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
          status: 'active',
          employment_type: adzunaJob.contract_type || 'full_time',
          category: adzunaJob.category?.label || 'general',
          is_featured: false,
          is_government_job: false,
          views_count: 0,
          applications_count: 0,
          posted_at: new Date(adzunaJob.created),
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

    // Update job source whitelist for Adzuna if not exists
    const { error: whitelistError } = await supabase
      .from('job_source_whitelist')
      .upsert({
        domain: 'adzuna.com',
        is_trusted: true,
        verification_notes: 'Official Adzuna API integration',
        verified_by: 'system'
      }, { onConflict: 'domain' });

    if (whitelistError) {
      console.warn('Failed to update whitelist:', whitelistError);
    }

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
    console.error('Adzuna import error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});