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
    const employmentTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
    const experienceLevels = ['fresher', 'mid-level', 'senior-level', 'executive'];
    
    console.log('✅ Using employment types:', employmentTypes);
    console.log('✅ Using experience levels:', experienceLevels);

    const jobsToInsert = [];

    for (let i = 0; i < Math.min(limit, 50); i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      // Force normalize to ensure DB constraint compliance
      const normalizeEmploymentType = (type) => {
        const map = {
          'full-time': 'full-time', 'part-time': 'part-time', 'contract': 'contract',
          'freelance': 'freelance', 'internship': 'internship', 'temporary': 'temporary',
          'Full-Time': 'full-time', 'Part-Time': 'part-time', 'Contract': 'contract',
          'Freelance': 'freelance', 'Internship': 'internship', 'Temporary': 'temporary'
        };
        return map[type] || 'full-time';
      };
      
      const normalizeExperienceLevel = (level) => {
        const map = {
          'fresher': 'fresher', 'mid-level': 'mid-level', 'senior-level': 'senior-level', 'executive': 'executive',
          'Fresher': 'fresher', 'Mid-Level': 'mid-level', 'Senior-Level': 'senior-level', 'Executive': 'executive',
          'Mid Level': 'mid-level', 'Senior Level': 'senior-level', 'Entry Level': 'fresher', 'entry-level': 'fresher'
        };
        return map[level] || 'fresher';
      };

      const rawEmploymentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
      const rawExperienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
      
      const selectedEmploymentType = normalizeEmploymentType(rawEmploymentType);
      const selectedExperienceLevel = normalizeExperienceLevel(rawExperienceLevel);
      
      console.log(`✅ Normalized job values: employment_type="${selectedEmploymentType}", experience_level="${selectedExperienceLevel}"`);

      jobsToInsert.push({
        title: title,              // Add this for NOT NULL constraint
        job_title: title,          // Keep this for unique constraint
        company_name: company,
        description: `We are looking for a talented ${title} to join our team at ${company}. This is an excellent opportunity to work with cutting-edge technologies.`,
        location,
        salary_range: salaries[Math.floor(Math.random() * salaries.length)],
        employment_type: selectedEmploymentType,
        experience_level: selectedExperienceLevel,
        skills_required: ['JavaScript', 'React', 'Node.js'],
        source: 'Generated API',
        status: 'active',
        date_posted: new Date().toISOString(),
        is_active: true,
        expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Deduplicate jobs before upserting to avoid "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    console.log(`Generated ${jobsToInsert.length} jobs before deduplication`);
    
    const deduplicatedJobs = Object.values(
      jobsToInsert.reduce((acc, job) => {
        // Use combination of job_title, company_name, and location as unique key
        const uniqueKey = `${job.job_title}-${job.company_name}-${job.location}`.toLowerCase();
        acc[uniqueKey] = job; // If duplicate, last one wins
        return acc;
      }, {} as Record<string, any>)
    );
    
    console.log(`After deduplication: ${deduplicatedJobs.length} unique jobs`);

    // Use upsert instead of insert to handle duplicates
    let insertedCount = 0;
    if (deduplicatedJobs.length > 0) {
      console.log(`Attempting to upsert ${deduplicatedJobs.length} jobs`);
      
      const { data: upserted, error } = await supabase
        .from('jobs')
        .upsert(deduplicatedJobs, { 
          onConflict: 'job_title,company_name,location'
        })
        .select('id, job_title, company_name');

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      insertedCount = upserted?.length || 0;
      console.log(`✅ Successfully upserted ${insertedCount} jobs`);
    }

    const response = {
      success: true,
      message: `Successfully processed ${insertedCount} jobs`,
      stats: {
        total_scraped: jobsToInsert.length,
        valid_jobs: jobsToInsert.length,
        published_jobs: insertedCount,
        duplicates_skipped: 0,
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