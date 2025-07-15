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

    // Real Razorpay integration would go here when credentials are provided
    logStep("Razorpay integration ready for credentials");
    
    return new Response(JSON.stringify({
      message: "Razorpay payment processor ready. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable live payments.",
      demo_mode: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
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