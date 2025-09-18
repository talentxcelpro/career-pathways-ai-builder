import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      token_balances: {
        Row: {
          user_id: string
          balance: number
          locked_balance: number
          token_type: string
          last_updated: string
        }
      }
      token_transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          transaction_type: string
          amount: number
          token_type: string
          description: string
          status: string
          created_at: string
        }
        Insert: {
          from_user_id?: string | null
          to_user_id?: string | null
          transaction_type: string
          amount: number
          token_type?: string
          description: string
          reference_type?: string | null
          reference_id?: string | null
          metadata?: any
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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

    const { userId, action, amount, description, metadata = {} } = await req.json()

    // Validate inputs
    if (!userId || !action || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid mining parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Security check - ensure user can only mine for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot mine TXC for other users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log(`Processing TXC mining for user: ${userId}, action: ${action}, amount: ${amount}`)

    // Check for recent identical mining action (cooldown)
    const cooldownMinutes = {
      'post_created': 60,
      'connection_made': 30,
      'profile_completed': 1440,
      'resume_created': 240,
      'job_applied': 60,
      'recommendation_given': 120,
      'skill_added': 180,
      'daily_login': 1440,
      'course_completed': 60,
      'feedback_given': 60
    }[action] || 60;

    const cooldownTime = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();

    const { data: recentTransaction, error: cooldownError } = await supabaseClient
      .from('token_transactions')
      .select('created_at')
      .eq('to_user_id', userId)
      .eq('transaction_type', 'mining')
      .eq('reference_type', action)
      .gte('created_at', cooldownTime)
      .limit(1)
      .single()

    if (recentTransaction && !cooldownError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cooldown period not met',
          cooldownMinutes: cooldownMinutes
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Get current balance
    const { data: balance, error: balanceError } = await supabaseClient
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    let currentBalance = 0;

    if (balance && !balanceError) {
      currentBalance = balance.balance;
    }

    // Calculate new balance
    const newBalance = currentBalance + amount;

    // Update or insert balance
    const { error: updateError } = await supabaseClient
      .from('token_balances')
      .upsert({
        user_id: userId,
        balance: newBalance,
        locked_balance: balance?.locked_balance || 0,
        token_type: 'TXC'
      })

    if (updateError) {
      console.error('Error updating balance:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Record transaction
    const { error: txError } = await supabaseClient
      .from('token_transactions')
      .insert({
        to_user_id: userId,
        transaction_type: 'mining',
        amount: amount,
        token_type: 'TXC',
        description: description,
        reference_type: action,
        status: 'completed',
        metadata: {
          ...metadata,
          mined_at: new Date().toISOString(),
          action: action
        }
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
      // Don't fail the mining process, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TXC mined successfully',
        newBalance: newBalance,
        amount: amount,
        action: action
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-txc-mining:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})