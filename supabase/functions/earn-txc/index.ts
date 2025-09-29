import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      user_txc_balances: {
        Row: {
          user_id: string
          balance: number
          total_earned: number
          total_spent: number
          last_activity_at: string | null
        }
        Update: {
          balance?: number
          total_earned?: number
          last_activity_at?: string
        }
      }
      txc_transactions: {
        Insert: {
          user_id: string
          amount: number
          transaction_type: string
          description: string
          activity_type?: string
          reference_id?: string
        }
      }
    }
  }
}

// ============================================================================
// OFFICIAL TXC MINING POLICY - PERMANENT CONFIGURATION
// 
// ⚠️  CRITICAL WARNING: These values are PERMANENT and IMMUTABLE ⚠️
// 
// This configuration must match the official policy exactly.
// DO NOT modify these values without explicit authorization.
// Policy Source: @/config/txcPolicy.ts
// ============================================================================

const TXC_REWARDS: Record<string, { amount: number; description: string; cooldownMinutes: number }> = {
  'daily_login': { amount: 75, description: 'Daily login bonus', cooldownMinutes: 1440 },
  'post_created': { amount: 150, description: 'Create a post', cooldownMinutes: 60 },
  'connection_made': { amount: 75, description: 'Connect with someone', cooldownMinutes: 60 },
  'profile_completed': { amount: 300, description: 'Complete your profile', cooldownMinutes: 1440 },
  'resume_created': { amount: 225, description: 'Create a resume', cooldownMinutes: 240 },
  'job_applied': { amount: 90, description: 'Apply to a job', cooldownMinutes: 60 },
  'recommendation_given': { amount: 120, description: 'Give a recommendation', cooldownMinutes: 120 },
  'skill_added': { amount: 60, description: 'Add skills to profile', cooldownMinutes: 180 },
  'course_completed': { amount: 600, description: 'Complete a course', cooldownMinutes: 60 },
  'feedback_given': { amount: 45, description: 'Provide feedback', cooldownMinutes: 60 },
  'social_activity_bonus': { amount: 300, description: 'Social activity bonus', cooldownMinutes: 10080 },
  'joining_bonus': { amount: 500, description: 'Welcome to TalentXcel!', cooldownMinutes: 0 },
  'referral_made': { amount: 1000, description: 'Refer a friend', cooldownMinutes: 0 },
  'post_liked': { amount: 20, description: 'Like a post', cooldownMinutes: 0 },
  'comment_made': { amount: 20, description: 'Comment on a post', cooldownMinutes: 0 },
  'article_posted': { amount: 500, description: 'Post an article', cooldownMinutes: 240 }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request early to prevent unnecessary processing
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Use optimized client configuration
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { action, metadata } = body;
    
    if (!action || !TXC_REWARDS[action]) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const reward = TXC_REWARDS[action];
    
    // Check cooldown if applicable
    if (reward.cooldownMinutes > 0) {
      const { data: lastTransaction } = await supabaseClient
        .from('txc_transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('transaction_type', 'mining')
        .eq('activity_type', action)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastTransaction) {
        const lastTime = new Date(lastTransaction.created_at);
        const cooldownEnd = new Date(lastTime.getTime() + reward.cooldownMinutes * 60 * 1000);
        
        if (new Date() < cooldownEnd) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Cooldown active',
              cooldownEnd: cooldownEnd.toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
          );
        }
      }
    }

    // Get or create user balance
    let { data: balance } = await supabaseClient
      .from('user_txc_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!balance) {
      const { data: newBalance, error: createError } = await supabaseClient
        .from('user_txc_balances')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating balance:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      balance = newBalance;
    }

    // Create transaction record
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: user.id,
        amount: reward.amount,
        transaction_type: 'mining',
        description: reward.description,
        activity_type: action,
        reference_id: metadata?.reference_id || null
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update balance
    const newBalance = (balance.txc_balance || 0) + reward.amount;
    const newTotalEarned = (balance.total_earned || 0) + reward.amount;

    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        txc_balance: newBalance,
        total_earned: newTotalEarned,
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`TXC earned: ${reward.amount} for ${action} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        amount: reward.amount,
        newBalance: newBalance,
        action: action,
        description: reward.description
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in earn-txc:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});