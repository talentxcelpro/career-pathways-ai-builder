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

    // ── Authentication Check (SEC-REMEDIATION) ───────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Bearer token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const cronSecret = Deno.env.get('CRON_SECRET') || '';

    const isAuthorizedService = (serviceRoleKey && token === serviceRoleKey) || (cronSecret && token === cronSecret);
    if (!isAuthorizedService) {
      // Validate user token and verify admin privilege
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: Invalid or expired token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isAdmin = roleRecord && (roleRecord.role === 'admin' || roleRecord.role === 'super_admin');
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Administrative privilege required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Try executing atomic database stored procedure first
    const { data: rpcResult, error: rpcError } = await supabase.rpc('txc_award_joining_bonus', {
      p_batch_size: 100,
      p_bonus_amount: JOINING_BONUS_AMOUNT
    });

    if (!rpcError && rpcResult?.success) {
      return new Response(JSON.stringify(rpcResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Bounded Cursor Fallback (max 100 users per invocation to prevent OOM)
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('id', 'in', `(
        SELECT DISTINCT user_id 
        FROM txc_transactions 
        WHERE activity_type = 'joining_bonus'
      )`)
      .limit(100);

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

        // Update or create balance using canonical schema columns (txc_balance, total_earned)
        const { data: currentBal } = await supabase
          .from('user_txc_balances')
          .select('txc_balance, total_earned')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentTxc = currentBal?.txc_balance || 0;
        const currentEarned = currentBal?.total_earned || 0;

        const { error: balanceError } = await supabase
          .from('user_txc_balances')
          .upsert({
            user_id: user.id,
            txc_balance: currentTxc + JOINING_BONUS_AMOUNT,
            total_earned: currentEarned + JOINING_BONUS_AMOUNT,
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
