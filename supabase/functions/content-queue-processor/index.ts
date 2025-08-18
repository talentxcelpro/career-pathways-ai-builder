import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

console.log('🚀 content-queue-processor v2.2: OpenAI-only with stub fallback');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, function: 'content-queue-processor', version: '2.2', mode: 'openai-only' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
    );

    const { action, count = 1 } = await req.json().catch(() => ({ action: 'process', count: 1 }));

    if (action === 'queue') {
      return await queueContentGeneration(supabase, count);
    }

    // Default: process
    return await processContentQueue(supabase);

  } catch (error) {
    console.error('❌ Error in content-queue-processor:', error);
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
  console.log(`🧺 Queuing ${count} content generation job(s)...`);

  // Get active bots
  const { data: bots, error: botsError } = await supabase
    .from('ai_bots')
    .select('*')
    .eq('is_active', true);

  if (botsError) throw botsError;
  if (!bots || bots.length === 0) {
    return json({ success: true, message: 'No active bots found, nothing queued', jobs_queued: 0 });
  }

  const contentTypes = ['social_post', 'article', 'seo_page', 'newsletter'] as const;
  const prompts = {
    social_post: 'Create an engaging social media post about professional development and career growth.',
    article: 'Write a comprehensive article about AI automation in modern workplaces.',
    seo_page: 'Create SEO-optimized content about remote work best practices.',
    newsletter: 'Write a newsletter section about industry trends and career opportunities.'
  } as const;

  const jobs = Array.from({ length: count }).map((_, i) => {
    const bot = bots[i % bots.length];
    const type = contentTypes[i % contentTypes.length];
    return {
      bot_id: bot.id,
      content_type: type,
      prompt: prompts[type],
      target_audience: 'professionals',
      tone: bot.tone_style || 'professional',
      keywords: ['AI', 'career', 'productivity'],
      priority: Math.floor(Math.random() * 3)
    };
  });

  const { data: inserted, error } = await supabase
    .from('content_generation_queue')
    .insert(jobs)
    .select();

  if (error) throw error;
  return json({ success: true, message: `Queued ${inserted.length} job(s)`, jobs_queued: inserted.length });
}

async function processContentQueue(supabase: any) {
  console.log('🔄 Processing content generation queue (OpenAI-only)...');

  const { data: jobs, error: jobsError } = await supabase
    .from('content_generation_queue')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);

  if (jobsError) throw jobsError;
  if (!jobs || jobs.length === 0) {
    return json({ success: true, message: 'No pending jobs', processed: 0 });
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  const stats = { openai: 0, stub: 0, errors: 0 };
  const results: any[] = [];

  for (const job of jobs) {
    try {
      await supabase.from('content_generation_queue')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', job.id);

      let content = '';
      let source: 'openai' | 'stub' = 'stub';

      if (openaiApiKey) {
        try {
          const resp = await fetch('https://api.openai.com/v1/chat/completions', {
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
              max_tokens: getMaxTokens(job.content_type)
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            content = data.choices?.[0]?.message?.content ?? '';
            if (content) { source = 'openai'; stats.openai++; }
          } else {
            console.warn('OpenAI API failed with status', resp.status);
          }
        } catch (e) {
          console.warn('OpenAI call error:', (e as Error).message);
        }
      }

      if (!content) { content = stub(job.content_type, job.tone); stats.stub++; }

      const { data: saved, error: saveError } = await supabase
        .from('bot_generated_content')
        .insert({
          bot_id: job.bot_id,
          content_type: job.content_type,
          content,
          word_count: content.split(' ').length,
          seo_keywords: job.keywords || [],
          generated_by: source,
          generation_prompt: job.prompt,
          is_published: false,
          quality_score: source === 'stub' ? 0.6 : 0.85
        })
        .select()
        .single();
      if (saveError) throw saveError;

      await supabase.from('content_generation_queue')
        .update({ status: 'completed', result: content, word_count: content.split(' ').length, completed_at: new Date().toISOString() })
        .eq('id', job.id);

      results.push({ job_id: job.id, content_id: saved.id, source });
    } catch (err) {
      stats.errors++;
      console.error('❌ Job error:', err);
      await supabase.from('content_generation_queue')
        .update({ status: 'failed', error_message: (err as Error).message, completed_at: new Date().toISOString() })
        .eq('id', job.id);
    }
  }

  return json({ success: true, processed: results.length, jobs: results, stats });
}

function getMaxTokens(type: string) {
  switch (type) {
    case 'social_post': return 300;
    case 'article': return 1500;
    case 'seo_page': return 1200;
    case 'newsletter': return 2000;
    default: return 800;
  }
}

function stub(type: string, tone: string) {
  const map: Record<string, string> = {
    social_post: `🚀 AI and automation are reshaping work. Share how your team boosts productivity. #AI #FutureOfWork`,
    article: `# AI Automation: Practical Playbook\n\nOrganizations adopting AI see major efficiency gains. Start with pilots, train teams, and scale responsibly.`,
    seo_page: `# Remote Work Best Practices\n\nTooling, routines, and communication strategies to stay productive from anywhere.`,
    newsletter: `# Career Insights Weekly\n\nTrends, skills in demand, and tips to accelerate your growth.`
  };
  return map[type] || map.article;
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
