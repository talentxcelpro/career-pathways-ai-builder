import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to create HMAC SHA256 signature
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required payment verification parameters");
    }

    // Get Razorpay secret for verification
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    // Handle demo mode  
    if (!razorpayKeySecret || razorpay_signature === 'demo_signature') {
      console.log("Demo mode payment verification");
      
      // Calculate subscription dates
      const subscriptionStart = new Date();
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

      // Update subscription status
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({
          subscribed: true,
          subscription_tier: 'Pro',
          subscription_start: subscriptionStart.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          next_billing_date: subscriptionEnd.toISOString(),
          status: 'active',
          last_payment_date: new Date().toISOString(),
          last_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userData.user.id);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        throw new Error("Failed to activate subscription");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment verified and subscription activated (Demo mode)",
          subscription: {
            tier: 'Pro',
            status: 'active',
            ends_at: subscriptionEnd.toISOString()
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Real Razorpay signature verification
    const expectedSignature = await createSignature(
      razorpay_order_id + "|" + razorpay_payment_id,
      razorpayKeySecret
    );

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    console.log("Payment signature verified successfully");

    // Calculate subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

    // Update subscription status
    const { error: updateError } = await supabaseClient
      .from("subscribers")
      .update({
        subscribed: true,
        subscription_tier: 'Pro',
        subscription_start: subscriptionStart.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        next_billing_date: subscriptionEnd.toISOString(),
        status: 'active',
        last_payment_date: new Date().toISOString(),
        last_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userData.user.id);

    if (updateError) {
      console.error("Failed to update subscription:", updateError);
      throw new Error("Failed to activate subscription");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated successfully",
        subscription: {
          tier: 'Pro',
          status: 'active', 
          ends_at: subscriptionEnd.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || "Payment verification failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});