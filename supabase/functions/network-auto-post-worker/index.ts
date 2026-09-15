import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const AUTHORIZED_EMAIL = 'talentxcelpro@gmail.com';

const ALL_PILLARS = [
  'careers',
  'jobs',
  'skills',
  'education',
  'resumes',
  'learning',
  'passport',
  'network',
  'ecosystem'
];

const SEED_LIBRARY = [
  { id: 'car-1', pillar: 'careers', text: 'Good resumes open doors for interviews. Strong skills keep them open.' },
  { id: 'car-2', pillar: 'careers', text: "The best career move isn't always a new job. Sometimes it's learning something genuinely valuable." },
  { id: 'car-3', pillar: 'careers', text: "Don't wait for the perfect career path. Build one step by step with consistent daily effort." },
  { id: 'job-1', pillar: 'jobs', text: 'Hiring is changing quickly. Practical skills are becoming far more important than formal job titles.' },
  { id: 'job-2', pillar: 'jobs', text: 'In technical interviews, showing how you think through ambiguity matters more than memorizing syntax.' },
  { id: 'skl-1', pillar: 'skills', text: 'Small improvements in your core skills can create surprisingly big opportunities over time.' },
  { id: 'skl-2', pillar: 'skills', text: 'Depth in one domain combined with broad literacy across related fields creates lasting professional versatility.' },
  { id: 'edu-1', pillar: 'education', text: 'A degree gets you started. What you can actually build takes you much further.' },
  { id: 'res-1', pillar: 'resumes', text: 'A clean resume layout with measurable achievements always outperforms decorative templates with complex formatting.' },
  { id: 'lrn-1', pillar: 'learning', text: 'Consistency in learning beats intensity. Thirty minutes of focused daily study creates extraordinary compound progress.' },
  { id: 'pas-1', pillar: 'passport', text: 'A verifiable digital career record gives employers instant confidence in your authentic skills and achievements.' },
  { id: 'net-1', pillar: 'network', text: 'Networking works best when you focus on offering help and sharing insights rather than asking for favors.' },
  { id: 'eco-1', pillar: 'ecosystem', text: 'A good career platform should help you discover opportunities, build skills, and understand where you are heading.' }
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Verify caller authorization
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;
    let userId = '';

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user && (user.email === AUTHORIZED_EMAIL || user.app_metadata?.role === 'admin')) {
        isAuthorized = true;
        userId = user.id;
      }
    }

    // Also allow service role calls from cron triggers
    if (req.headers.get('x-source') === 'supabase-cron') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED_CALLER' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Resolve admin user ID if not provided
    if (!userId) {
      const { data: adminUser } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', AUTHORIZED_EMAIL)
        .maybeSingle();

      userId = adminUser?.id || '';
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'AUTHORIZED_USER_NOT_FOUND' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Atomically claim auto-post slot
    const { data: claimResult, error: claimError } = await supabaseClient.rpc(
      'claim_and_execute_auto_post_slot',
      { p_user_id: userId, p_is_manual: false }
    );

    if (claimError || !claimResult?.success) {
      return new Response(
        JSON.stringify({ 
          status: 'SKIPPED', 
          reason: claimResult?.error || claimError?.message || 'SLOT_NOT_AVAILABLE' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Fetch recent posts for deduplication
    const { data: recentPosts } = await supabaseClient
      .from('network_auto_posts')
      .select('content, pillar')
      .order('created_at', { ascending: false })
      .limit(20);

    const pastTexts = (recentPosts || []).map((p: any) => normalizeText(p.content));
    const lastPillar = recentPosts?.[0]?.pillar;

    // Pick candidate seed
    const candidatePool = SEED_LIBRARY.filter(s => 
      s.pillar !== lastPillar && !pastTexts.includes(normalizeText(s.text))
    );

    const candidate = candidatePool.length > 0
      ? candidatePool[Math.floor(Math.random() * candidatePool.length)]
      : SEED_LIBRARY[Math.floor(Math.random() * SEED_LIBRARY.length)];

    const wordCount = countWords(candidate.text);
    if (wordCount < 10 || wordCount > 25) {
      return new Response(
        JSON.stringify({ error: 'INVALID_SEED_LENGTH', wordCount }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Publish to public.posts
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .insert({
        content: candidate.text,
        post_type: 'text',
        author_id: userId,
        user_id: userId,
        visibility: 'public',
        origin: 'feed',
        media_urls: [],
        tags: []
      })
      .select()
      .single();

    if (postError) {
      throw postError;
    }

    // 6. Record audit log
    await supabaseClient
      .from('network_auto_posts')
      .insert({
        post_id: post.id,
        user_id: userId,
        content: candidate.text,
        pillar: candidate.pillar,
        word_count: wordCount,
        status: 'published',
        similarity_hash: normalizeText(candidate.text),
        published_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: post.id,
        content: candidate.text,
        pillar: candidate.pillar,
        wordCount,
        postsTodayCount: claimResult.posts_today_count,
        nextScheduledAt: claimResult.next_post_scheduled_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
