import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Simple, deterministic social post generator (no external AI)
function generateSocialPost(bot: any): { content: string; tags: string[] } {
  const domain = bot?.content_domains?.[0] || 'career growth';
  const persona = bot?.name || 'Our AI bot';

  const hooks = [
    `Quick tip for ${domain}: focus on consistency over intensity.`,
    `Most people overestimate what they can do in a week and underestimate a year.`,
    `Small, daily improvements in ${domain} compound into big wins.`,
    `A clear system beats motivation. Design your routine for success.`,
  ];

  const prompts = [
    `What blocker did you remove today?`,
    `Which skill will move the needle this month?`,
    `What's one habit that improved your workflow?`,
    `Who inspires you in this space and why?`,
  ];

  const tags = [
    '#AI',
    '#Automation',
    `#${String(domain).replace(/\s+/g, '')}`,
    '#Career',
    '#Growth',
  ];

  const sentences = [
    `🚀 ${persona} here — sharing a quick ${domain} insight for busy professionals.`,
    hooks[Math.floor(Math.random() * hooks.length)],
    `In ${domain}, momentum matters more than perfection.`,
    `Try making progress visible: track tiny wins daily to build confidence.`,
    `Systems-thinking helps: set inputs you can control and review outcomes weekly.`,
    `Stay curious, test ideas, and iterate — your future self will thank you.`,
    `Question for you: ${prompts[Math.floor(Math.random() * prompts.length)]}`,
  ];

  const content = sentences.join(' ')
    + `\n\n${tags.join(' ')}`;

  return { content, tags };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, function: 'bot-social-posts' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    console.log('📝 bot-social-posts invoked at', now);

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const limitBots = Math.max(1, Math.min(5, Number(body.limit_bots ?? 3)));
    const postsPerBot = Math.max(1, Math.min(5, Number(body.posts_per_bot ?? 1)));

    // Fetch active bots linked to real users
    const { data: bots, error: botsError } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('is_active', true)
      .not('user_id', 'is', null)
      .limit(limitBots);

    if (botsError) throw botsError;
    if (!bots?.length) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No active bots with user_id found',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const created: any[] = [];

    for (const bot of bots) {
      for (let i = 0; i < postsPerBot; i++) {
        const { content, tags } = generateSocialPost(bot);

        const { data: inserted, error: insertErr } = await supabase
          .from('posts')
          .insert({
            user_id: bot.user_id,
            content,
            visibility: 'public',
            is_ai_generated: true,
            metadata: {
              bot_id: bot.id,
              bot_name: bot.name,
              automation_generated: true,
              source: 'bot-social-posts',
              tags,
              generated_at: now,
            },
          })
          .select('id')
          .single();

        if (insertErr) {
          console.error('Insert post failed for bot', bot.id, insertErr.message);
          continue;
        }

        created.push({ id: inserted?.id, bot_id: bot.id });
      }
    }

    console.log(`✅ Created ${created.length} social posts`);
    return new Response(JSON.stringify({
      success: true,
      created: created.length,
      posts: created,
      bots_processed: bots.length,
      timestamp: now,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ bot-social-posts error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message ?? error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
