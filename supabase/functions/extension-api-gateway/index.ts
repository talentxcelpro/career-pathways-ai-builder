import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS = {
  'profile-sync': { requests: 100, window: 3600000 }, // 100 requests per hour
  'job-matching': { requests: 200, window: 3600000 }, // 200 requests per hour
  'ai-features': { requests: 50, window: 3600000 }, // 50 requests per hour
  'default': { requests: 300, window: 3600000 }, // 300 requests per hour
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, endpoint, method = 'GET', payload, rateLimitCategory = 'default' } = await req.json();

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('chrome_extension_sessions')
      .select('user_id, extension_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const rateLimitKey = `${session.user_id}:${rateLimitCategory}`;
    const now = Date.now();
    const limit = RATE_LIMITS[rateLimitCategory as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    
    let rateLimitData = rateLimitStore.get(rateLimitKey);
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = { count: 0, resetTime: now + limit.window };
    }

    if (rateLimitData.count >= limit.requests) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded',
          resetTime: rateLimitData.resetTime
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    rateLimitData.count++;
    rateLimitStore.set(rateLimitKey, rateLimitData);

    // Security validation
    const allowedEndpoints = [
      'linkedin-profile-extractor',
      'extension-txc-miner',
      'ai-profile-optimizer',
      'universal-job-matcher',
      'naukri-profile-sync',
      'twitter-professional-sync',
      'instagram-creator-sync',
      'indeed-glassdoor-integration',
      'activity-reward-engine',
      'referral-bonus-system',
      'achievement-tracker',
      'ai-job-application-assistant',
      'ai-cover-letter-generator',
      'ai-interview-prep',
      'ai-salary-negotiator'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized endpoint' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API call
    await supabase
      .from('extension_api_logs')
      .insert({
        user_id: session.user_id,
        extension_id: session.extension_id,
        endpoint,
        method,
        rate_limit_category: rateLimitCategory,
        timestamp: new Date().toISOString()
      });

    // Forward request to appropriate edge function
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: { sessionToken, ...payload }
    });

    if (error) {
      console.error(`API Gateway error for ${endpoint}:`, error);
      return new Response(
        JSON.stringify({ success: false, error: 'Internal service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Gateway error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});