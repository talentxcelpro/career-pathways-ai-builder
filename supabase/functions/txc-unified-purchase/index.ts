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
      subscription_plans: {
        Row: {
          id: string
          name: string
          price: number
          currency: string
          features: string[]
          is_active: boolean
        }
      }
      subscribers: {
        Row: {
          id: string
          user_id: string
          subscription_plan: string
          subscription_tier: string
          status: string
          subscription_start: string
          subscription_end: string
          amount: number
          currency: string
        }
        Insert: {
          user_id: string
          email: string
          subscription_plan: string
          subscription_tier: string
          status: string
          subscription_start: string
          subscription_end: string
          amount: number
          currency: string
          last_payment_date?: string
          updated_at?: string
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

    const { purchaseType, featureId, planName, cost, description, metadata = {} } = await req.json()

    console.log(`Unified TXC purchase: ${purchaseType}`, {
      featureId,
      planName,
      cost,
      userId: user.id
    })

    // Validate inputs
    if (!cost || cost <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid cost parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get current balance
    const { data: balance, error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError) {
      console.error('Error fetching balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Unable to fetch balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!balance || balance.txc_balance < cost) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient TXC balance',
          required: cost,
          available: balance?.txc_balance || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Start transaction
    const newBalance = balance.txc_balance - cost

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        txc_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

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
        user_id: user.id,
        amount: -cost,
        transaction_type: 'purchase',
        description: description || `TXC Purchase: ${featureId || planName}`
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
    }

    let additionalData = {}

    // Handle subscription purchases
    if (purchaseType === 'subscription' && planName) {
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1) // 1 month subscription
      
      const subscriptionData = {
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_plan: planName,
        subscription_tier: planName,
        status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: expiry.toISOString(),
        last_payment_date: new Date().toISOString(),
        amount: cost,
        currency: 'TXC',
        updated_at: new Date().toISOString(),
      }

      const { error: subscriptionError } = await supabaseClient
        .from('subscribers')
        .upsert(subscriptionData, { onConflict: 'user_id' })

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create subscription' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      additionalData = {
        subscriptionActivated: true,
        subscriptionPlan: planName,
        expiresAt: expiry.toISOString()
      }
    }

    // Handle feature purchases
    if (purchaseType === 'feature' && featureId) {
      // Record feature purchase
      additionalData = {
        featureActivated: true,
        featureId: featureId
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Purchase completed successfully`,
        newBalance: newBalance,
        cost: cost,
        purchaseType,
        ...additionalData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in txc-unified-purchase:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})