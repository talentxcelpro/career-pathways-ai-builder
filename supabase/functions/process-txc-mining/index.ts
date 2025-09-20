import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TXCMiningRequest {
  userId: string
  action: string
  amount: number
  description: string
  metadata?: Record<string, any>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, action, amount, description, metadata }: TXCMiningRequest = await req.json()

    console.log(`Processing TXC mining for user: ${userId}, action: ${action}, amount: ${amount}`)

    // Validate input
    if (!userId || !action || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check for recent duplicate transactions (idempotency)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentTransaction } = await supabaseClient
      .from('token_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('source', action)
      .eq('transaction_type', 'mining')
      .gte('processed_at', fiveMinutesAgo)
      .maybeSingle()

    if (recentTransaction) {
      console.log(`Duplicate transaction prevented for user ${userId}, action: ${action}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction already processed recently',
          duplicate: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create transaction record
    const { error: txError } = await supabaseClient
      .from('token_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'mining',
        amount: amount,
        description: description,
        source: action,
        processed_at: new Date().toISOString(),
        metadata: metadata || {}
      })

    if (txError) {
      console.error('Error creating transaction:', txError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get current balance first
    const { data: currentBalance } = await supabaseClient
      .from('token_balances')
      .select('available_balance, locked_balance, lifetime_earned')
      .eq('user_id', userId)
      .eq('token_type', 'TXC')
      .maybeSingle()

    const newAvailableBalance = (currentBalance?.available_balance || 0) + amount
    const newLifetimeEarned = (currentBalance?.lifetime_earned || 0) + amount
    const lockedBalance = currentBalance?.locked_balance || 0

    // Update balance using proper upsert with token_type
    const { error: balanceError } = await supabaseClient
      .from('token_balances')
      .upsert({
        user_id: userId,
        token_type: 'TXC',
        available_balance: newAvailableBalance,
        locked_balance: lockedBalance,
        lifetime_earned: newLifetimeEarned,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,token_type'
      })

    if (balanceError) {
      console.error('Error updating balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`TXC mining completed successfully: ${amount} tokens awarded`)

    return new Response(
      JSON.stringify({
        success: true,
        amount: amount,
        newBalance: newAvailableBalance,
        message: `Successfully earned ${amount} TXC tokens!`
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