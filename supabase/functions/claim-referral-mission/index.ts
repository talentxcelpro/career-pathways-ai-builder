// supabase/functions/claim-referral-mission/index.ts
// Server-enforced mission qualification and reward claiming engine.
// Requires user JWT. Idempotent payout through txc_award_reward stored procedure.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(null, { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { mission_id, period_key = 'lifetime' } = body;
    if (!mission_id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing mission_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Check Global Kill-Switch
    const { data: settings } = await adminClient
      .from('referral_program_settings')
      .select('rewards_paused, daily_txc_budget')
      .eq('id', 1)
      .single();

    if (settings?.rewards_paused) {
      return new Response(
        JSON.stringify({ success: false, error: 'Reward distributions are temporarily paused for maintenance' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch Mission Definition
    const { data: mission, error: missionError } = await adminClient
      .from('referral_missions')
      .select('*')
      .eq('id', mission_id)
      .eq('is_active', true)
      .single();

    if (missionError || !mission) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mission not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check for existing claim (Idempotency)
    const { data: existingClaim } = await adminClient
      .from('referral_mission_claims')
      .select('id, claimed_at')
      .eq('user_id', user.id)
      .eq('mission_id', mission.id)
      .eq('period_key', period_key)
      .maybeSingle();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mission reward already claimed for this period' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Server-Side Re-verification of Mission Qualification Criteria
    let qualified = false;

    if (mission.mission_type === 'referral_count') {
      const { count } = await adminClient
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('status', 'completed');
      qualified = (count || 0) >= mission.threshold;
    } else if (mission.key === 'publish_article') {
      const { count } = await adminClient
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('status', 'published');
      qualified = (count || 0) >= 1;
    } else if (mission.key === 'share_passport') {
      const { count } = await adminClient
        .from('referral_share_events')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('channel', 'copy');
      qualified = (count || 0) >= 1;
    } else if (mission.key === 'invite_recruiter') {
      const { count } = await adminClient
        .from('referrals')
        .select('id, user_roles!inner(role)', { count: 'exact', head: true })
        .eq('referrer_id', user.id)
        .eq('status', 'completed')
        .eq('user_roles.role', 'employer');
      qualified = (count || 0) >= 1;
    }

    if (!qualified) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mission completion criteria not yet satisfied' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Credit TXC Platform Credits via txc_award_reward RPC
    const idempotencyKey = `mission_claim_${user.id}_${mission.id}_${period_key}`;
    const { data: rpcResult, error: rpcError } = await adminClient.rpc('txc_award_reward', {
      p_user_id: user.id,
      p_action: 'mission_reward',
      p_amount: mission.reward_txc,
      p_description: `Mission reward: ${mission.title}`,
      p_cooldown_minutes: 0,
      p_reference_id: mission.id,
      p_idempotency_key: idempotencyKey,
    });

    if (rpcError) {
      console.error('Error awarding TXC for mission:', rpcError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to distribute platform reward' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Record Mission Claim
    const { error: claimInsertError } = await adminClient.from('referral_mission_claims').insert({
      user_id: user.id,
      mission_id: mission.id,
      period_key: period_key,
      reward_txc: mission.reward_txc,
    });

    if (claimInsertError) {
      console.error('Error inserting claim record:', claimInsertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reward_txc: mission.reward_txc,
        new_balance: rpcResult?.newBalance ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('claim-referral-mission error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
