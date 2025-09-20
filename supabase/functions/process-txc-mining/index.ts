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
      .from('txc_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('transaction_type', 'mining')
      .gte('created_at', fiveMinutesAgo)
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
      .from('txc_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'mining',
        amount: amount,
        description: description
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
      .from('user_txc_balances')
      .select('balance, lifetime_earned')
      .eq('user_id', userId)
      .maybeSingle()

    const newBalance = (currentBalance?.balance || 0) + amount
    const newLifetimeEarned = (currentBalance?.lifetime_earned || 0) + amount

    // Update balance using proper upsert
    const { error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .upsert({
        user_id: userId,
        balance: newBalance,
        lifetime_earned: newLifetimeEarned
      }, {
        onConflict: 'user_id'
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
        newBalance: newBalance,
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