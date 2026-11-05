// supabase/functions/attribute-referral/index.ts
// Secure referral attribution engine with server-enforced fraud prevention.
// Requires user JWT. Idempotently creates or attributes referral records.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'throwawaymail.com',
  'temp-mail.org',
  'getairmail.com',
  'sharklasers.com',
  'trashmail.com',
]);

async function sha256Hash(input: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${input.trim().toLowerCase()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split('@');
  if (!domain) return email.toLowerCase().trim();
  // Strip +aliases (e.g. user+test -> user)
  const cleanLocal = local.split('+')[0].replace(/\./g, '');
  return `${cleanLocal}@${domain}`;
}

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
    const salt = Deno.env.get('REFERRAL_SALT') || supabaseAnonKey;

    // Verify user JWT
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

    const { referral_code, channel = 'direct', campaign_id, visitor_id } = body;
    if (!referral_code || typeof referral_code !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Missing referral_code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanCode = referral_code.trim().toUpperCase();

    // Use Service Role client for elevated checks & attribution
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Idempotency Check: Did this user already get attributed to a referral?
    const { data: existingAttribution } = await adminClient
      .from('referrals')
      .select('id, status, referrer_id')
      .eq('referred_id', user.id)
      .maybeSingle();

    if (existingAttribution) {
      return new Response(
        JSON.stringify({
          success: true,
          attributed: true,
          referral_id: existingAttribution.id,
          message: 'Already attributed',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Look up referrer from referral_code
    const { data: referrerRow } = await adminClient
      .from('referrals')
      .select('referrer_id')
      .eq('referral_code', cleanCode)
      .limit(1)
      .maybeSingle();

    if (!referrerRow?.referrer_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Referral code not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const referrerId = referrerRow.referrer_id;
    const fraudFlags: Array<{ flag_type: string; severity: string; details: Record<string, unknown> }> = [];

    // 3. Fraud Check A: Self Referral
    if (referrerId === user.id) {
      fraudFlags.push({
        flag_type: 'self_referral',
        severity: 'high',
        details: { message: 'Attempted self-referral with own code' },
      });
    }

    // 4. Fraud Check B: Disposable Email Domain
    const userEmail = (user.email || '').toLowerCase().trim();
    const emailDomain = userEmail.split('@')[1] || '';
    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      fraudFlags.push({
        flag_type: 'disposable_email',
        severity: 'high',
        details: { domain: emailDomain },
      });
    }

    // 5. Fraud Check C: Email Alias / Sibling Match
    const normalized = normalizeEmail(userEmail);
    if (normalized !== userEmail) {
      fraudFlags.push({
        flag_type: 'email_alias',
        severity: 'medium',
        details: { normalized_base_detected: true },
      });
    }

    // 6. Fraud Check D: IP / Device Velocity Check
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = await sha256Hash(clientIp.split(',')[0].trim(), salt);
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { count: recentCount } = await adminClient
      .from('referral_share_events')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if ((recentCount || 0) > 10) {
      fraudFlags.push({
        flag_type: 'velocity',
        severity: 'medium',
        details: { recent_events_from_hash: recentCount },
      });
    }

    const hasCriticalFlags = fraudFlags.some(f => f.severity === 'high' || f.severity === 'critical');
    const rewardStatus = fraudFlags.length > 0 ? 'held' : 'none';

    // 7. Insert new referral row for this referee
    const { data: newReferral, error: insertError } = await adminClient
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: user.id,
        referral_code: cleanCode,
        status: 'pending',
        reward_type: 'credit',
        reward_amount: 1000,
        referred_email: user.email,
        referred_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        source_channel: channel,
        campaign_id: campaign_id || null,
        reward_status: rewardStatus,
        metadata: {
          fraud_flags_count: fraudFlags.length,
          ip_hash: ipHash,
          attributed_at: new Date().toISOString(),
        },
      })
      .select('id, status')
      .single();

    if (insertError) {
      console.error('Error inserting attributed referral:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Could not record attribution' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 8. Record any fraud flags for admin inspection
    for (const flag of fraudFlags) {
      await adminClient.from('referral_fraud_flags').insert({
        referral_id: newReferral.id,
        referrer_id: referrerId,
        flag_type: flag.flag_type,
        severity: flag.severity,
        details: flag.details,
        status: 'open',
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        referral_id: newReferral.id,
        status: newReferral.status,
        flagged: fraudFlags.length > 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    console.error('attribute-referral error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
