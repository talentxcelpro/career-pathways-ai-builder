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
      
      // Find the order in database
      const { data: orderData, error: orderError } = await supabaseClient
        .from("service_orders")
        .select("*")
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", userData.user.id)
        .single();

      if (orderError || !orderData) {
        throw new Error("Order not found");
      }

      // Update order status
      const { error: updateError } = await supabaseClient
        .from("service_orders")
        .update({
          payment_status: "completed",
          razorpay_payment_id: razorpay_payment_id,
          payment_verified_at: new Date().toISOString()
        })
        .eq("id", orderData.id);

      if (updateError) {
        throw new Error("Failed to update order status");
      }

      // Create subscription if plan_id exists in order_details
      if (orderData.order_details?.plan_id) {
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        const { error: subscriptionError } = await supabaseClient
          .from("user_subscriptions")
          .insert({
            user_id: userData.user.id,
            plan_id: orderData.order_details.plan_id,
            status: "active",
            current_period_start: currentPeriodStart.toISOString(),
            current_period_end: currentPeriodEnd.toISOString()
          });

        if (subscriptionError) {
          console.error("Failed to create subscription:", subscriptionError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment verified successfully (Demo mode)",
          order_id: orderData.id 
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

    // Find and update the order
    const { data: orderData, error: orderError } = await supabaseClient
      .from("service_orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userData.user.id)
      .single();

    if (orderError || !orderData) {
      throw new Error("Order not found");
    }

    // Update order status
    const { error: updateError } = await supabaseClient
      .from("service_orders")
      .update({
        payment_status: "completed",
        razorpay_payment_id: razorpay_payment_id,
        payment_verified_at: new Date().toISOString()
      })
      .eq("id", orderData.id);

    if (updateError) {
      throw new Error("Failed to update order status");
    }

    // Create subscription if plan_id exists in order_details
    if (orderData.order_details?.plan_id) {
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      const { error: subscriptionError } = await supabaseClient
        .from("user_subscriptions")
        .insert({
          user_id: userData.user.id,
          plan_id: orderData.order_details.plan_id,
          status: "active",
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString()
        });

      if (subscriptionError) {
        console.error("Failed to create subscription:", subscriptionError);
        throw new Error("Payment verified but subscription creation failed");
      }
    }

    // Get the updated order details
    const { data: updatedOrder, error: fetchError } = await supabaseClient
      .from("service_orders")
      .select("*")
      .eq("id", orderData.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch updated order:", fetchError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment verified and subscription activated successfully",
        order: updatedOrder 
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
        error: error.message || "Payment verification failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});