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
          available_balance: number
          locked_balance: number
          lifetime_earned: number
          last_daily_bonus: string | null
        }
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          amount: number
          description: string
          source: string | null
          created_at: string
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

    const { userId } = await req.json()
    const targetUserId = userId || user.id

    console.log(`Getting token balance for user: ${targetUserId}`)

    // Get token balance
    const { data: balance, error: balanceError } = await supabaseClient
      .from('token_balances')
      .select('*')
      .eq('user_id', targetUserId)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // If no balance record exists, create one with 0 balance
    let finalBalance = balance
    if (!balance) {
      const { data: newBalance, error: createError } = await supabaseClient
        .from('token_balances')
        .insert({
          user_id: targetUserId,
          available_balance: 0,
          locked_balance: 0,
          lifetime_earned: 0
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating balance record:', createError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      finalBalance = newBalance
    }

    // Get recent transactions
    const { data: transactions, error: txError } = await supabaseClient
      .from('token_transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (txError) {
      console.error('Error fetching transactions:', txError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance: {
          total: finalBalance.available_balance + finalBalance.locked_balance,
          available: finalBalance.available_balance,
          locked: finalBalance.locked_balance,
          lifetime_earned: finalBalance.lifetime_earned
        },
        transactions: transactions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-token-balance:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})