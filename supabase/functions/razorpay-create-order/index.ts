// supabase/functions/razorpay-create-order/index.ts
// Secure Razorpay Order Creation for TalentXcel Subscriptions & Services
// Remediated per Task 002: Enforces fail-closed production controls (SEC-005).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// Canonical immutable pricing catalog enforced strictly by server
const CANONICAL_PLANS: Record<string, { tier: string; planName: string; priceRupees: number; pricePaise: number }> = {
  starter: { tier: "Starter", planName: "Career Starter", priceRupees: 199, pricePaise: 19900 },
  pro: { tier: "Pro", planName: "Career Pro", priceRupees: 499, pricePaise: 49900 },
  premium: { tier: "Premium", planName: "Career Premium", priceRupees: 999, pricePaise: 99900 },
  oneoff: { tier: "OneOff", planName: "Resume Download", priceRupees: 49, pricePaise: 4900 },
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation and sanitization
    const currency = (body.currency || "INR").toUpperCase();
    const planId = body.planId ? String(body.planId).slice(0, 100) : null;
    const serviceId = body.serviceId ? String(body.serviceId).slice(0, 100) : "career_accelerator";
    const packageType = body.packageType ? String(body.packageType).slice(0, 50) : null;
    
    if (!["INR", "USD", "EUR"].includes(currency)) {
      throw new Error("Invalid currency");
    }

    // Determine resolved plan, tier, and authoritative server price
    const rawIdentifier = (body.tier || planId || packageType || "").toLowerCase();
    const isClaim1Bid = packageType === 'Claim1Bid' || rawIdentifier.includes('claim1');
    const isResumeDownload = packageType === 'ResumeDownload' || rawIdentifier.includes('resume') || rawIdentifier.includes('oneoff');

    let tier = "Pro";
    let planName = "Career Pro";
    let amountInPaise: number;

    if (isClaim1Bid) {
      // For Claim #1 bids, the amount is user-specified but must satisfy bounds
      const rawAmount = parseFloat(body.amount);
      if (!rawAmount || isNaN(rawAmount) || rawAmount < 50 || rawAmount > 100000) {
        throw new Error("Invalid bid amount. Must be between ₹50 and ₹100,000");
      }
      tier = "Bid";
      planName = "Claim #1 Bid";
      amountInPaise = Math.round(rawAmount * 100);
    } else if (isResumeDownload) {
      // Resume download is fixed at canonical server price (₹49)
      tier = CANONICAL_PLANS.oneoff.tier;
      planName = CANONICAL_PLANS.oneoff.planName;
      amountInPaise = CANONICAL_PLANS.oneoff.pricePaise;
    } else {
      // Subscriptions strictly enforce canonical server prices (never trust client body.amount)
      if (rawIdentifier.includes("premium") || rawIdentifier.includes("elite") || rawIdentifier.includes("999")) {
        tier = CANONICAL_PLANS.premium.tier;
        planName = CANONICAL_PLANS.premium.planName;
        amountInPaise = CANONICAL_PLANS.premium.pricePaise;
      } else if (rawIdentifier.includes("starter") || rawIdentifier.includes("basic") || rawIdentifier.includes("199")) {
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

    const env = Deno.env.get("ENVIRONMENT") || "production";
    const isDevelopment = env === "development" || env === "local";
    const allowDemo = Deno.env.get("ALLOW_DEMO_PAYMENTS") === "true" && isDevelopment;

    if (!razorpayKeyId || !razorpayKeySecret) {
      if (!allowDemo) {
        console.error("FATAL [SEC-005]: Razorpay credentials missing in non-demo environment. Failing closed.");
        return new Response(
          JSON.stringify({ 
            error: "Payment gateway credentials are not configured on server. Order creation rejected." 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.warn("[razorpay-create-order] ALLOW_DEMO_PAYMENTS active in local development. Generating demo order.");
      
      const demoOrder = {
        orderId: `demo_order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: currency,
        keyId: "rzp_demo_key",
        tier: tier,
        planName: planName,
        demo: true
      };
      
      await supabaseClient
        .from("subscribers")
        .upsert({
          user_id: user.id,
          email: user.email,
          subscribed: false,
          subscription_plan: planName,
          subscription_tier: tier,
          amount: amountInPaise,
          currency: currency,
          status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return new Response(JSON.stringify(demoOrder), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Razorpay order with verified provider credentials
    const orderData = {
      amount: amountInPaise,
      currency: currency,
      receipt: `tx_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        service_id: serviceId,
        package_type: packageType || tier,
        tier: tier,
        plan_name: planName,
        user_id: user.id,
        expected_amount: String(amountInPaise),
      }
    };

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("Razorpay order API error:", errorData);
      throw new Error(errorData.error?.description || "Failed to create Razorpay order");
    }

    const order = await razorpayResponse.json();
    console.log(`Razorpay order created successfully: ${order.id} for user ${user.id} (${tier})`);

    // Store pending order in subscribers table for subscription tracking (if subscription product)
    if (packageType !== 'Claim1Bid' && packageType !== 'ResumeDownload') {
      const { error: insertError } = await supabaseClient
        .from("subscribers")
        .upsert({
          user_id: user.id,
          email: user.email,
          subscribed: false,
          subscription_plan: planName,
          subscription_tier: tier,
          amount: amountInPaise,
          currency: currency,
          status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (insertError) {
        console.error("Database upsert error:", insertError);
        throw new Error("Failed to store subscription order");
      }
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
        tier: tier,
        planName: planName
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || "Failed to create payment order" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
