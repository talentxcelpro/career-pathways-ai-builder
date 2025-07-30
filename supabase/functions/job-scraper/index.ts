import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobScrapingRequest {
  sourceId?: string;
  maxJobs?: number;
  location?: string;
  botId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Job scraper function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sourceId, maxJobs = 20, location = 'India', botId }: JobScrapingRequest = 
      await req.json().catch(() => ({}));

    console.log('Request params:', { sourceId, maxJobs, location, botId });

    // Mock job scraping for now - in production this would scrape actual job sites
    const mockJobs = Array.from({ length: Math.min(maxJobs, 10) }, (_, i) => ({
      source_id: sourceId || 'mock-source',
      title: `Software Developer ${i + 1}`,
      company: `Company ${i + 1}`,
      location: location,
      description: `Job description for Software Developer position ${i + 1}. We are looking for a talented developer to join our team.`,
      url: `https://example.com/job/${i + 1}`,
      salary_range: '₹5,00,000 - ₹8,00,000',
      employment_type: 'full_time',
      experience_level: i % 3 === 0 ? 'entry' : i % 3 === 1 ? 'mid' : 'senior',
      scraped_at: new Date().toISOString(),
      status: 'draft',
      bot_id: botId,
      skills: ['JavaScript', 'React', 'Node.js'],
      posted_date: new Date().toISOString(),
    }));

    // Insert scraped jobs into the database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(mockJobs)
      .select();

    if (insertError) {
      console.error('Error inserting scraped jobs:', insertError);
      throw insertError;
    }

    console.log(`Successfully scraped and stored ${insertedJobs.length} jobs`);

    return new Response(
      JSON.stringify({ 
        success: true,
        jobsScraped: insertedJobs.length,
        jobs: insertedJobs,
        message: `Successfully scraped ${insertedJobs.length} jobs from ${sourceId || 'mock source'}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Job scraper error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});