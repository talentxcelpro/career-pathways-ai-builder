import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const siteOrigin = Deno.env.get('SITE_ORIGIN') || 'https://talentxcel.in';

async function chat(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful, precise assistant for TalentXcel platform.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function claimNextTask() {
  const { data, error } = await supabaseAdmin.rpc('claim_next_task');
  if (error) {
    console.error('Error claiming task:', error);
    return null;
  }
  
  if (!data) return null;
  
  // Get the full task data
  const { data: task } = await supabaseAdmin
    .from('agent_tasks')
    .select('*')
    .eq('id', data)
    .single();
    
  return task;
}

async function markTaskDone(id: string) {
  return await supabaseAdmin
    .from('agent_tasks')
    .update({ status: 'completed', finished_at: new Date().toISOString() })
    .eq('id', id);
}

async function failTask(task: any, error: Error) {
  const attempts = (task.attempts ?? 0) + 1;
  const status = attempts >= (task.max_attempts ?? 3) ? 'deadletter' : 'failed';
  
  return await supabaseAdmin
    .from('agent_tasks')
    .update({
      status,
      attempts,
      error: error.message,
      finished_at: new Date().toISOString()
    })
    .eq('id', task.id);
}

async function emitEvent(topic: string, origin: string, ref_task: string | null, data: any) {
  return await supabaseAdmin.from('agent_events').insert({
    topic,
    origin,
    ref_task,
    data
  });
}

const PROMPTS = {
  learning_path: ({ skillTarget, audience }: { skillTarget: string; audience: string }) => 
    `Create a 6-8 step learning path for ${skillTarget} tailored for ${audience} in India. Each step should include: Step title, why it matters, 2-3 outcomes, and 2-4 resources (course/doc/practice). End with a short CTA. 600-900 words. Use Markdown formatting.`,

  career_advice: ({ roleOrDomain }: { roleOrDomain: string }) => 
    `Produce a 250-400 word actionable career tip for ${roleOrDomain}. Include a 3-bullet "Do this" list and one concise example.`,

  post_community: ({ title, url }: { title: string; url: string }) => 
    `Write a 120-180 word community post summarizing "${title}". Include two engaging questions. Include canonical link ${url}.`,

  match_jobs: ({ skills, prefs, region }: { skills: string; prefs: string; region: string }) => 
    `Given skills=${skills}, preferences=${prefs}, region=${region}, return top 5 roles with a two-line match_reason and a next_action link.`,

  support_reply: ({ issue }: { issue: string }) => 
    `Draft a helpful help-center answer for issue=${issue}. Structure: Problem, Quick Fix, Detailed Steps, When to contact support. Friendly tone.`,

  optimize_seo: ({ title, summary, body_md }: { title: string; summary: string; body_md: string }) => 
    `Given the content, return JSON with keys: seoTitle (<=60 chars), metaDescription (<=155 chars), keywords (6-10 array), schemaJson (JobPosting/ProfilePage/Article/Course), internalLinks (3-5 {anchor, href}).`,
};

async function runPipeline(task: any) {
  console.log(`Processing task ${task.id} of kind ${task.kind}`);

  const { data: agent } = await supabaseAdmin
    .from('ai_agents')
    .select('*')
    .eq('id', task.agent_id)
    .single();

  if (!agent) {
    throw new Error('Agent not found');
  }

  switch (task.kind) {
    case 'learning_path': {
      const prompt = PROMPTS.learning_path(task.payload);
      const content = await chat(prompt);
      
      const { data: draft } = await supabaseAdmin
        .from('ai_drafts')
        .insert({
          agent_id: agent.id,
          task_id: task.id,
          title: `${task.payload.skillTarget} Learning Path`,
          summary: `Learning path for ${task.payload.skillTarget} (${task.payload.audience})`,
          body_md: content,
          status: 'draft'
        })
        .select()
        .single();

      // Enqueue SEO optimization task
      await supabaseAdmin.from('agent_tasks').insert({
        agent_id: agent.id,
        kind: 'optimize_seo',
        payload: { draft_id: draft.id },
        priority: 4,
        status: 'pending'
      });

      return { draft_id: draft.id };
    }

    case 'career_advice': {
      const prompt = PROMPTS.career_advice(task.payload);
      const content = await chat(prompt);
      
      const { data: draft } = await supabaseAdmin
        .from('ai_drafts')
        .insert({
          agent_id: agent.id,
          task_id: task.id,
          title: `${task.payload.roleOrDomain}: Career Tip`,
          summary: `Actionable tip for ${task.payload.roleOrDomain}`,
          body_md: content,
          status: 'draft'
        })
        .select()
        .single();

      await supabaseAdmin.from('agent_tasks').insert({
        agent_id: agent.id,
        kind: 'optimize_seo',
        payload: { draft_id: draft.id },
        priority: 4,
        status: 'pending'
      });

      return { draft_id: draft.id };
    }

    case 'post_community': {
      const prompt = PROMPTS.post_community(task.payload);
      const content = await chat(prompt);
      
      // Publish directly as community post
      const slug = `community-${crypto.randomUUID().slice(0, 8)}`;
      const url = `${siteOrigin}/post/${slug}`;
      
      await supabaseAdmin.from('ai_published').insert({
        url,
        published_at: new Date().toISOString(),
        indexable: true
      });
      
      await supabaseAdmin.from('sitemap_queue').insert({
        url,
        kind: 'posts',
        processed: false
      });

      return { url };
    }

    case 'optimize_seo': {
      const { data: draft } = await supabaseAdmin
        .from('ai_drafts')
        .select('*')
        .eq('id', task.payload.draft_id)
        .single();

      if (!draft) {
        throw new Error('Draft not found');
      }

      const seoPrompt = PROMPTS.optimize_seo({
        title: draft.title || '',
        summary: draft.summary || '',
        body_md: draft.body_md || ''
      });

      const rawSeo = await chat(seoPrompt);
      let seo: any = {};
      
      try {
        seo = JSON.parse(rawSeo);
      } catch {
        seo = {
          seoTitle: draft.title,
          metaDescription: draft.summary,
          keywords: []
        };
      }

      await supabaseAdmin
        .from('ai_drafts')
        .update({ seo })
        .eq('id', draft.id);

      // Enqueue publish task
      await supabaseAdmin.from('agent_tasks').insert({
        agent_id: draft.agent_id,
        kind: 'publish_content',
        payload: { draft_id: draft.id },
        priority: 4,
        status: 'pending'
      });

      return { draft_id: draft.id };
    }

    case 'publish_content': {
      const { data: draft } = await supabaseAdmin
        .from('ai_drafts')
        .select('*')
        .eq('id', task.payload.draft_id)
        .single();

      if (!draft) {
        throw new Error('Draft not found');
      }

      const type = task.payload.section || 'post';
      const slug = (draft.slug || draft.title || 'post')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + crypto.randomUUID().slice(0, 6);
      
      const url = `${siteOrigin}/${type}/${slug}`;

      await supabaseAdmin.from('ai_published').insert({
        draft_id: draft.id,
        url,
        published_at: new Date().toISOString(),
        indexable: true
      });

      await supabaseAdmin.from('sitemap_queue').insert({
        url,
        kind: type,
        processed: false
      });

      return { url };
    }

    default:
      // Handle other task types with basic processing
      await emitEvent('task.processed', 'worker', task.id, { 
        kind: task.kind, 
        status: 'handled' 
      });
      return { processed: true };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Worker checking for tasks...');

    const task = await claimNextTask();
    if (!task) {
      return new Response('No tasks available', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    console.log(`Processing task ${task.id} of kind ${task.kind}`);

    const result = await runPipeline(task);
    await markTaskDone(task.id);
    await emitEvent('task.completed', 'worker', task.id, result);

    return new Response(`Task ${task.id} completed successfully`, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('Worker error:', error);
    
    if (error.task) {
      await failTask(error.task, error);
      await emitEvent('task.failed', 'worker', error.task.id, { error: error.message });
    }

    return new Response(`Worker failed: ${error.message}`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
});