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

    // Update balance
    const { data: balance } = await supabaseClient
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    const newBalance = (balance?.available_balance || 0) + amount
    const newLifetimeEarned = (balance?.lifetime_earned || 0) + amount

    await supabaseClient
      .from('token_balances')
      .upsert({
        user_id: userId,
        available_balance: newBalance,
        locked_balance: balance?.locked_balance || 0,
        lifetime_earned: newLifetimeEarned
      })

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