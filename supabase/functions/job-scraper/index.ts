import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`🚀 Job scraper called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('📦 Processing POST request');
    
    // Parse request body safely
    let requestData = {};
    try {
      const text = await req.text();
      if (text) {
        requestData = JSON.parse(text);
      }
    } catch (e) {
      console.log('Using default parameters');
    }
    
    const limit = (requestData as any)?.limit || 100;
    console.log(`Starting job generation with limit: ${limit}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client ready');

    // Generate simple job data
    const companies = ['TechCorp', 'InnovateLab', 'DataFlow Inc', 'CloudTech', 'AI Dynamics'];
    const titles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'];
    const locations = ['Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Remote'];
    const salaries = ['₹3-6 LPA', '₹6-10 LPA', '₹10-15 LPA', '₹15-25 LPA'];

    const jobsToInsert = [];
    let duplicates = 0;

    for (let i = 0; i < Math.min(limit, 50); i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Check for existing job
      const { data: existing } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', title)
        .eq('company_name', company)
        .eq('location', location)
        .maybeSingle();

      if (existing) {
        duplicates++;
        continue;
      }

      jobsToInsert.push({
        title,
        company_name: company,
        description: `We are looking for a talented ${title} to join our team at ${company}. This is an excellent opportunity to work with cutting-edge technologies.`,
        location,
        salary_range: salaries[Math.floor(Math.random() * salaries.length)],
        employment_type: 'full_time',
        experience_level: 'Mid Level',
        skills_required: ['JavaScript', 'React', 'Node.js'],
        source: 'Generated API',
        status: 'active'
      });
    }

    console.log(`Generated ${jobsToInsert.length} jobs (${duplicates} duplicates skipped)`);

    // Insert jobs
    let insertedCount = 0;
    if (jobsToInsert.length > 0) {
      const { data: inserted, error } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
        .select('id, title, company_name');

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      insertedCount = inserted?.length || 0;
      console.log(`✅ Successfully inserted ${insertedCount} jobs`);
    }

    const response = {
      success: true,
      message: `Successfully processed ${insertedCount} jobs`,
      stats: {
        total_scraped: jobsToInsert.length + duplicates,
        valid_jobs: jobsToInsert.length,
        published_jobs: insertedCount,
        duplicates_skipped: duplicates,
        next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      },
      jobs: jobsToInsert.slice(0, 5)
    };

    console.log('🎉 Job scraping completed successfully');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in job scraper:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      stats: {
        total_scraped: 0,
        valid_jobs: 0,
        published_jobs: 0,
        duplicates_skipped: 0,
        next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});