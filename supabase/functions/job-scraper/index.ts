import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // ✅ Handle preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      });
    }

    // ✅ Validate method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log('Job scraper function called');

    // ✅ Safely parse body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON body", 
        detail: e.message 
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log('Request body:', body);

    const { sourceId, maxJobs = 20, location = 'India', botId } = body || {};

    // ✅ Initialize Supabase safely
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mock job scraping for now - in production this would scrape actual job sites
    const mockJobs = Array.from({ length: Math.min(maxJobs, 10) }, (_, i) => ({
      source_platform: sourceId || 'mock-source',
      job_title: `Software Developer ${i + 1}`,
      company: `Company ${i + 1}`,
      location: location,
      job_description: `Job description for Software Developer position ${i + 1}. We are looking for a talented developer to join our team.`,
      source_url: `https://example.com/job/${i + 1}`,
      salary: '₹5,00,000 - ₹8,00,000',
      employment_type: 'full_time',
      experience_level: i % 3 === 0 ? 'entry' : i % 3 === 1 ? 'mid' : 'senior',
      scraped_at: new Date().toISOString(),
      status: 'draft',
      bot_id: botId,
      skills: ['JavaScript', 'React', 'Node.js'],
      posted_at: new Date().toISOString(),
    }));

    console.log(`Inserting ${mockJobs.length} mock jobs`);

    // Insert scraped jobs into the database
    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(mockJobs)
      .select();

    if (insertError) {
      console.error('Error inserting scraped jobs:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }

    console.log(`Successfully scraped and stored ${insertedJobs?.length || 0} jobs`);

    const result = {
      success: true,
      jobsScraped: insertedJobs?.length || 0,
      jobs: insertedJobs,
      message: `Successfully scraped ${insertedJobs?.length || 0} jobs from ${sourceId || 'mock source'}`
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error('Job scraper error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: "Function execution failed",
      detail: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});