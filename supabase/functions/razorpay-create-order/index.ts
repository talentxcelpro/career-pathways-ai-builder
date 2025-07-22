
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", serviceId, packageType } = await req.json();

    // Get Razorpay credentials from secrets
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.log("Razorpay credentials not found, using demo mode");
      
      // Return demo order
      const demoOrder = {
        orderId: `demo_order_${Date.now()}`,
        amount: amount * 100,
        currency: currency,
        keyId: "rzp_demo_key",
        demo: true
      };
      
      return new Response(JSON.stringify(demoOrder), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create Razorpay order with live credentials
    const orderData = {
      amount: amount * 100, // Convert to paisa
      currency: currency,
      receipt: `service_${serviceId}_${Date.now()}`,
      notes: {
        service_id: serviceId,
        package_type: packageType || "Basic"
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
      console.error("Razorpay error:", errorData);
      throw new Error(errorData.error?.description || "Failed to create Razorpay order");
    }

    const order = await razorpayResponse.json();
    console.log("Razorpay order created successfully:", order.id);

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

    // Store order in database
    const { error: insertError } = await supabaseClient
      .from("service_orders")
      .insert({
        user_id: userData.user.id,
        service_id: serviceId,
        package_type: packageType || "Basic",
        amount: amount,
        currency: currency,
        payment_status: "pending",
        razorpay_order_id: order.id,
        order_details: {
          razorpay_order: order,
          package_type: packageType
        }
      });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to store order in database");
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId
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
        error: error.message || "Failed to create payment order" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
