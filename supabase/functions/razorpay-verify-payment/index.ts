// supabase/functions/razorpay-verify-payment/index.ts
// Dual-Mode Razorpay Payment Verification & Webhook Lifecycle Engine
// Remediated per Task 002: Enforces fail-closed production controls (SEC-005),
// cryptographic bid verification (SEC-002), and one-off resume payment support (SEC-004).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

// Constant-time string equality check to prevent timing attacks
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// HMAC-SHA256 signature generator using Web Crypto API
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const algorithm = { name: "HMAC", hash: "SHA-256" };

  const key = await crypto.subtle.importKey("raw", keyData, algorithm, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || razorpayKeySecret;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Database configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MODE 1: RAZORPAY WEBHOOK LIFECYCLE HANDLER
    // Detected by presence of 'x-razorpay-signature' header or ?mode=webhook
    // ─────────────────────────────────────────────────────────────────────────
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const isWebhookMode = Boolean(webhookSignature) || new URL(req.url).searchParams.get("mode") === "webhook";

    if (isWebhookMode) {
      if (!webhookSignature) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing x-razorpay-signature header for webhook." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!webhookSecret) {
        console.error("FATAL [SEC-005]: RAZORPAY_WEBHOOK_SECRET / RAZORPAY_KEY_SECRET not set.");
        return new Response(
          JSON.stringify({ error: "Webhook secret not configured on server." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawBody = await req.text();
      const expectedSignature = await createSignature(rawBody, webhookSecret);

      if (!timingSafeEqualStr(expectedSignature, webhookSignature)) {
        console.warn("Rejecting Razorpay webhook: cryptographic signature mismatch");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const event = JSON.parse(rawBody);
      const eventType = event.event;
      console.log(`[razorpay-webhook] Verified event: ${eventType} (id: ${event.id || 'N/A'})`);

      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });

      const payload = event.payload || {};

      switch (eventType) {
        case "subscription.charged": {
          const subEntity = payload.subscription?.entity;
          const paymentEntity = payload.payment?.entity;
          const subId = subEntity?.id;
          const notes = subEntity?.notes || paymentEntity?.notes || {};
          const userId = notes.user_id;

          let query = supabaseClient.from("subscribers").update({
            subscribed: true,
            status: "active",
            last_payment_date: new Date().toISOString(),
            last_payment_id: paymentEntity?.id || null,
            next_billing_date: subEntity?.charge_at 
              ? new Date(subEntity.charge_at * 1000).toISOString()
              : null,
            subscription_end: subEntity?.current_end 
              ? new Date(subEntity.current_end * 1000).toISOString()
              : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (subId) {
            await query.eq("razorpay_subscription_id", subId);
          } else if (userId) {
            await query.eq("user_id", userId);
          }
          break;
        }

        case "payment.captured": {
          const paymentEntity = payload.payment?.entity;
          const notes = paymentEntity?.notes || {};
          const userId = notes.user_id;
          const paymentId = paymentEntity?.id;

          if (userId && paymentId) {
            const tier = notes.tier || "Pro";
            const planName = notes.plan_name || `Career ${tier}`;
            const subEnd = new Date();
            subEnd.setMonth(subEnd.getMonth() + 1);

            await supabaseClient.from("subscribers").upsert({
              user_id: userId,
              subscribed: true,
              subscription_plan: planName,
              subscription_tier: tier,
              status: "active",
              last_payment_id: paymentId,
              last_payment_date: new Date().toISOString(),
              subscription_end: subEnd.toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          }
          break;
        }

        default:
          console.log(`[razorpay-webhook] Handled verified event: ${eventType}`);
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MODE 2: CLIENT CHECKOUT VERIFICATION
    // Requires Bearer token from authenticated user session
    // ─────────────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required. Missing Bearer token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired user session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUser = userData.user;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON request payload." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required payment parameters (order_id, payment_id)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Environment and Fail-Closed Guard (SEC-005)
    const env = Deno.env.get("ENVIRONMENT") || "production";
    const isDevelopment = env === "development" || env === "local";
    const allowDemo = Deno.env.get("ALLOW_DEMO_PAYMENTS") === "true" && isDevelopment;

    if (razorpay_order_id.startsWith("demo_order_")) {
      if (!allowDemo) {
        console.error(`SECURITY ALERT [SEC-005]: Rejected demo order '${razorpay_order_id}' in non-demo environment.`);
        return new Response(
          JSON.stringify({ success: false, error: "Demo orders are not permitted in this environment. Real payment verification required." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.warn(`[razorpay-verify-payment] ALLOW_DEMO_PAYMENTS active in development for user ${authenticatedUser.id}`);
      const targetTier = body.tier || "Pro";
      const targetPlan = body.planName || `Career ${targetTier}`;
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      await supabaseClient
        .from("subscribers")
        .upsert({
          user_id: authenticatedUser.id,
          email: authenticatedUser.email,
          subscribed: true,
          subscription_plan: targetPlan,
          subscription_tier: targetTier,
          subscription_start: subscriptionStart.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          next_billing_date: subscriptionEnd.toISOString(),
          status: 'active',
          last_payment_date: new Date().toISOString(),
          last_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: `Demo order verified. ${targetPlan} activated.`,
          subscription: {
            tier: targetTier,
            plan: targetPlan,
            status: 'active',
            ends_at: subscriptionEnd.toISOString(),
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fail-Closed: Secret must be present (SEC-005)
    if (!razorpayKeySecret) {
      console.error("FATAL [SEC-005]: RAZORPAY_KEY_SECRET is not configured in Supabase environment secrets.");
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway configuration error. Secret key missing on server." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required payment signature." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cryptographic signature check (HMAC-SHA256)
    const payloadToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await createSignature(payloadToSign, razorpayKeySecret);

    if (!timingSafeEqualStr(expectedSignature, razorpay_signature)) {
      console.warn(`[SEC-002] Cryptographic signature mismatch for order ${razorpay_order_id}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature. Verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT BRANCH 1: CLAIM #1 BID VERIFICATION (SEC-002)
    // ─────────────────────────────────────────────────────────────────────────
    if (body.packageType === 'Claim1Bid' || body.mode === 'claim1_bid') {
      const {
        listingId,
        idempotencyKey,
        bidAmount,
        currency = 'INR',
        metadata = {}
      } = body;

      if (!listingId || !bidAmount || !idempotencyKey) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required bid parameters (listingId, bidAmount, idempotencyKey)." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check replay attack in claim1_payments
      const { data: existingBidPayment } = await supabaseClient
        .from("claim1_payments")
        .select("id, status, user_id, listing_id")
        .eq("provider_payment_id", razorpay_payment_id)
        .maybeSingle();

      if (existingBidPayment) {
        if (existingBidPayment.user_id === authenticatedUser.id) {
          return new Response(
            JSON.stringify({ success: true, isReplay: true, message: "Bid payment already verified." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } else {
          console.error(`SECURITY ALERT [SEC-002]: Replay attempt of payment ${razorpay_payment_id} by user ${authenticatedUser.id}`);
          return new Response(
            JSON.stringify({ success: false, error: "Payment transaction already registered to another account." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
          );
        }
      }

      // Securely execute privileged stored procedure via service_role client ONLY AFTER signature verification
      const { data: bidResult, error: bidError } = await supabaseClient.rpc('claim1_process_verified_bid', {
        p_idempotency_key: String(idempotencyKey),
        p_listing_id: String(listingId),
        p_user_id: authenticatedUser.id,
        p_bid_amount: Number(bidAmount),
        p_currency: String(currency),
        p_provider: 'razorpay',
        p_provider_order_id: String(razorpay_order_id),
        p_provider_payment_id: String(razorpay_payment_id),
        p_provider_signature: String(razorpay_signature),
        p_metadata: metadata
      });

      if (bidError || !bidResult?.success) {
        console.error("Failed to commit verified bid in database:", bidError || bidResult?.error);
        return new Response(
          JSON.stringify({ success: false, error: bidResult?.error || bidError?.message || "Failed to commit bid." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Bid payment cryptographically verified and ranking updated.",
          data: bidResult
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT BRANCH 2: RESUME DOWNLOAD ONE-OFF VERIFICATION (SEC-004)
    // ─────────────────────────────────────────────────────────────────────────
    if (body.packageType === 'ResumeDownload' || body.mode === 'resume_download') {
      const { resumeId } = body;
      if (!resumeId) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required resumeId parameter." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record download atomically
      const { data: recordData, error: recordError } = await supabaseClient.rpc('record_resume_download_atomic', {
        p_resume_id: resumeId
      });

      if (recordError) {
        console.error("Failed to record resume download atomically:", recordError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Resume download payment verified.",
          data: recordData
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCT BRANCH 3: STANDARD SUBSCRIPTION VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    // Replay Protection in subscribers table
    const { data: existingPayment } = await supabaseClient
      .from("subscribers")
      .select("user_id, subscription_plan, subscription_tier, status, subscription_end, last_payment_id")
      .eq("last_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      if (existingPayment.user_id === authenticatedUser.id) {
        return new Response(
          JSON.stringify({
            success: true,
            isReplay: true,
            message: "Payment already verified and subscription is active.",
            subscription: {
              tier: existingPayment.subscription_tier,
              plan: existingPayment.subscription_plan,
              status: existingPayment.status,
              ends_at: existingPayment.subscription_end,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        console.error(`SECURITY ALERT: Payment ${razorpay_payment_id} previously used by ${existingPayment.user_id}, replay attempted by ${authenticatedUser.id}`);
        return new Response(
          JSON.stringify({ success: false, error: "Payment transaction has already been registered to another account." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }
    }

    // Successful Verification: Activate Subscription Atomically
    const targetTier = body.tier || "Pro";
    const targetPlan = body.planName || `Career ${targetTier}`;
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    const { error: upsertError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: authenticatedUser.id,
        email: authenticatedUser.email,
        subscribed: true,
        subscription_plan: targetPlan,
        subscription_tier: targetTier,
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        next_billing_date: subscriptionEnd.toISOString(),
        status: 'active',
        last_payment_date: new Date().toISOString(),
        last_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error("Database upsert error during subscription activation:", upsertError);
      return new Response(
        JSON.stringify({ success: false, error: "Payment verified but subscription activation failed. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Payment verified successfully. ${targetPlan} activated.`,
        subscription: {
          tier: targetTier,
          plan: targetPlan,
          status: 'active',
          ends_at: subscriptionEnd.toISOString(),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in razorpay-verify-payment:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || "Payment verification failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
