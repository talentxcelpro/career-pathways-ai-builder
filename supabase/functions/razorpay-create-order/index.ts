// supabase/functions/razorpay-create-order/index.ts
// Secure Razorpay Order Creation for TalentXcel Subscriptions & Services
// Remediated per Task 002: Enforces fail-closed production controls (SEC-005).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation and sanitization
    const amount = parseFloat(body.amount);
    const currency = (body.currency || "INR").toUpperCase();
    const planId = body.planId ? String(body.planId).slice(0, 100) : null;
    const serviceId = body.serviceId ? String(body.serviceId).slice(0, 100) : "career_accelerator";
    const packageType = body.packageType ? String(body.packageType).slice(0, 50) : null;
    
    // Validate required fields (amount in Rupees, max ₹100,000)
    if (!amount || amount <= 0 || amount > 100000) {
      throw new Error("Invalid amount. Must be between 1 and 100,000");
    }
    
    if (!["INR", "USD", "EUR"].includes(currency)) {
      throw new Error("Invalid currency");
    }

    // Determine resolved plan and tier
    let tier = "Pro";
    let planName = "Career Pro";
    const rawIdentifier = (body.tier || planId || packageType || "").toLowerCase();
    
    if (rawIdentifier.includes("premium") || rawIdentifier.includes("elite") || rawIdentifier.includes("999")) {
      tier = "Premium";
      planName = "Career Premium";
    } else if (rawIdentifier.includes("starter") || rawIdentifier.includes("basic") || rawIdentifier.includes("199")) {
      tier = "Starter";
      planName = "Career Starter";
    } else if (rawIdentifier.includes("resume") || rawIdentifier.includes("oneoff")) {
      tier = "OneOff";
      planName = "Resume Download";
    } else {
      tier = "Pro";
      planName = "Career Pro";
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
          amount: Math.round(amount * 100),
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
    const amountInPaise = Math.round(amount * 100);
    const orderData = {
      amount: amountInPaise,
      currency: currency,
      receipt: `tx_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        service_id: serviceId,
        package_type: packageType || tier,
        tier: tier,
        plan_name: planName,
        user_id: user.id
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
