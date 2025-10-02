import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JOINING_BONUS_AMOUNT = 500; // TXC joining bonus amount

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Award Joining Bonus: Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users who haven't received joining bonus yet
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('id', 'in', `(
        SELECT DISTINCT user_id 
        FROM txc_transactions 
        WHERE activity_type = 'joining_bonus'
      )`);

    if (fetchError) {
      console.error('Error fetching eligible users:', fetchError);
      throw fetchError;
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      console.log('No eligible users found for joining bonus');
      return new Response(
        JSON.stringify({ 
          success: true,
          users_awarded: 0,
          total_awarded: 0,
          already_received: 0,
          message: 'No new users to award'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${eligibleUsers.length} eligible users for joining bonus`);

    let awarded = 0;
    let failed = 0;

    // Award bonus to each eligible user
    for (const user of eligibleUsers) {
      try {
        // Create transaction record
        const { error: txError } = await supabase
          .from('txc_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'mining',
            amount: JOINING_BONUS_AMOUNT,
            activity_type: 'joining_bonus',
            description: 'Welcome bonus for joining TalentXcel',
            created_at: new Date().toISOString()
          });

        if (txError) {
          console.error(`Failed to create transaction for user ${user.id}:`, txError);
          failed++;
          continue;
        }

        // Update or create balance
        const { error: balanceError } = await supabase
          .from('user_txc_balances')
          .upsert({
            user_id: user.id,
            available_balance: JOINING_BONUS_AMOUNT,
            lifetime_earned: JOINING_BONUS_AMOUNT,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (balanceError) {
          console.error(`Failed to update balance for user ${user.id}:`, balanceError);
          // Don't count as failed since transaction was created
        }

        awarded++;
        console.log(`✅ Awarded ${JOINING_BONUS_AMOUNT} TXC to user ${user.id}`);
        
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        failed++;
      }
    }

    console.log(`✅ Joining bonus awarded to ${awarded} users (${failed} failed)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        users_awarded: awarded,
        total_awarded: awarded * JOINING_BONUS_AMOUNT,
        already_received: 0,
        failed: failed,
        message: `Awarded joining bonuses to ${awarded} users`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in award-joining-bonus function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        users_awarded: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
