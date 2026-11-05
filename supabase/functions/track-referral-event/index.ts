// supabase/functions/track-referral-event/index.ts
// Public edge function for recording privacy-preserving referral share & open telemetry.
// Compliant with India DPDP Act 2023: Raw IP and User Agent are NEVER stored.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';

const BOT_USER_AGENTS = [
  'whatsapp',
  'telegrambot',
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'applebot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'curl',
  'wget',
  'python-requests',
  'postmanruntime',
];

async function sha256Hash(input: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${input.trim().toLowerCase()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();

    // 1. Bot & Link-Preview Crawler Filter: Return 204 silently without recording
    if (BOT_USER_AGENTS.some(bot => userAgent.includes(bot))) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Rate limit (60 requests per minute per IP hash)
    const rateLimit = await checkRateLimit(req, {
      endpoint: 'track-referral-event',
      maxRequests: 60,
      windowSeconds: 60,
      failClosed: false,
    });

    if (!rateLimit.allowed) {
      return new Response(null, { status: 429, headers: corsHeaders });
    }

    // 3. Parse and validate body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(null, { status: 400, headers: corsHeaders });
    }

    const { referral_code, event_type, channel = 'direct', campaign_id, visitor_id } = body;

    if (!referral_code || typeof referral_code !== 'string') {
      return new Response(null, { status: 400, headers: corsHeaders });
    }

    const cleanCode = referral_code.trim().toUpperCase();
    const validEvents = ['share_click', 'link_open', 'signup_started'];
    const cleanEventType = validEvents.includes(event_type) ? event_type : 'link_open';

    const validChannels = [
      'whatsapp',
      'telegram',
      'linkedin',
      'x',
      'facebook',
      'email',
      'copy',
      'qr',
      'native',
      'direct',
    ];
    const cleanChannel = validChannels.includes(channel) ? channel : 'direct';

    // 4. Compute privacy hashes
    const salt = Deno.env.get('REFERRAL_SALT') || Deno.env.get('SUPABASE_ANON_KEY') || 'txc_salt_2026';
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ipHash = await sha256Hash(clientIp.split(',')[0].trim(), salt);
    const uaHash = await sha256Hash(userAgent, salt);
    const visitorHash = await sha256Hash(visitor_id || `${clientIp}:${userAgent}`, salt);

    // 5. Connect via service-role to query & write event
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(null, { status: 500, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Find referrer_id from referral_code in referrals table
    const { data: referral } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referral_code', cleanCode)
      .limit(1)
      .maybeSingle();

    if (!referral?.referrer_id) {
      // Don't leak code validity; return 204
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Insert share event (idempotency handled by deduplication index)
    const { error: insertError } = await supabase.from('referral_share_events').insert({
      referrer_id: referral.referrer_id,
      referral_code: cleanCode,
      event_type: cleanEventType,
      channel: cleanChannel,
      campaign_id: campaign_id || null,
      visitor_hash: visitorHash,
      ua_hash: uaHash,
      ip_hash: ipHash,
    });

    if (insertError && !insertError.message?.includes('duplicate key')) {
      console.warn('Share event insert warning:', insertError.message);
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error('track-referral-event error:', err);
    return new Response(null, { status: 500, headers: corsHeaders });
  }
});
