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
          created_at: string
          updated_at: string
        }
        Update: {
          balance?: number
          total_earned?: number
          updated_at?: string
        }
      }
      txc_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          transaction_type: string
          description: string
          activity_type?: string
          source?: string
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

    const { userId, amount, activityType, description } = await req.json()

    console.log(`🪙 Processing TXC earning: ${userId}, amount: ${amount}, activity: ${activityType}`)

    // Validate inputs
    if (!userId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Security check - ensure user can only earn for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot earn TXC for other users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Rate limiting check using database function
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient.rpc('check_txc_rate_limit', {
      p_user_id: userId,
      p_action_type: `earn_${activityType}`,
      p_limit: 10,
      p_window_minutes: 60
    })

    if (rateLimitError || !rateLimitOk) {
      console.log(`⚠️ Rate limit exceeded for user ${userId}`)
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Fraud detection - check for suspicious earning patterns
    const { data: recentEarnings } = await supabaseClient
      .from('txc_transactions')
      .select('amount, created_at')
      .eq('user_id', userId)
      .eq('transaction_type', 'earned')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('created_at', { ascending: false })

    const totalEarnedLastHour = recentEarnings?.reduce((sum, tx) => sum + tx.amount, 0) || 0
    
    if (totalEarnedLastHour + amount > 1000) { // Max 1000 TXC per hour
      console.log(`🚨 Suspicious earning pattern detected for user ${userId}: ${totalEarnedLastHour + amount} TXC in 1 hour`)
      return new Response(
        JSON.stringify({ success: false, error: 'Earning limit exceeded for security reasons' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Get or create user balance record
    let { data: balance, error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Create new balance record if doesn't exist
    if (!balance) {
      const { data: newBalance, error: createError } = await supabaseClient
        .from('user_txc_balances')
        .insert({
          user_id: userId,
          balance: amount,
          total_earned: amount,
          total_spent: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating balance record:', createError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create balance record' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
      balance = newBalance
    } else {
      // Update existing balance
      const { error: updateError } = await supabaseClient
        .from('user_txc_balances')
        .update({
          txc_balance: balance.txc_balance + amount,
          total_earned: balance.total_earned + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating balance:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Record transaction
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'earned',
        description: description,
        activity_type: activityType,
        source: 'secure_earn'
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
      // Don't fail the operation since balance was updated
    }

    const newBalance = (balance?.txc_balance || 0) + amount

    console.log(`✅ TXC earned successfully: ${amount} TXC for ${activityType}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TXC earned successfully',
        amount: amount,
        newBalance: newBalance,
        activityType: activityType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in earn-txc-secure:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})