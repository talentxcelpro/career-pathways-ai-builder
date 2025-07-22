
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RAZORPAY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment function started");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { action, planId, amount, currency = 'INR' } = await req.json();
    logStep("Request data received", { action, planId, amount, currency });

    // Check if Razorpay credentials are available
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      logStep("Razorpay credentials missing - using demo mode");
      
      if (action === 'create_order' && planId) {
        // Get plan details
        const { data: plan, error: planError } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
        
        if (planError) {
          throw new Error(`Plan not found: ${planError.message}`);
        }
        
        // Return demo order for subscription
        const demoOrder = {
          id: `order_demo_${Date.now()}`,
          amount: plan.price * 100, // Convert to paise
          currency: plan.currency,
          status: 'created',
          demo: true,
          planId: planId
        };
        
        return new Response(JSON.stringify(demoOrder), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (action === 'verify_payment' && planId) {
        const { orderId, paymentId, signature } = await req.json();
        
        // Get plan details
        const { data: plan, error: planError } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
        
        if (planError) {
          throw new Error(`Plan not found: ${planError.message}`);
        }
        
        // Create subscription
        const currentDate = new Date();
        const endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription
        
        const { error: subscriptionError } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            plan_id: planId,
            status: 'active',
            current_period_start: currentDate.toISOString(),
            current_period_end: endDate.toISOString(),
            razorpay_subscription_id: `sub_demo_${Date.now()}`,
            razorpay_customer_id: `cust_demo_${user.id.substring(0, 8)}`
          });
        
        if (subscriptionError) {
          logStep("Error creating subscription", { error: subscriptionError });
          throw new Error(`Subscription creation failed: ${subscriptionError.message}`);
        }
        
        // Record the payment
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: user.id,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            amount: plan.price,
            currency: plan.currency,
            status: 'captured',
            payment_method: 'demo',
            processed_at: new Date().toISOString()
          });

        if (paymentError) {
          logStep("Error recording payment", { error: paymentError });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          demo: true,
          message: 'Demo subscription activated successfully',
          subscription: {
            status: 'active',
            current_period_end: endDate.toISOString(),
            plan_name: plan.name
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (action === 'cancel_subscription') {
        const { subscriptionId } = await req.json();
        
        // Cancel subscription
        const { error: cancelError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('id', subscriptionId);
        
        if (cancelError) {
          throw new Error(`Subscription cancellation failed: ${cancelError.message}`);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          demo: true,
          message: 'Demo subscription cancelled successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (action === 'get_subscription_status') {
        // Get user's active subscription
        const { data: subscription, error: subError } = await supabaseClient
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              price,
              currency,
              features
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('current_period_end', new Date().toISOString())
          .single();
        
        if (subError && subError.code !== 'PGRST116') {
          throw new Error(`Error fetching subscription: ${subError.message}`);
        }
        
        return new Response(JSON.stringify({ 
          subscription: subscription || null,
          demo: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Real Razorpay integration starts here
    logStep("Using live Razorpay integration");

    if (action === 'create_order' && planId) {
      // Get plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (planError) {
        throw new Error(`Plan not found: ${planError.message}`);
      }

      // Create Razorpay order
      const orderData = {
        amount: plan.price * 100, // Convert to paise
        currency: plan.currency || 'INR',
        receipt: `sub_${planId}_${Date.now()}`,
        notes: {
          plan_id: planId,
          user_id: user.id,
          plan_name: plan.name
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
        logStep("Razorpay API error", { error: errorData });
        throw new Error(errorData.error?.description || "Failed to create Razorpay order");
      }

      const order = await razorpayResponse.json();
      logStep("Razorpay order created", { orderId: order.id });

      return new Response(JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
        planId: planId,
        planName: plan.name
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'verify_payment' && planId) {
      const { orderId, paymentId, signature } = await req.json();
      
      // Verify signature
      const expectedSignature = await createSignature(
        `${orderId}|${paymentId}`,
        razorpayKeySecret
      );

      if (expectedSignature !== signature) {
        throw new Error("Invalid payment signature");
      }

      // Get plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (planError) {
        throw new Error(`Plan not found: ${planError.message}`);
      }

      // Create subscription
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription
      
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: currentDate.toISOString(),
          current_period_end: endDate.toISOString(),
          razorpay_subscription_id: paymentId,
          razorpay_customer_id: user.id
        });
      
      if (subscriptionError) {
        logStep("Error creating subscription", { error: subscriptionError });
        throw new Error(`Subscription creation failed: ${subscriptionError.message}`);
      }
      
      // Record the payment
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          user_id: user.id,
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          amount: plan.price,
          currency: plan.currency,
          status: 'captured',
          payment_method: 'razorpay',
          processed_at: new Date().toISOString()
        });

      if (paymentError) {
        logStep("Error recording payment", { error: paymentError });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment verified and subscription activated successfully',
        subscription: {
          status: 'active',
          current_period_end: endDate.toISOString(),
          plan_name: plan.name
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'get_subscription_status') {
      // Get user's active subscription
      const { data: subscription, error: subError } = await supabaseClient
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price,
            currency,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .single();
      
      if (subError && subError.code !== 'PGRST116') {
        throw new Error(`Error fetching subscription: ${subError.message}`);
      }
      
      return new Response(JSON.stringify({ 
        subscription: subscription || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'cancel_subscription') {
      const { subscriptionId } = await req.json();
      
      // Cancel subscription
      const { error: cancelError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', subscriptionId);
      
      if (cancelError) {
        throw new Error(`Subscription cancellation failed: ${cancelError.message}`);
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Subscription cancelled successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      error: "Invalid action specified"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in razorpay-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

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
