import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Razorpay order for a one-off purchase (e.g., extra resume download)
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', resumeId, metadata = {} } = await req.json();

    if (!amount || amount <= 0 || amount > 100000) {
      throw new Error("Invalid amount. Must be between 1 and 100,000 (INR units)");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid user token");

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    // Demo mode fallback
    if (!keyId || !keySecret) {
      const demoOrderId = `demo_order_${Date.now()}`;
      await supabase.from('resume_orders').insert({
        user_id: userData.user.id,
        resume_id: resumeId ?? null,
        razorpay_order_id: demoOrderId,
        amount: Math.round(amount * 100),
        currency,
        status: 'pending',
        metadata
      });

      return new Response(JSON.stringify({
        orderId: demoOrderId,
        amount: Math.round(amount * 100),
        currency,
        keyId: 'rzp_demo_key',
        demo: true
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Live order creation
    const orderPayload = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `resume_${resumeId ?? 'generic'}_${Date.now()}`,
      notes: { purpose: 'one_off_download', resume_id: resumeId ?? '', ...metadata }
    };

    const authString = btoa(`${keyId}:${keySecret}`);
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authString}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      console.error('Razorpay create order error', e);
      throw new Error(e?.error?.description || 'Failed to create Razorpay order');
    }

    const order = await r.json();

    // Record pending order
    await supabase.from('resume_orders').insert({
      user_id: userData.user.id,
      resume_id: resumeId ?? null,
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
      metadata
    });

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('razorpay-create-oneoff error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Order creation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});