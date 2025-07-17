import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to create HMAC SHA256 signature
async function createSignature(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      service_id,
      package_type 
    } = await req.json();

    // Get Razorpay secret from environment
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    // Verify signature
    const expectedSignature = await createSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpayKeySecret
    );

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
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

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    // Update order in database
    const { error: updateError } = await supabaseClient
      .from("service_orders")
      .update({
        payment_status: "completed",
        razorpay_payment_id: razorpay_payment_id,
        payment_verified_at: new Date().toISOString(),
        order_details: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          package_type,
          verified_at: new Date().toISOString()
        }
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userData.user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Failed to update order status");
    }

    // Fetch the updated order
    const { data: order, error: fetchError } = await supabaseClient
      .from("service_orders")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", userData.user.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch order:", fetchError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified successfully",
        order: order
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Payment verification failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});