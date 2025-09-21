import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    switch (action) {
      case 'start-scraping':
        return await startScrapingJob(payload);
      case 'stop-scraping':
        return await stopScrapingJob(payload);
      case 'get-status':
        return await getScrapingStatus(payload);
      case 'schedule-scraping':
        return await scheduleScrapingJob(payload);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('LinkedIn job scraper error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function startScrapingJob(payload: any) {
  console.log('Starting LinkedIn job scraping:', payload);
  
  const { job_title, search_query, location, employment_type, experience_level } = payload;
  
  // Create scraping job record
  const { data: scrapingJob, error: jobError } = await supabase
    .from('linkedin_scraping_jobs')
    .insert({
      job_title: job_title || 'LinkedIn Job Scraper',
      search_query: search_query || 'Software Engineer',
      location: location || 'India',
      employment_type: employment_type || 'full_time',
      experience_level: experience_level || 'mid_level',
      status: 'running',
      progress_percentage: 0,
      jobs_found: 0,
      last_run_at: new Date().toISOString(),
      next_run_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (jobError) {
    throw new Error(`Failed to create scraping job: ${jobError.message}`);
  }

  // Start background scraping process
  EdgeRuntime.waitUntil(performJobScraping(scrapingJob.id, payload));

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Scraping job started',
      job_id: scrapingJob.id 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function performJobScraping(jobId: string, payload: any) {
  console.log(`Performing job scraping for job ${jobId}:`, payload);
  
  try {
    const mockJobs = generateMockJobs(payload);
    let processedCount = 0;
    
    for (const job of mockJobs) {
      // Update progress
      processedCount++;
      const progress = Math.round((processedCount / mockJobs.length) * 100);
      
      await supabase
        .from('linkedin_scraping_jobs')
        .update({
          progress_percentage: progress,
          jobs_found: processedCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      
      // Insert scraped job
      await supabase
        .from('jobs')
        .insert({
          title: job.title,
          company_name: job.company,
          location: job.location,
          description: job.description,
          employment_type: job.employment_type,
          experience_level: job.experience_level,
          external_url: job.linkedin_url,
          is_active: true,
          job_status: 'open',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          posted_at: new Date().toISOString(),
          posted_by: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'
        });
      
      // Add delay to simulate real scraping
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Mark job as completed
    await supabase
      .from('linkedin_scraping_jobs')
      .update({
        status: 'completed',
        progress_percentage: 100,
        jobs_found: mockJobs.length,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
      
    console.log(`Job scraping completed for job ${jobId}`);
    
  } catch (error) {
    console.error(`Job scraping failed for job ${jobId}:`, error);
    
    await supabase
      .from('linkedin_scraping_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

function generateMockJobs(payload: any) {
  const { job_title = 'Software Engineer', location = 'India' } = payload;
  
  const companies = ['TechCorp', 'InnovateInc', 'DevSolutions', 'CodeMasters', 'TechStartup'];
  const descriptions = [
    'Exciting opportunity to work with cutting-edge technology...',
    'Join our dynamic team of developers and engineers...',
    'We are looking for passionate developers to join our mission...',
    'Great opportunity for career growth in a fast-paced environment...',
    'Work on challenging projects with the latest technologies...'
  ];
  
  return Array.from({ length: 15 }, (_, i) => ({
    title: `${job_title} ${i + 1}`,
    company: companies[i % companies.length],
    location: location,
    description: descriptions[i % descriptions.length],
    employment_type: payload.employment_type || 'full_time',
    experience_level: payload.experience_level || 'mid_level',
    linkedin_url: `https://linkedin.com/jobs/view/${Math.floor(Math.random() * 1000000)}`
  }));
}

async function stopScrapingJob(payload: any) {
  const { job_id } = payload;
  
  const { error } = await supabase
    .from('linkedin_scraping_jobs')
    .update({
      status: 'stopped',
      updated_at: new Date().toISOString()
    })
    .eq('id', job_id);
    
  if (error) {
    throw new Error(`Failed to stop scraping job: ${error.message}`);
  }
  
  return new Response(
    JSON.stringify({ success: true, message: 'Scraping job stopped' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getScrapingStatus(payload: any) {
  const { job_id } = payload;
  
  const { data: job, error } = await supabase
    .from('linkedin_scraping_jobs')
    .select('*')
    .eq('id', job_id)
    .single();
    
  if (error) {
    throw new Error(`Failed to get scraping status: ${error.message}`);
  }
  
  return new Response(
    JSON.stringify({ success: true, job }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleScrapingJob(payload: any) {
  const { schedule_time, ...jobData } = payload;
  
  const { data: job, error } = await supabase
    .from('linkedin_scraping_jobs')
    .insert({
      ...jobData,
      status: 'scheduled',
      next_run_at: schedule_time
    })
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to schedule scraping job: ${error.message}`);
  }
  
  return new Response(
    JSON.stringify({ success: true, message: 'Scraping job scheduled', job_id: job.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}