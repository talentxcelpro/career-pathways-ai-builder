import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// OpenAI-only implementation (v2.6 - FORCE DEPLOY)
console.log('🚀 AI Comprehensive Generator v2.6: OpenAI-only mode active - DEPLOYED');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ ok: true, function: 'ai-comprehensive-generator-v2', version: '2.5', status: 'deployed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
    );

    const { action, count = 20 } = await req.json().catch(() => ({ action: 'process', count: 20 }));

    if (action === 'queue') {
      return await queueContentGeneration(supabase, count);
    } else {
      return await processContentQueue(supabase);
    }

  } catch (error) {
    console.error('❌ Error in content generation v2:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function queueContentGeneration(supabase: any, count: number) {
  console.log(`🚀 [v2] Queuing ${count} content generation jobs...`);

  // Get active bots
  const { data: bots, error: botsError } = await supabase
    .from('ai_bots')
    .select('*')
    .eq('is_active', true);

  if (botsError) throw botsError;

  if (!bots || bots.length === 0) {
    throw new Error('No active bots found');
  }

  const contentTypes = ['social_post', 'article', 'seo_page', 'newsletter'];
  const prompts = {
    social_post: 'Create an engaging social media post about professional development and career growth.',
    article: 'Write a comprehensive article about AI automation in modern workplaces.',
    seo_page: 'Create SEO-optimized content about remote work best practices.',
    newsletter: 'Write a newsletter section about industry trends and career opportunities.'
  } as const;

  const queueJobs = [] as any[];
  for (let i = 0; i < count; i++) {
    const bot = bots[i % bots.length];
    const contentType = contentTypes[i % contentTypes.length] as keyof typeof prompts;
    
    queueJobs.push({
      bot_id: bot.id,
      content_type: contentType,
      prompt: prompts[contentType],
      target_audience: 'professionals',
      tone: bot.tone_style || 'professional',
      keywords: ['AI', 'career', 'productivity'],
      priority: Math.floor(Math.random() * 3)
    });
  }

  const { data: insertedJobs, error } = await supabase
    .from('content_generation_queue')
    .insert(queueJobs)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      message: `[v2] Queued ${insertedJobs.length} content generation jobs`,
      jobs_queued: insertedJobs.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processContentQueue(supabase: any) {
  console.log('[v2] 🔄 Processing content generation queue (OpenAI-only)...');

  // Get pending jobs (process in batches of 10)
  const { data: jobs, error: jobsError } = await supabase
    .from('content_generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);

  if (jobsError) throw jobsError;

  if (!jobs || jobs.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: '[v2] No pending jobs in queue',
        processed: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[v2] 📊 Processing batch of ${jobs.length} jobs - OpenAI-only mode`);
  
  const processedJobs: any[] = [];
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  console.log(`[v2] ⚙️ OpenAI-only mode: OpenAI key=${openaiApiKey ? 'available' : 'missing'}`);
  console.log('[v2] 🎯 Content generator: OpenAI-only (DeepSeek removed)');
  
  // Track API usage
  const batchStats = { openai: 0, stub: 0, errors: 0 };

  for (const job of jobs) {
    try {
      // Mark as processing
      await supabase
        .from('content_generation_queue')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', job.id);

      console.log(`[v2] 📝 Processing job ${job.id} - ${job.content_type}`);

      let generatedContent = '';
      let apiUsed: 'openai' | 'stub' = 'stub';

      // Try OpenAI (only option)
      if (openaiApiKey) {
        try {
          console.log(`[v2] 🤖 Using OpenAI for job ${job.id}`);
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: `You are a professional content writer. Create ${job.content_type} content in a ${job.tone} tone.` },
                { role: 'user', content: job.prompt }
              ],
              max_tokens: getMaxTokensForType(job.content_type),
              temperature: 0.7
            })
          });

          if (response.ok) {
            const data = await response.json();
            generatedContent = data.choices?.[0]?.message?.content ?? '';
            if (generatedContent) {
              apiUsed = 'openai';
              batchStats.openai++;
              console.log(`[v2] ✅ OpenAI succeeded for job ${job.id}`);
            }
          } else {
            console.warn(`[v2] ⚠️ OpenAI failed for job ${job.id}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`[v2] ⚠️ OpenAI error for job ${job.id}:`, (error as Error).message);
        }
      } else {
        console.log(`[v2] ⚠️ No OpenAI key available for job ${job.id}`);
      }

      // Fall back to stub content if OpenAI failed
      if (!generatedContent) {
        console.log(`[v2] 📝 Using stub content for job ${job.id}`);
        generatedContent = generateStubContent(job.content_type, job.tone);
        apiUsed = 'stub';
        batchStats.stub++;
      }

      // Save to bot_generated_content table
      const { data: savedContent, error: saveError } = await supabase
        .from('bot_generated_content')
        .insert({
          bot_id: job.bot_id,
          content_type: job.content_type,
          content: generatedContent,
          word_count: generatedContent.split(' ').length,
          seo_keywords: job.keywords || [],
          generated_by: apiUsed,
          generation_prompt: job.prompt,
          is_published: false,
          quality_score: apiUsed === 'stub' ? 0.6 : 0.85
        })
        .select()
        .single();

      if (saveError) {
        console.error(`[v2] ❌ Save error for job ${job.id}:`, saveError);
        throw saveError;
      }

      // Mark job as completed
      await supabase
        .from('content_generation_queue')
        .update({ 
          status: 'completed', 
          result: generatedContent,
          word_count: generatedContent.split(' ').length,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);

      processedJobs.push({
        job_id: job.id,
        content_id: savedContent.id,
        content_type: job.content_type,
        word_count: generatedContent.split(' ').length,
        api_used: apiUsed
      });

      console.log(`[v2] ✅ Completed job ${job.id} using ${apiUsed}`);

    } catch (error) {
      console.error(`[v2] ❌ Error processing job ${job.id}:`, error);
      batchStats.errors++;
      
      // Mark job as failed
      await supabase
        .from('content_generation_queue')
        .update({ 
          status: 'failed', 
          error_message: (error as Error).message,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }
  }

  // Log batch completion statistics
  console.log(`[v2] ✅ Batch complete: ${processedJobs.length} success, ${batchStats.errors} errors`);
  console.log(`[v2] 📊 Content sources: OpenAI: ${batchStats.openai}, Stub: ${batchStats.stub}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: `[v2] Processed ${processedJobs.length} content generation jobs (OpenAI-only)`,
      processed: processedJobs.length,
      jobs: processedJobs,
      stats: batchStats
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function getMaxTokensForType(contentType: string): number {
  switch (contentType) {
    case 'social_post': return 300;
    case 'article': return 1500;
    case 'seo_page': return 1200;
    case 'newsletter': return 2000;
    default: return 800;
  }
}

function generateStubContent(contentType: string, tone: string): string {
  const templates: Record<string, string> = {
    social_post: `🚀 Exciting developments in AI and automation are reshaping how we work! Companies embracing these technologies see significant productivity gains. What's your experience with AI tools in your workplace? #AI #Productivity #FutureOfWork`,
    
    article: `# The Future of AI Automation in Modern Workplaces

Artificial intelligence is revolutionizing how businesses operate, offering unprecedented opportunities for efficiency and growth. Organizations that strategically implement AI automation are experiencing remarkable transformations in their operational capabilities.

## Key Benefits of AI Integration

- **Enhanced Productivity**: Automated workflows reduce manual tasks by up to 60%
- **Improved Decision Making**: Data-driven insights enable better strategic choices
- **Cost Reduction**: Streamlined processes significantly lower operational expenses
- **Scalability**: AI systems adapt seamlessly to growing business demands

## Implementation Strategies

Successful AI adoption requires careful planning and phased implementation. Companies should start with pilot programs, train their workforce, and gradually expand AI capabilities across departments.

The future belongs to organizations that balance technological advancement with human creativity and strategic thinking.`,

    seo_page: `# Remote Work Best Practices: A Complete Guide for 2024

Remote work has become a permanent fixture in the modern workplace. This comprehensive guide provides actionable strategies for maximizing productivity and maintaining work-life balance in remote environments.

## Essential Remote Work Tools
- Communication platforms for seamless collaboration
- Project management software for organized workflows
- Time tracking tools for productivity optimization
- Cloud storage solutions for secure file access

## Productivity Techniques
Establish dedicated workspaces, maintain regular schedules, and leverage technology to stay connected with your team. Successful remote workers prioritize clear communication and results-driven performance.

## Work-Life Balance Strategies
Set clear boundaries between work and personal time. Create dedicated spaces for work activities and establish routines that support both professional success and personal well-being.`,

    newsletter: `# Career Insights Weekly: Industry Trends & Opportunities

## This Week's Highlights

The job market continues to evolve with exciting opportunities in technology, healthcare, and sustainable industries. AI and automation are creating new roles while transforming existing ones.

## Trending Skills in Demand
- Data Analysis and AI/ML
- Digital Marketing and SEO
- Project Management
- Customer Experience Design
- Cybersecurity

## Career Development Tips
1. Invest in continuous learning through online courses
2. Build a strong professional network
3. Stay updated with industry trends
4. Develop both technical and soft skills
5. Seek mentorship opportunities

## Upcoming Events
Virtual networking sessions, industry webinars, and skill-building workshops are available throughout the month. Check our events calendar for registration details.

Stay ahead in your career journey with strategic planning and continuous growth!`
  };

  return templates[contentType] || templates.article;
}