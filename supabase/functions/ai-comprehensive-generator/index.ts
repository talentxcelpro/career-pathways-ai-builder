import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, count = 20 } = await req.json();

    if (action === 'queue') {
      return await queueContentGeneration(supabase, count);
    } else {
      return await processContentQueue(supabase);
    }

  } catch (error) {
    console.error('❌ Error in content generation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function queueContentGeneration(supabase: any, count: number) {
  console.log(`🚀 Queuing ${count} content generation jobs...`);

  // Get active bots
  const { data: bots } = await supabase
    .from('ai_bots')
    .select('*')
    .eq('is_active', true);

  if (!bots || bots.length === 0) {
    throw new Error('No active bots found');
  }

  const contentTypes = ['social_post', 'article', 'seo_page', 'newsletter'];
  const prompts = {
    social_post: 'Create an engaging social media post about professional development and career growth.',
    article: 'Write a comprehensive article about AI automation in modern workplaces.',
    seo_page: 'Create SEO-optimized content about remote work best practices.',
    newsletter: 'Write a newsletter section about industry trends and career opportunities.'
  };

  const queueJobs = [];
  for (let i = 0; i < count; i++) {
    const bot = bots[i % bots.length];
    const contentType = contentTypes[i % contentTypes.length];
    
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

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Queued ${insertedJobs.length} content generation jobs`,
      jobs_queued: insertedJobs.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processContentQueue(supabase: any) {
  console.log('🔄 Processing content generation queue...');

  // Get pending jobs (process 5 at a time)
  const { data: jobs } = await supabase
    .from('content_generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(5);

  if (!jobs || jobs.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No pending jobs in queue',
        processed: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const processedJobs = [];
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

  for (const job of jobs) {
    try {
      // Mark as processing
      await supabase
        .from('content_generation_queue')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', job.id);

      console.log(`📝 Processing job ${job.id} - ${job.content_type}`);

      let generatedContent = '';
      let apiUsed = 'stub';

      // Try OpenAI first
      if (openaiApiKey) {
        try {
          console.log(`🤖 Trying OpenAI for job ${job.id}`);
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
            generatedContent = data.choices[0].message.content;
            apiUsed = 'openai';
            console.log(`✅ OpenAI succeeded for job ${job.id}`);
          } else {
            console.warn(`⚠️ OpenAI failed for job ${job.id}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`⚠️ OpenAI error for job ${job.id}:`, error.message);
        }
      }

      // Try DeepSeek if OpenAI failed
      if (!generatedContent && deepseekApiKey) {
        try {
          console.log(`🤖 Trying DeepSeek for job ${job.id}`);
          const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${deepseekApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
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
            generatedContent = data.choices[0].message.content;
            apiUsed = 'deepseek';
            console.log(`✅ DeepSeek succeeded for job ${job.id}`);
          } else {
            const errorText = await response.text();
            console.warn(`⚠️ DeepSeek failed for job ${job.id}: ${response.status} - ${errorText}`);
            if (response.status === 402) {
              console.warn(`💳 DeepSeek quota exceeded or payment required for job ${job.id}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ DeepSeek error for job ${job.id}:`, error.message);
        }
      }

      // Always fall back to stub content if APIs failed
      if (!generatedContent) {
        console.log(`📝 Using stub content for job ${job.id} (API fallback)`);
        generatedContent = generateStubContent(job.content_type, job.tone);
        apiUsed = 'stub';
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
        console.error(`❌ Save error for job ${job.id}:`, saveError);
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

      console.log(`✅ Completed job ${job.id} using ${apiUsed}`);

    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error);
      
      // Mark job as failed
      await supabase
        .from('content_generation_queue')
        .update({ 
          status: 'failed', 
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Processed ${processedJobs.length} content generation jobs`,
      processed: processedJobs.length,
      jobs: processedJobs
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
  const templates = {
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