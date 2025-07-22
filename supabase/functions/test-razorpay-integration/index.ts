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
    console.log("=== Starting Razorpay Integration Test ===");

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

    console.log(`Testing for user: ${userData.user.email}`);

    // Test 1: Check subscription plans
    const { data: plans, error: plansError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price');

    if (plansError) {
      throw new Error(`Failed to fetch plans: ${plansError.message}`);
    }

    console.log(`✅ Found ${plans.length} subscription plans`);

    // Test 2: Create a test order (Demo mode)
    const testPlan = plans[0]; // Use the cheapest plan for testing
    
    console.log(`🧪 Testing order creation for plan: ${testPlan.name} (₹${testPlan.price})`);

    const orderResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/razorpay-create-order`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: testPlan.price,
        currency: testPlan.currency,
        planId: testPlan.id,
        packageType: 'subscription'
      })
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      throw new Error(`Order creation failed: ${errorText}`);
    }

    const orderData = await orderResponse.json();
    console.log(`✅ Order created successfully:`, orderData);

    // Test 3: Verify payment (Demo mode)
    if (orderData.demo) {
      console.log(`🧪 Testing demo payment verification`);
      
      const verifyResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/razorpay-verify-payment`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature'
        })
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`Payment verification failed: ${errorText}`);
      }

      const verifyData = await verifyResponse.json();
      console.log(`✅ Payment verified successfully:`, verifyData);
    }

    // Test 4: Check database records
    const { data: orders, error: ordersError } = await supabaseClient
      .from('service_orders')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (ordersError) {
      console.log(`⚠️ Warning: Could not fetch orders: ${ordersError.message}`);
    } else {
      console.log(`✅ Found ${orders.length} order record(s) in database`);
    }

    // Test 5: Check subscription
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (name, price)
      `)
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (subsError) {
      console.log(`⚠️ Warning: Could not fetch subscriptions: ${subsError.message}`);
    } else {
      console.log(`✅ Found ${subscriptions.length} active subscription(s)`);
    }

    // Test Results Summary
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      user: userData.user.email,
      tests: {
        plansLoaded: plans.length > 0,
        orderCreated: !!orderData.orderId,
        paymentVerified: orderData.demo ? !!orderData : false,
        databaseRecords: {
          orders: orders?.length || 0,
          subscriptions: subscriptions?.length || 0
        }
      },
      data: {
        availablePlans: plans.map(p => ({ name: p.name, price: p.price, currency: p.currency })),
        lastOrder: orderData,
        razorpayMode: orderData.demo ? 'Demo Mode' : 'Live Mode',
        apiKeysConfigured: !!Deno.env.get("RAZORPAY_KEY_ID")
      }
    };

    console.log("=== Test Results ===", JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify(results),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Test failed:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});