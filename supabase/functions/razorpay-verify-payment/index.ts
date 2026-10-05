// supabase/functions/razorpay-verify-payment/index.ts
// Cryptographically Secured Razorpay Payment Verification with Replay Protection & Constant-Time Validation

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

    // 1. FAIL CLOSED: If gateway secret or DB credentials are missing, strictly abort
    if (!razorpayKeySecret) {
      console.error("FATAL: RAZORPAY_KEY_SECRET is not configured in Supabase environment secrets.");
      return new Response(
        JSON.stringify({ success: false, error: "Payment gateway configuration error. Secret key missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Database configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authenticate User Session
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

    // 3. Parse and Validate Payment Parameters
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required payment verification parameters (order_id, payment_id, signature)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. PAYMENT REPLAY PROTECTION: Verify payment_id has not already been registered
    const { data: existingPayment } = await supabaseClient
      .from("subscribers")
      .select("user_id, subscription_tier, status, subscription_end, last_payment_id")
      .eq("last_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingPayment) {
      // If already processed for THIS user, return existing entitlement idempotently without extending
      if (existingPayment.user_id === authenticatedUser.id) {
        console.log(`Idempotent replay detected for payment ${razorpay_payment_id} by user ${authenticatedUser.id}`);
        return new Response(
          JSON.stringify({
            success: true,
            isReplay: true,
            message: "Payment already verified and subscription is active.",
            subscription: {
              tier: existingPayment.subscription_tier,
              status: existingPayment.status,
              ends_at: existingPayment.subscription_end,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        // Payment ID was claimed by another user account: FRAUD ATTEMPT
        console.error(`SECURITY ALERT: Payment ${razorpay_payment_id} previously used by ${existingPayment.user_id}, replay attempted by ${authenticatedUser.id}`);
        return new Response(
          JSON.stringify({ success: false, error: "Payment transaction has already been registered to another account." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }
    }

    // 6. CRYPTOGRAPHIC SIGNATURE VERIFICATION
    const payloadToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await createSignature(payloadToSign, razorpayKeySecret);

    if (!timingSafeEqualStr(expectedSignature, razorpay_signature)) {
      console.warn(`Cryptographic signature mismatch for order ${razorpay_order_id}. Provided: ${razorpay_signature}, Expected: ${expectedSignature}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment signature. Verification failed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment signature cryptographically verified for order ${razorpay_order_id} (payment: ${razorpay_payment_id})`);

    // 7. ACTIVATE SUBSCRIPTION
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month Pro subscription

    // Upsert / update subscriber status in database
    const { error: updateError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: authenticatedUser.id,
        email: authenticatedUser.email,
        subscribed: true,
        subscription_tier: 'Pro',
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        next_billing_date: subscriptionEnd.toISOString(),
        status: 'active',
        last_payment_date: new Date().toISOString(),
        last_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error("Database update error during subscription activation:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to persist subscription entitlement." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audit log successful payment verification
    await supabaseClient
      .from("function_health_logs")
      .insert({
        function_name: "razorpay-verify-payment",
        status: "success",
        request_count: 1,
        error_details: `Verified payment ${razorpay_payment_id} for user ${authenticatedUser.id}`
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment cryptographically verified and Pro subscription activated.",
        subscription: {
          tier: 'Pro',
          status: 'active',
          ends_at: subscriptionEnd.toISOString(),
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Payment verification uncaught error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Internal payment verification error"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});