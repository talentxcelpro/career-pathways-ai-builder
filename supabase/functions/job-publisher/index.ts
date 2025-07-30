import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

console.log("🚀 Job Publisher function starting up...");

serve(async (req) => {
  console.log("🚀 Job Publisher function received request");
  console.log("🚀 Request method:", req.method);
  console.log("🚀 Request URL:", req.url);
  
  try {
    // ✅ CORS Preflight
    if (req.method === "OPTIONS") {
      console.log("📋 Handling CORS preflight request");
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        },
      });
    }

    // ✅ Reject other methods
    if (req.method !== "POST") {
      console.log("❌ Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    console.log("📦 Starting to parse request body...");
    
    // ✅ Try parsing the JSON body with error handling
    let body;
    try {
      body = await req.json();
      console.log("📦 Successfully parsed JSON body");
      console.log("📦 Body keys:", Object.keys(body));
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: parseError.message 
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ✅ Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("🔑 Supabase URL:", supabaseUrl ? "✅ Available" : "❌ Missing");
    console.log("🔑 Service Role Key:", serviceRoleKey ? "✅ Available" : "❌ Missing");
    
    if (!serviceRoleKey) {
      console.error("❌ Service role key not configured");
      return new Response(JSON.stringify({ 
        error: "Service role key not configured" 
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const supabase = createClient(
      supabaseUrl ?? '',
      serviceRoleKey ?? ''
    );
    
    console.log("📦 Checking if results exist:", !!body.results);
    console.log("📦 Results type:", typeof body.results);
    console.log("📦 Results length:", body.results ? body.results.length : 0);
    
    // Check if this is a job publishing request (has scraped jobs data)
    if (body.results && Array.isArray(body.results)) {
      console.log("📝 Publishing scraped jobs to database...");
      
      let totalJobsPublished = 0;
      const publishedJobs = [];

      for (const result of body.results) {
        console.log("🔄 Processing result from:", result.source);
        console.log("🔄 Jobs in this result:", result.jobs ? result.jobs.length : 0);
        
        if (result.jobs && Array.isArray(result.jobs)) {
          for (const job of result.jobs) {
            try {
              console.log("📝 Inserting job:", job.title);
              
              // Insert job into scraped_jobs table
              const { data: scrapedJob, error: scrapedError } = await supabase
                .from('scraped_jobs')
                .insert({
                  bot_id: 'c9146eae-c0da-4d7c-bed7-1494dd8e7520', // Default to Raj bot
                  job_title: job.title,
                  company: job.company,
                  location: job.location || 'Remote',
                  salary: job.salary,
                  job_description: job.description,
                  source_url: job.url,
                  source_platform: result.source,
                  employment_type: job.job_type || 'Full-time',
                  experience_level: job.experience_level || 'Mid',
                  status: 'scraped',
                  processing_status: 'pending'
                })
                .select()
                .single();

              if (scrapedError) {
                console.error("❌ Error inserting scraped job:", scrapedError);
                continue;
              }

              console.log("✅ Scraped job inserted:", scrapedJob.id);

              // Also insert into main jobs table for public visibility
              const { data: publishedJob, error: publishError } = await supabase
                .from('jobs')
                .insert({
                  job_title: job.title,
                  title: job.title,
                  company_name: job.company,
                  location: job.location || 'Remote',
                  job_description: job.description,
                  description: job.description,
                  employment_type: job.job_type || 'full_time',
                  experience_level: job.experience_level?.toLowerCase() || 'mid',
                  external_url: job.url,
                  is_active: true,
                  posted_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
                })
                .select()
                .single();

              if (publishError) {
                console.error("❌ Error publishing job:", publishError);
              } else {
                totalJobsPublished++;
                publishedJobs.push(publishedJob);
                console.log("✅ Job published:", publishedJob.id);
                
                // Update scraped job with published job ID
                await supabase
                  .from('scraped_jobs')
                  .update({ 
                    published_job_id: publishedJob.id,
                    status: 'published',
                    processing_status: 'completed'
                  })
                  .eq('id', scrapedJob.id);
              }
            } catch (jobError) {
              console.error("❌ Error processing job:", jobError);
            }
          }
        }
      }

      console.log(`📈 Successfully published ${totalJobsPublished} jobs`);

      const response = {
        success: true,
        jobsPublished: totalJobsPublished,
        publishedJobs: publishedJobs,
        message: `Successfully published ${totalJobsPublished} jobs to the platform`,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ✅ Default response for non-publishing requests
    console.log("📦 Function is working and deployed!");
    const response = {
      success: true,
      received: body,
      message: "Job publisher function is working and deployed!",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    // ✅ Catch and return all errors with detailed logging
    console.error("❌ job-publisher error:", err.message);
    console.error("❌ job-publisher full error:", err);
    console.error("❌ Error stack:", err.stack);

    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Unexpected error",
      stack: err.stack || "No stack trace available"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});