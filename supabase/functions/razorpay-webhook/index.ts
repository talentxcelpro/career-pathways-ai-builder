// supabase/functions/razorpay-webhook/index.ts
// Authoritative Razorpay Webhook Lifecycle Handler for TalentXcel Subscriptions & Credit Packs
// Features: Replay Protection, Idempotency Ledger, Grace Period Handling, AI Credit Recharges

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

    // 2. Parse Event & Enforce Replay Protection
    const event = JSON.parse(rawBody);
    const eventId = event.id || req.headers.get("x-razorpay-event-id") || `evt_${Date.now()}`;
    const eventType = event.event;

    console.log(`[razorpay-webhook] Received verified event: ${eventType} (id: ${eventId})`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Check if event already processed in payment_webhook_events
    const { data: existingEvent } = await supabase
      .from("payment_webhook_events")
      .select("id, status")
      .eq("event_id", eventId)
      .maybeSingle();

    if (existingEvent && existingEvent.status === "processed") {
      console.log(`[razorpay-webhook] Event ${eventId} already processed. Acknowledging duplicate safely.`);
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Record receipt in ledger
    await supabase.from("payment_webhook_events").upsert({
      event_id: eventId,
      event_type: eventType,
      provider: "razorpay",
      payload: event,
      status: "processing"
    }, { onConflict: "event_id" });

    const payload = event.payload || {};

    // 3. Handle Lifecycle Events
    switch (eventType) {
      // ─────────────────────────────────────────────────────────────────────────
      // Subscription renewal or initial recurring charge
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.charged": {
        const subEntity = payload.subscription?.entity;
        const paymentEntity = payload.payment?.entity;
        const subId = subEntity?.id;
        const notes = subEntity?.notes || paymentEntity?.notes || {};
        const userId = notes.user_id;
        const rawPlan = (notes.plan_tier || notes.tier || "pro").toLowerCase();
        const tier = ["starter", "pro", "max", "business", "enterprise"].includes(rawPlan) ? rawPlan : "pro";

        console.log(`[razorpay-webhook] subscription.charged: subId=${subId} userId=${userId} tier=${tier}`);

        const currentEnd = subEntity?.current_end 
          ? new Date(subEntity.current_end * 1000).toISOString()
          : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

        const updateData: Record<string, any> = {
          subscribed: true,
          status: "active",
          subscription_tier: tier,
          plan_tier: tier,
          amount: paymentEntity?.amount || 49900,
          currency: paymentEntity?.currency || "INR",
          last_payment_date: new Date().toISOString(),
          last_payment_id: paymentEntity?.id || null,
          next_billing_date: subEntity?.charge_at ? new Date(subEntity.charge_at * 1000).toISOString() : null,
          subscription_end: currentEnd,
          cancel_at_period_end: false,
          grace_period_end: null,
          updated_at: new Date().toISOString(),
        };

        if (subId) {
          await supabase.from("subscribers").update(updateData).eq("razorpay_subscription_id", subId);
        } else if (userId) {
          await supabase.from("subscribers").update(updateData).eq("user_id", userId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // One-time payment captured (Plans, AI Credit Packs, or Upgrades)
      // ─────────────────────────────────────────────────────────────────────────
      case "payment.captured": {
        const paymentEntity = payload.payment?.entity;
        const notes = paymentEntity?.notes || {};
        const userId = notes.user_id;
        const paymentId = paymentEntity?.id;
        const purchaseType = notes.purchase_type || "subscription";

        if (userId && paymentId) {
          if (purchaseType === "ai_credits") {
            // Recharge AI Credit Wallet
            const credits = parseInt(notes.credits || "100", 10);
            await supabase.rpc("recharge_ai_credits", {
              p_user_id: userId,
              p_credits: credits,
              p_payment_ref: paymentId,
              p_idempotency_key: `recharge_${paymentId}`
            });
            console.log(`[razorpay-webhook] AI Credit Pack recharged: +${credits} credits for user=${userId}`);
          } else {
            // Plan Activation
            const rawPlan = (notes.plan_tier || notes.tier || "pro").toLowerCase();
            const tier = ["starter", "pro", "max", "business", "enterprise"].includes(rawPlan) ? rawPlan : "pro";
            const subEnd = new Date();
            subEnd.setMonth(subEnd.getMonth() + 1);

            await supabase.from("subscribers").upsert({
              user_id: userId,
              email: paymentEntity.email,
              subscribed: true,
              subscription_plan: `TalentXcel ${tier.toUpperCase()}`,
              subscription_tier: tier,
              plan_tier: tier,
              amount: paymentEntity.amount,
              currency: paymentEntity.currency || "INR",
              status: "active",
              last_payment_date: new Date().toISOString(),
              last_payment_id: paymentId,
              subscription_start: new Date().toISOString(),
              subscription_end: subEnd.toISOString(),
              cancel_at_period_end: false,
              grace_period_end: null,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });
          }
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Payment failed — Enter 5-day controlled grace period
      // ─────────────────────────────────────────────────────────────────────────
      case "payment.failed": {
        const paymentEntity = payload.payment?.entity;
        const notes = paymentEntity?.notes || {};
        const userId = notes.user_id;
        console.warn(`[razorpay-webhook] payment.failed for user ${userId || 'unknown'}: ${paymentEntity?.error_description}`);

        if (userId) {
          const graceEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from("subscribers")
            .update({
              status: "past_due",
              grace_period_end: graceEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Subscription cancelled — Non-destructive: retain access until current period end
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.cancelled": {
        const subEntity = payload.subscription?.entity;
        const subId = subEntity?.id;
        console.log(`[razorpay-webhook] subscription.cancelled: subId=${subId}`);

        if (subId) {
          await supabase.from("subscribers")
            .update({
              cancel_at_period_end: true,
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_subscription_id", subId);
        }
        break;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // Subscription halted — Grace period exhausted
      // ─────────────────────────────────────────────────────────────────────────
      case "subscription.halted": {
        const subEntity = payload.subscription?.entity;
        const subId = subEntity?.id;
        console.warn(`[razorpay-webhook] subscription.halted: subId=${subId}`);

        if (subId) {
          await supabase.from("subscribers")
            .update({
              status: "expired",
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
        console.log(`[razorpay-webhook] Logged event without specific handler: ${eventType}`);
        break;
    }

    // 4. Mark Event as Processed in Webhook Ledger
    await supabase.from("payment_webhook_events").update({
      status: "processed",
      processed_at: new Date().toISOString()
    }).eq("event_id", eventId);

    return new Response(JSON.stringify({ received: true, eventId, status: "processed" }), {
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
