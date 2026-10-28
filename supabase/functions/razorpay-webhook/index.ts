// supabase/functions/razorpay-webhook/index.ts
// Authoritative Razorpay Webhook Lifecycle Handler for TalentXcel Subscriptions
// Processes: subscription.charged, subscription.halted, payment.failed, subscription.cancelled, refund.processed

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

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

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!webhookSecret) {
      console.error("FATAL: RAZORPAY_WEBHOOK_SECRET is not configured.");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Signature Verification
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      console.warn("Rejecting Razorpay webhook: missing x-razorpay-signature");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const rawBody = await req.text();
    const expectedSignature = await createSignature(rawBody, webhookSecret);

    if (!timingSafeEqualStr(expectedSignature, signature)) {
      console.warn("Rejecting Razorpay webhook: invalid signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Parse Event
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`[razorpay-webhook] Processing verified event: ${eventType} (id: ${event.id || 'N/A'})`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const payload = event.payload || {};

    // 3. Handle Lifecycle Events
    switch (eventType) {
      // ─────────────────────────────────────────────────────────────────────────
      // Subscription renewal charged successfully
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.charged": {
        const subEntity = payload.subscription?.entity;
        const paymentEntity = payload.payment?.entity;
        const subId = subEntity?.id;
        const customerId = subEntity?.customer_id;
        const notes = subEntity?.notes || paymentEntity?.notes || {};
        const userId = notes.user_id;

        console.log(`[razorpay-webhook] subscription.charged: subId=${subId} userId=${userId}`);

        let query = supabase.from("subscribers").update({
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

      // ─────────────────────────────────────────────────────────────────────────
      // One-time payment captured (for non-recurring orders or direct purchases)
      // ─────────────────────────────────────────────────────────────────────────
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

          await supabase.from("subscribers").upsert({
            user_id: userId,
            email: paymentEntity.email,
            subscribed: true,
            subscription_plan: planName,
            subscription_tier: tier,
            status: "active",
            last_payment_date: new Date().toISOString(),
            last_payment_id: paymentId,
            subscription_start: new Date().toISOString(),
            subscription_end: subEnd.toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Payment failed
      // ─────────────────────────────────────────────────────────────────────────
      case "payment.failed": {
        const paymentEntity = payload.payment?.entity;
        const notes = paymentEntity?.notes || {};
        const userId = notes.user_id;
        console.warn(`[razorpay-webhook] payment.failed for user ${userId || 'unknown'}: ${paymentEntity?.error_description}`);

        if (userId) {
          await supabase.from("subscribers")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Subscription halted (retries exhausted)
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.halted": {
        const subEntity = payload.subscription?.entity;
        const subId = subEntity?.id;
        console.warn(`[razorpay-webhook] subscription.halted: subId=${subId}`);

        if (subId) {
          await supabase.from("subscribers")
            .update({
              status: "past_due",
              subscribed: false,
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_subscription_id", subId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Subscription cancelled
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.cancelled": {
        const subEntity = payload.subscription?.entity;
        const subId = subEntity?.id;
        console.log(`[razorpay-webhook] subscription.cancelled: subId=${subId}`);

        if (subId) {
          await supabase.from("subscribers")
            .update({
              status: "cancelled",
              subscribed: false,
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_subscription_id", subId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Refund processed
      // ─────────────────────────────────────────────────────────────────────────
      case "refund.processed": {
        const refundEntity = payload.refund?.entity;
        const paymentId = refundEntity?.payment_id;
        console.log(`[razorpay-webhook] refund.processed for payment=${paymentId}`);

        if (paymentId) {
          await supabase.from("subscribers")
            .update({
              status: "refunded",
              subscribed: false,
              updated_at: new Date().toISOString(),
            })
            .eq("last_payment_id", paymentId);
        }
        break;
      }

      default:
        console.log(`[razorpay-webhook] Unhandled event type: ${eventType}`);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("[razorpay-webhook] Unhandled webhook processing error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
