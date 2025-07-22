import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-RAZORPAY-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key to perform writes
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

    // Check existing subscription in database
    const { data: existingSubscription, error: fetchError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      logStep("Database fetch error", fetchError);
      throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
    }

    let subscriptionStatus = {
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      status: 'inactive'
    };

    if (existingSubscription) {
      // Check if subscription is still active
      const now = new Date();
      const endDate = new Date(existingSubscription.subscription_end);
      const isActive = existingSubscription.status === 'active' && endDate > now;

      if (!isActive && existingSubscription.status === 'active') {
        // Subscription expired, update status
        const { error: updateError } = await supabaseClient
          .from("subscribers")
          .update({ 
            status: 'expired', 
            subscribed: false,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (updateError) {
          logStep("Failed to update expired subscription", updateError);
        } else {
          logStep("Updated expired subscription status");
        }

        subscriptionStatus = {
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          status: 'expired'
        };
      } else if (isActive) {
        subscriptionStatus = {
          subscribed: true,
          subscription_tier: existingSubscription.subscription_tier,
          subscription_end: existingSubscription.subscription_end,
          status: existingSubscription.status
        };
      }
    } else {
      // No subscription found, create inactive entry
      logStep("No subscription found, creating inactive entry");
      const { error: insertError } = await supabaseClient
        .from("subscribers")
        .insert({
          user_id: user.id,
          email: user.email,
          subscribed: false,
          status: 'inactive',
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        logStep("Failed to create inactive subscription entry", insertError);
      }
    }

    logStep("Subscription status checked", subscriptionStatus);

    return new Response(JSON.stringify({
      success: true,
      ...subscriptionStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
      status: 'error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});