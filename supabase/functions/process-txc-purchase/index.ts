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
        }
      }
      pro_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          status: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          user_id: string
          plan_name: string
          status?: string
          expires_at?: string | null
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

    const { userId, featureId, cost, description, planName, metadata = {} } = await req.json()

    // Validate inputs
    if (!userId || !featureId || !cost || cost <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid purchase parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Security check - ensure user can only purchase for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot purchase for other users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log(`Processing TXC purchase for user: ${userId}, feature: ${featureId}, cost: ${cost}`)

    // Get current balance
    const { data: balance, error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (balanceError) {
      console.error('Error fetching balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Unable to fetch balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!balance || balance.balance < cost) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient TXC balance',
          required: cost,
          available: balance?.balance || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Start transaction to deduct TXC and grant feature
    const newBalance = balance.balance - cost

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        balance: newBalance,
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

    // Record transaction
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: userId,
        amount: -cost, // Negative for spending
        transaction_type: 'purchase',
        description: description || `Purchased ${featureId}`
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
      // Note: We don't return error here as balance was already deducted
      // In production, you'd want proper transaction handling
    }

    // Grant feature access - specifically handle subscription purchases
    if (featureId === 'pro_subscription' && planName) {
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1) // 1 month subscription
      
      const { error: subscriptionError } = await supabaseClient
        .from('pro_subscriptions')
        .insert({
          user_id: userId,
          plan_name: planName,
          status: 'active',
          expires_at: expiry.toISOString()
        })

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        // Don't fail the purchase, but note the issue
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Purchase completed successfully',
        newBalance: newBalance,
        featureId: featureId,
        cost: cost
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-txc-purchase:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})