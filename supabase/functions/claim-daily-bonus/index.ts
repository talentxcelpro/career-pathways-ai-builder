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
        Update: {
          available_balance?: number
          lifetime_earned?: number
          last_daily_bonus?: string
        }
      }
      token_transactions: {
        Insert: {
          user_id: string
          transaction_type: string
          amount: number
          description: string
          source?: string
          processed_at?: string
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

    console.log(`Claiming daily bonus for user: ${targetUserId}`)

    // Get current balance and check last daily bonus claim
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

    const today = new Date().toISOString().split('T')[0]
    
    // Check if user already claimed today
    if (balance?.last_daily_bonus === today) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Daily bonus already claimed today. Come back tomorrow!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const bonusAmount = 50 // 50 TXC daily bonus

    // Create transaction record
    const { error: txError } = await supabaseClient
      .from('token_transactions')
      .insert({
        user_id: targetUserId,
        transaction_type: 'bonus',
        amount: bonusAmount,
        description: 'Daily login bonus',
        source: 'daily_bonus',
        processed_at: new Date().toISOString()
      })

    if (txError) {
      console.error('Error creating transaction:', txError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update balance
    const newBalance = (balance?.available_balance || 0) + bonusAmount
    const newLifetimeEarned = (balance?.lifetime_earned || 0) + bonusAmount

    if (balance) {
      // Update existing balance
      const { error: updateError } = await supabaseClient
        .from('token_balances')
        .update({
          available_balance: newBalance,
          lifetime_earned: newLifetimeEarned,
          last_daily_bonus: today
        })
        .eq('user_id', targetUserId)

      if (updateError) {
        console.error('Error updating balance:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    } else {
      // Create new balance record
      const { error: insertError } = await supabaseClient
        .from('token_balances')
        .insert({
          user_id: targetUserId,
          available_balance: bonusAmount,
          locked_balance: 0,
          lifetime_earned: bonusAmount,
          last_daily_bonus: today
        })

      if (insertError) {
        console.error('Error creating balance:', insertError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Update profile token balance for quick access
    await supabaseClient
      .from('profiles')
      .update({
        tokens_balance: newBalance,
        tokens_lifetime_earned: newLifetimeEarned
      })
      .eq('id', targetUserId)

    console.log(`Daily bonus claimed successfully: ${bonusAmount} TXC`)

    return new Response(
      JSON.stringify({
        success: true,
        amount: bonusAmount,
        message: `Successfully claimed ${bonusAmount} TXC tokens!`,
        newBalance: newBalance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in claim-daily-bonus:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})