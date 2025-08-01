import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, jobType, contentType, configuration } = await req.json();
    
    console.log(`🚀 SEO Bulk Processor - Action: ${action}, Type: ${jobType}`);

    let result;
    
    switch (action) {
      case 'start':
        result = await startBulkJob(supabase, jobType, contentType, configuration);
        break;
      case 'status':
        result = await getBulkJobStatus(supabase, req.url);
        break;
      case 'cancel':
        result = await cancelBulkJob(supabase, req.url);
        break;
      case 'process':
        // Background processing - don't await
        EdgeRuntime.waitUntil(processBulkJob(supabase, req.url));
        result = { message: 'Processing started in background' };
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 SEO Bulk Processor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function startBulkJob(supabase: any, jobType: string, contentType: string, config: any) {
  console.log(`📋 Starting bulk job: ${jobType} for ${contentType}`);
  
  // Create bulk job record
  const { data: job, error: jobError } = await supabase
    .from('seo_bulk_jobs')
    .insert({
      job_type: jobType,
      content_type: contentType,
      status: 'pending',
      configuration: config,
      created_by: config.userId
    })
    .select()
    .single();

  if (jobError) throw jobError;

  // Count total items to process
  let totalItems = 0;
  try {
    if (contentType === 'job') {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      totalItems = count || 0;
    } else if (contentType === 'company') {
      const { count } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      totalItems = count || 0;
    } else if (contentType === 'course') {
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });
      totalItems = count || 0;
    }
  } catch (error) {
    console.error('Error counting items:', error);
  }

  // Update job with total count
  const { error: updateError } = await supabase
    .from('seo_bulk_jobs')
    .update({ total_items: totalItems })
    .eq('id', job.id);

  if (updateError) throw updateError;

  console.log(`✅ Bulk job created: ${job.id} (${totalItems} items)`);
  
  return {
    jobId: job.id,
    totalItems,
    status: 'pending'
  };
}

async function getBulkJobStatus(supabase: any, requestUrl: string) {
  const url = new URL(requestUrl);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) throw new Error('Job ID required');

  const { data: job, error } = await supabase
    .from('seo_bulk_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;

  return {
    job,
    progress: job.total_items > 0 ? (job.processed_items / job.total_items * 100).toFixed(1) : 0
  };
}

async function cancelBulkJob(supabase: any, requestUrl: string) {
  const url = new URL(requestUrl);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) throw new Error('Job ID required');

  const { error } = await supabase
    .from('seo_bulk_jobs')
    .update({ 
      status: 'cancelled',
      completed_at: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) throw error;

  return { message: 'Job cancelled successfully' };
}

async function processBulkJob(supabase: any, requestUrl: string) {
  const url = new URL(requestUrl);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    console.error('❌ Job ID required for processing');
    return;
  }

  console.log(`🔄 Processing bulk job: ${jobId}`);

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('seo_bulk_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;
    if (job.status !== 'pending') {
      console.log(`⚠️ Job ${jobId} is not pending, skipping`);
      return;
    }

    // Mark as processing
    await supabase
      .from('seo_bulk_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Process based on job type
    let processed = 0;
    let failed = 0;

    if (job.job_type === 'meta_generation') {
      const result = await processBulkMetaGeneration(supabase, job);
      processed = result.processed;
      failed = result.failed;
    }

    // Update job completion
    const successRate = job.total_items > 0 ? (processed / job.total_items * 100) : 100;
    
    await supabase
      .from('seo_bulk_jobs')
      .update({
        status: 'completed',
        processed_items: processed,
        failed_items: failed,
        success_rate: successRate,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`✅ Bulk job completed: ${jobId} (${processed}/${job.total_items})`);

  } catch (error) {
    console.error(`💥 Bulk job failed: ${jobId}`, error);
    
    // Mark job as failed
    await supabase
      .from('seo_bulk_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

async function processBulkMetaGeneration(supabase: any, job: any) {
  console.log(`🎯 Processing bulk meta generation for ${job.content_type}`);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) throw new Error('OpenAI API key not configured');

  let processed = 0;
  let failed = 0;
  const batchSize = 10;
  
  try {
    // Get content items
    let { data: items, error } = await supabase
      .from(job.content_type === 'job' ? 'jobs' : job.content_type === 'company' ? 'companies' : 'courses')
      .select('*')
      .limit(job.total_items);

    if (error) throw error;
    if (!items?.length) return { processed: 0, failed: 0 };

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Check if job was cancelled
      const { data: currentJob } = await supabase
        .from('seo_bulk_jobs')
        .select('status')
        .eq('id', job.id)
        .single();
      
      if (currentJob?.status === 'cancelled') {
        console.log(`🛑 Job ${job.id} was cancelled, stopping processing`);
        break;
      }

      // Process batch
      for (const item of batch) {
        try {
          // Check if meta tags already exist
          const { data: existingMeta } = await supabase
            .from('seo_meta_tags')
            .select('id')
            .eq('content_type', job.content_type)
            .eq('content_id', item.id)
            .single();

          if (!existingMeta) {
            // Generate meta tags
            const metaTags = await generateMetaTagsForItem(item, job.content_type, openAIApiKey);
            
            if (metaTags) {
              // Save to database
              await supabase
                .from('seo_meta_tags')
                .insert({
                  content_type: job.content_type,
                  content_id: item.id,
                  title: metaTags.title,
                  description: metaTags.description,
                  generated_by: 'ai',
                  generation_version: 'v2.0'
                });
              
              processed++;
            } else {
              failed++;
            }
          } else {
            processed++; // Already exists, count as processed
          }
        } catch (error) {
          console.error(`❌ Failed to process ${job.content_type} ${item.id}:`, error);
          failed++;
        }
      }

      // Update progress
      await supabase
        .from('seo_bulk_jobs')
        .update({ 
          processed_items: processed,
          failed_items: failed,
          progress_data: { 
            current_batch: Math.floor(i / batchSize) + 1,
            total_batches: Math.ceil(items.length / batchSize)
          }
        })
        .eq('id', job.id);

      // Rate limiting - wait between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('❌ Bulk meta generation error:', error);
    throw error;
  }

  return { processed, failed };
}

async function generateMetaTagsForItem(item: any, contentType: string, apiKey: string) {
  try {
    const prompt = createPromptForItem(item, contentType);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO copywriter. Create compelling meta titles (50-60 chars) and descriptions (150-160 chars) that maximize CTR. Return only JSON with "title" and "description" fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    
    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Meta tag generation failed:', error);
    return null;
  }
}

function createPromptForItem(item: any, contentType: string): string {
  switch (contentType) {
    case 'job':
      return `Create SEO meta tags for: ${item.title} at ${item.company_name || 'Company'} in ${item.location || 'India'}. Salary: ${item.salary_min && item.salary_max ? `₹${Math.round(item.salary_min/100000)}-${Math.round(item.salary_max/100000)}L` : 'Competitive'}. Include "TalentXcel" and urgency.`;
    
    case 'company':
      return `Create SEO meta tags for company: ${item.name} in ${item.industry || 'Technology'} industry, located in ${item.location || 'India'}. Focus on career opportunities and company reputation.`;
    
    case 'course':
      return `Create SEO meta tags for course: ${item.title}. Duration: ${item.duration || 'Self-paced'}. Level: ${item.level || 'All levels'}. Focus on skills gained and career benefits.`;
    
    default:
      return `Create SEO meta tags for: ${item.title || item.name}`;
  }
}