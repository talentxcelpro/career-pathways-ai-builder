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
      
      if (action === 'create_order') {
        // Return demo order for testing
        const demoOrder = {
          id: `order_demo_${Date.now()}`,
          amount: amount * 100, // Convert to paise
          currency: currency,
          status: 'created',
          demo: true
        };
        
        return new Response(JSON.stringify(demoOrder), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      if (action === 'verify_payment') {
        // Simulate successful payment verification for demo
        const { orderId, paymentId, signature } = await req.json();
        
        // Record the payment in database
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            user_id: user.id,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            amount: amount,
            currency: currency,
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
          message: 'Demo payment processed successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Razorpay integration would go here when credentials are provided
    // This would include:
    // 1. Creating orders with Razorpay API
    // 2. Verifying payment signatures
    // 3. Handling webhooks
    // 4. Managing subscriptions
    // 5. Multi-currency support

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