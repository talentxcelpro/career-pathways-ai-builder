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
    // Read environment variable
    const encoded = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY_BASE64");
    if (!encoded) {
      console.error("GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 not found");
      throw new Error("Google service account credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse credentials from base64
    const credentials = JSON.parse(atob(encoded));
    console.log("Service account loaded:", credentials.client_email);

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

    // Get access token for Google API
    console.log('Getting Google API access token...');
    
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600, // 1 hour
    };

    // Create JWT for Google API authentication
    const encoder = new TextEncoder();
    const keyData = credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
                                        .replace(/\n?-----END PRIVATE KEY-----/, '')
                                        .replace(/\n/g, '');
    
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const header = { alg: 'RS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(unsignedToken)
    );
    
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
                              .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${unsignedToken}.${encodedSignature}`;

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;
    console.log('Successfully obtained access token');
    const results = [];
    const baseUrl = 'https://talentxcel.in';

    for (const job of jobs) {
      const jobUrl = job.seo_slug 
        ? `${baseUrl}/jobs/${job.seo_slug}`
        : `${baseUrl}/jobs/${job.id}`;

      try {
        // Submit to Google Indexing API
        const indexingResponse = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: jobUrl,
            type: 'URL_UPDATED',
          }),
        });

        const indexingResult = await indexingResponse.json();
        
        if (indexingResponse.ok) {
          console.log(`Successfully submitted to Google Indexing API: ${jobUrl}`);
          
          // Log successful submission
          const { error: logError } = await supabase
            .from('search_engine_submissions')
            .insert({
              engine: 'google_indexing_api',
              url: jobUrl,
              submission_type: 'url',
              status: 'success',
              response_data: {
                job_id: job.id,
                job_title: job.title,
                company: job.company_name,
                location: job.location,
                google_response: indexingResult
              }
            });

          if (logError) {
            console.error(`Failed to log submission for ${jobUrl}:`, logError);
          }
          
          results.push({
            url: jobUrl,
            status: 'success',
            job_id: job.id,
            job_title: job.title,
            timestamp: new Date().toISOString(),
            google_response: indexingResult,
          });
        } else {
          console.error(`Failed to submit ${jobUrl} to Google:`, indexingResult);
          
          // Log failed submission
          const { error: logError } = await supabase
            .from('search_engine_submissions')
            .insert({
              engine: 'google_indexing_api',
              url: jobUrl,
              submission_type: 'url',
              status: 'failed',
              response_data: {
                job_id: job.id,
                job_title: job.title,
                error: indexingResult
              }
            });

          if (logError) {
            console.error(`Failed to log submission for ${jobUrl}:`, logError);
          }
          
          results.push({
            url: jobUrl,
            status: 'failed',
            job_id: job.id,
            job_title: job.title,
            error: indexingResult,
            timestamp: new Date().toISOString(),
          });
        }

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
          // Submit to Google Indexing API
          const indexingResponse = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: postUrl,
              type: 'URL_UPDATED',
            }),
          });

          const indexingResult = await indexingResponse.json();
          
          if (indexingResponse.ok) {
            console.log(`Successfully submitted post to Google Indexing API: ${postUrl}`);
            
            // Log successful submission
            const { error: logError } = await supabase
              .from('search_engine_submissions')
              .insert({
                engine: 'google_indexing_api',
                url: postUrl,
                submission_type: 'url',
                status: 'success',
                response_data: {
                  post_id: post.id,
                  post_title: post.headline,
                  google_response: indexingResult
                }
              });

            if (logError) {
              console.error(`Failed to log submission for ${postUrl}:`, logError);
            }
            
            results.push({
              url: postUrl,
              status: 'success',
              post_id: post.id,
              post_title: post.headline,
              timestamp: new Date().toISOString(),
              google_response: indexingResult,
            });
          } else {
            console.error(`Failed to submit post ${postUrl} to Google:`, indexingResult);
            
            results.push({
              url: postUrl,
              status: 'failed',
              post_id: post.id,
              post_title: post.headline,
              error: indexingResult,
              timestamp: new Date().toISOString(),
            });
          }

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

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(JSON.stringify({
      success: true,
      indexed_count: successCount,
      failed_count: failedCount,
      error_count: errorCount,
      total_processed: results.length,
      results: results.slice(0, 10), // Return first 10 for preview
      note: 'Google Indexing API submissions completed - check logs for details'
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