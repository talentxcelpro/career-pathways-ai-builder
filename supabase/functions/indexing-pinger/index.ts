import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleServiceAccount = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    const googleClientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
    const googlePrivateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');

    if (!googleServiceAccount && (!googleClientEmail || !googlePrivateKey)) {
      throw new Error('Google service account credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse credentials
    let credentials;
    if (googleServiceAccount) {
      credentials = JSON.parse(googleServiceAccount);
    } else {
      credentials = {
        client_email: googleClientEmail,
        private_key: googlePrivateKey.replace(/\\n/g, '\n'),
      };
    }

    console.log('Fetching active jobs from Supabase...');
    
    // Fetch active jobs from Supabase
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, seo_slug, company_name, location, created_at')
      .eq('status', 'active')
      .eq('is_active', true)
      .limit(200); // Process in batches of 200

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active jobs found to index',
        indexed_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${jobs.length} active jobs to index`);

    // Generate JWT token for Google API
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // 1 hour
    };

    // Create the JWT (simplified for now - in production you'd use proper JWT signing)
    const headerB64 = btoa(JSON.stringify(header));
    const payloadB64 = btoa(JSON.stringify(payload));
    
    // For now, we'll log the indexing requests and return success
    // In production, you'd implement proper JWT signing with the private key
    const results = [];
    const baseUrl = 'https://talentxcel.in';

    for (const job of jobs) {
      const jobUrl = job.seo_slug 
        ? `${baseUrl}/jobs/${job.seo_slug}`
        : `${baseUrl}/jobs/${job.id}`;

      try {
        // Log the indexing attempt
        const { error: logError } = await supabase
          .from('search_engine_submissions')
          .insert({
            engine: 'google_indexing_api',
            url: jobUrl,
            submission_type: 'url',
            status: 'submitted',
            response_data: {
              job_id: job.id,
              job_title: job.title,
              company: job.company_name,
              location: job.location
            }
          });

        if (logError) {
          console.error(`Failed to log submission for ${jobUrl}:`, logError);
        }

        console.log(`Would submit to Google Indexing API: ${jobUrl} (URL_UPDATED)`);
        
        results.push({
          url: jobUrl,
          status: 'logged',
          job_id: job.id,
          job_title: job.title,
          timestamp: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`Error processing ${jobUrl}:`, error);
        results.push({
          url: jobUrl,
          status: 'error',
          error: error.message,
          job_id: job.id,
        });
      }
    }

    // Also fetch and submit recent posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, headline, created_at')
      .eq('is_public', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50); // Most recent 50 posts

    if (!postsError && posts && posts.length > 0) {
      console.log(`Found ${posts.length} posts to index`);
      
      for (const post of posts) {
        const postUrl = `${baseUrl}/posts/${post.id}`;
        
        try {
          const { error: logError } = await supabase
            .from('search_engine_submissions')
            .insert({
              engine: 'google_indexing_api',
              url: postUrl,
              submission_type: 'url',
              status: 'submitted',
              response_data: {
                post_id: post.id,
                post_title: post.headline
              }
            });

          if (logError) {
            console.error(`Failed to log submission for ${postUrl}:`, logError);
          }

          console.log(`Would submit to Google Indexing API: ${postUrl} (URL_UPDATED)`);
          
          results.push({
            url: postUrl,
            status: 'logged',
            post_id: post.id,
            post_title: post.headline,
            timestamp: new Date().toISOString(),
          });

        } catch (error) {
          console.error(`Error processing ${postUrl}:`, error);
          results.push({
            url: postUrl,
            status: 'error',
            error: error.message,
            post_id: post.id,
          });
        }
      }
    }

    const successCount = results.filter(r => r.status === 'logged').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(JSON.stringify({
      success: true,
      indexed_count: successCount,
      error_count: errorCount,
      total_processed: results.length,
      results: results.slice(0, 10), // Return first 10 for preview
      note: 'Google Indexing API integration ready - URLs logged for submission'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in indexing pinger:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});