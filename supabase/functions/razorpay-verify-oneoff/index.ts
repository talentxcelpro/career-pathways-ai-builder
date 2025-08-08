import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function createSignature(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify one-off Razorpay payment and grant a download credit
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resumeId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required verification parameters');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error('Invalid user');

    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    // Demo mode acceptance
    const isDemo = !secret || razorpay_signature === 'demo_signature';
    if (!isDemo) {
      const expected = await createSignature(`${razorpay_order_id}|${razorpay_payment_id}`, secret!);
      if (expected !== razorpay_signature) throw new Error('Invalid payment signature');
    }

    // Mark order as paid
    await supabase
      .from('resume_orders')
      .update({ status: 'paid', razorpay_payment_id, updated_at: new Date().toISOString() })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', userData.user.id);

    // Grant one download credit (increment download_count)
    const rid = resumeId ?? null;
    const { data: existing } = await supabase
      .from('resume_downloads')
      .select('id, download_count')
      .eq('user_id', userData.user.id)
      .eq('resume_id', rid)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('resume_downloads')
        .update({
          download_count: (existing.download_count || 0) + 1,
          last_download_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('resume_downloads')
        .insert({
          user_id: userData.user.id,
          resume_id: rid,
          download_count: 1,
          last_download_at: new Date().toISOString(),
        });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('razorpay-verify-oneoff error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});