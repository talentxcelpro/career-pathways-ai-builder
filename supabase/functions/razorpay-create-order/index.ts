// supabase/functions/razorpay-create-order/index.ts
// Secure Razorpay Order Creation for TalentXcel Subscriptions & AI Credit Packs
// Server-side authoritative pricing (Zero client-supplied price trust)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// Canonical immutable pricing catalog enforced strictly by server (in integer paise)
const CANONICAL_PLANS: Record<string, { tier: string; planName: string; priceRupees: number; pricePaise: number }> = {
  starter:  { tier: "starter",  planName: "TalentXcel Starter",  priceRupees: 299,  pricePaise: 29900 },
  pro:      { tier: "pro",      planName: "TalentXcel Pro",      priceRupees: 499,  pricePaise: 49900 },
  max:      { tier: "max",      planName: "TalentXcel Max",      priceRupees: 999,  pricePaise: 99900 },
  business: { tier: "business", planName: "TalentXcel Business", priceRupees: 2499, pricePaise: 249900 },
};

const CANONICAL_CREDIT_PACKS: Record<string, { credits: number; priceRupees: number; pricePaise: number }> = {
  'ai-pack-100':  { credits: 100,  priceRupees: 199,  pricePaise: 19900 },
  'ai-pack-300':  { credits: 300,  priceRupees: 499,  pricePaise: 49900 },
  'ai-pack-1000': { credits: 1000, priceRupees: 1499, pricePaise: 149900 },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation
    const currency = (body.currency || "INR").toUpperCase();
    const planId = (body.planId || body.tier || "").toLowerCase().trim();
    const purchaseType = body.purchaseType || (body.creditPackId ? 'ai_credits' : 'subscription');
    
    if (currency !== "INR") {
      throw new Error("Invalid currency. Only INR is supported.");
    }

    let tier = "pro";
    let planName = "TalentXcel Pro";
    let amountInPaise: number = 49900;
    let creditsCount = 0;

    if (purchaseType === 'ai_credits') {
      const packKey = body.creditPackId || 'ai-pack-100';
      const pack = CANONICAL_CREDIT_PACKS[packKey] || CANONICAL_CREDIT_PACKS['ai-pack-100'];
      tier = 'credits';
      planName = `${pack.credits} AI Credits Pack`;
      amountInPaise = pack.pricePaise;
      creditsCount = pack.credits;
    } else {
      // Subscriptions strictly enforce canonical server prices (never trust client body.amount)
      if (planId.includes("business") || planId.includes("team") || planId.includes("agency")) {
        tier = CANONICAL_PLANS.business.tier;
        planName = CANONICAL_PLANS.business.planName;
        amountInPaise = CANONICAL_PLANS.business.pricePaise;
      } else if (planId.includes("max") || planId.includes("premium") || planId.includes("executive")) {
        tier = CANONICAL_PLANS.max.tier;
        planName = CANONICAL_PLANS.max.planName;
        amountInPaise = CANONICAL_PLANS.max.pricePaise;
      } else if (planId.includes("starter") || planId.includes("basic")) {
        tier = CANONICAL_PLANS.starter.tier;
        planName = CANONICAL_PLANS.starter.planName;
        amountInPaise = CANONICAL_PLANS.starter.pricePaise;
      } else {
        tier = CANONICAL_PLANS.pro.tier;
        planName = CANONICAL_PLANS.pro.planName;
        amountInPaise = CANONICAL_PLANS.pro.pricePaise;
      }
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new Error("Invalid user token or session expired");
    }

    const user = userData.user;

    // Get Razorpay credentials from secrets
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      // Return simulated mock order for sandbox / local development if keys not set
      console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment. Returning local simulated test order.");
      const mockOrderId = `order_local_${Date.now()}`;
      return new Response(
        JSON.stringify({
          orderId: mockOrderId,
          amount: amountInPaise,
          currency: "INR",
          keyId: razorpayKeyId || "rzp_test_placeholder",
          planName,
          tier,
          isSimulated: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Razorpay API to create live order
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const receiptId = `rcpt_${Date.now()}_${user.id.slice(0, 8)}`;

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        payment_capture: 1,
        notes: {
          user_id: user.id,
          user_email: user.email,
          tier: tier,
          plan_name: planName,
          purchase_type: purchaseType,
          credits: creditsCount.toString(),
          ecosystem: "talentxcel"
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errText = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errText);
      throw new Error(`Razorpay API error: ${errText}`);
    }

    const orderData = await razorpayResponse.json();

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: razorpayKeyId,
        planName,
        tier,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create order" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
