import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Check if user is admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = userRoles?.some(role => ['super_admin', 'admin'].includes(role.role));
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    console.log('🔄 Starting TXC balance reset...');

    // Get current balance counts before reset
    const { count: totalBalances } = await supabaseClient
      .from('user_txc_balances')
      .select('*', { count: 'exact', head: true });

    const { data: balanceSummary } = await supabaseClient
      .from('user_txc_balances')
      .select('txc_balance')
      .order('txc_balance', { ascending: false })
      .limit(10);

    console.log(`📊 Found ${totalBalances} TXC balance records before reset`);

    // Reset all TXC balances to 0
    const { error: resetError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        txc_balance: 0,
        total_earned: 0,
        total_spent: 0,
        last_activity_at: new Date().toISOString()
      })
      .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Reset all real users

    if (resetError) {
      console.error('❌ Reset error:', resetError);
      throw resetError;
    }

    // Verify reset
    const { data: verifyReset } = await supabaseClient
      .from('user_txc_balances')
      .select('txc_balance')
      .gt('txc_balance', 0);

    const remainingBalances = verifyReset?.length || 0;

    console.log('✅ TXC reset completed');
    console.log(`📊 Remaining non-zero balances: ${remainingBalances}`);

    // Log the reset action
    await supabaseClient
      .from('admin_activity_log')
      .insert({
        admin_user_id: user.id,
        action_type: 'txc_reset',
        details: {
          reset_count: totalBalances,
          remaining_balances: remainingBalances,
          timestamp: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TXC balances reset successfully',
        reset_count: totalBalances,
        remaining_balances: remainingBalances,
        top_balances_before_reset: balanceSummary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Reset failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});