import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Simple, deterministic social post generator (no external AI, no emojis)
function generateSocialPost(bot: any, category?: string): { content: string } {
  const domain = bot?.content_domains?.[0] || 'career growth';
  const persona = bot?.name || 'TalentXcel';

  const libraries: Record<string, string[]> = {
    'System & Platform Updates': [
      'Continuous improvement keeps great tools relevant. We’ve completed performance upgrades to keep your experience smooth and reliable.',
      'Behind every seamless interaction is a system designed to work in your favor. We fine-tuned backend processes to make your journey more effortless.',
      'Great careers need dependable tools. We’ve optimized the platform to be faster, sharper, and aligned with real use.',
      'While you focus on growth, we focus on infrastructure. Searches and profile views now load more efficiently.',
    ],
    'Career Motivation': [
      'Every career is built step by step. The small actions you take today shape the big opportunities tomorrow.',
      'Growth rarely happens overnight. It is the outcome of persistence, learning, and resilience.',
      'The best way to predict the future is to build it — one skill, one connection, one opportunity at a time.',
      'Success is not about luck, but preparation meeting opportunity. Keep preparing.',
    ],
    'Jobs & Networking': [
      'The right role is about alignment with your goals and values, not just skills. Stay intentional.',
      'Networking is about cultivating meaningful professional relationships, not collecting contacts.',
      'Fresh opportunities are always emerging. The key is to stay prepared and visible.',
      'Referrals open doors. Nurture your network consistently.',
    ],
    'Learning & Skills': [
      'The fastest-growing careers are built on continuous learning and adaptation.',
      'Every skill you add compounds your professional value.',
      'Knowledge is powerful, but applied knowledge is transformative.',
      'A learning mindset keeps you competitive in an unpredictable world.',
    ],
    'Resume & Career Tools': [
      'Your resume is not just a document. It is your story in professional form.',
      'First impressions happen fast. A strong resume ensures you make the right one.',
      'A resume should highlight achievements, not just responsibilities.',
      'Career tools exist to amplify your effort, not replace it. Use them wisely.',
    ],
    'Community & Inspiration': [
      'No career is built alone. Every journey is supported by mentors, peers, and communities.',
      'Collaboration creates opportunities that competition never will.',
      'Success multiplies when shared. Lift others as you rise.',
      'A strong professional community is the backbone of resilient careers.',
    ],
  };

  const selectedCategory = category && libraries[category] ? category : 'Learning & Skills';
  const pool = libraries[selectedCategory];
  const line = pool[Math.floor(Math.random() * pool.length)];

  const body = [
    `${line}`,
    `${persona} • ${selectedCategory}`,
  ].join(' ');

  // No emojis, minimal formatting, no hashtags
  return { content: body };
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
    const limitBots = Math.max(1, Math.min(10, Number(body.limit_bots ?? 3)));
    const preset: string | undefined = body.preset;
    const totalPosts = Math.max(0, Number(body.total_posts ?? 0));
    const categories: string[] | undefined = Array.isArray(body.categories) ? body.categories : undefined;

    // Default posts per bot, can be overridden by preset
    let postsPerBot = Math.max(1, Math.min(10, Number(body.posts_per_bot ?? 1)));
    if (preset === 'linkedin_100' && totalPosts > 0) {
      // Distribute target across selected bots
      postsPerBot = Math.max(1, Math.ceil(totalPosts / limitBots));
    }

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
    let idx = 0;

    for (const bot of bots) {
      for (let i = 0; i < postsPerBot; i++) {
        const cat = categories && categories.length ? categories[idx % categories.length] : undefined;
        const { content } = generateSocialPost(bot, cat);
        idx++;

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
              category: cat ?? null,
              generated_at: now,
            },
          })
          .select('id')
          .single();

        if (insertErr) {
          console.error('Insert post failed for bot', bot.id, insertErr.message);
          continue;
        }

        created.push({ id: inserted?.id, bot_id: bot.id, category: cat });
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
