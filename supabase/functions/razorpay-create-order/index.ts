
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
    const body = await req.json();
    
    // Input validation and sanitization
    const amount = parseFloat(body.amount);
    const currency = (body.currency || "INR").toUpperCase();
    const planId = body.planId ? String(body.planId).slice(0, 100) : null;
    const serviceId = body.serviceId ? String(body.serviceId).slice(0, 100) : null;
    const packageType = body.packageType ? String(body.packageType).slice(0, 50) : null;
    
    // Validate required fields
    if (!amount || amount <= 0 || amount > 100000) {
      throw new Error("Invalid amount. Must be between 0 and 100,000");
    }
    
    if (!["INR", "USD", "EUR"].includes(currency)) {
      throw new Error("Invalid currency");
    }
    
    if (!serviceId) {
      throw new Error("Service ID is required");
    }

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

    // Store order in subscribers table for subscription tracking
    const { error: insertError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: userData.user.id,
        email: userData.user.email,
        subscribed: false,
        subscription_plan: planId ? `Plan ${planId}` : 'Pro Plan',
        subscription_tier: 'Pro',
        amount: amount * 100, // Store in paise
        currency: currency,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (insertError) {
      console.error("Database upsert error:", insertError);
      throw new Error("Failed to store subscription order");
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
        error: (error as Error).message || "Failed to create payment order" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
