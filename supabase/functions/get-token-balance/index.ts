import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface Database {
  public: {
    Tables: {
      user_txc_balances: {
        Row: {
          user_id: string
          balance: number
          total_earned: number
          created_at: string
          updated_at: string
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
      .from('user_txc_balances')
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

    // If no balance record exists, create one with initial balance
    let finalBalance = balance
    if (!balance) {
      const { data: newBalance, error: createError } = await supabaseClient
        .from('user_txc_balances')
        .insert({
          user_id: targetUserId,
          balance: 500, // Give new users 500 TXC welcome bonus
          total_earned: 500
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
      .from('txc_transactions')
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
          total: finalBalance.balance,
          available: finalBalance.balance,
          locked: 0,
          lifetime_earned: finalBalance.total_earned || finalBalance.balance
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