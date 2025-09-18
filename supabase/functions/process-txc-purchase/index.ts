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
          reference_id: string | null
          reference_type: string | null
          status: string
          metadata: any
          created_at: string
        }
        Insert: {
          from_user_id?: string | null
          to_user_id?: string | null
          transaction_type: string
          amount: number
          token_type?: string
          description: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          metadata?: any
        }
      }
      user_features: {
        Row: {
          id: string
          user_id: string
          feature_id: string
          is_active: boolean
          expires_at: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          user_id: string
          feature_id: string
          is_active?: boolean
          expires_at?: string | null
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

    const { userId, featureId, cost, description, metadata = {} } = await req.json()

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
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('token_type', 'TXC')
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
      .from('token_balances')
      .update({
        balance: newBalance,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('token_type', 'TXC')

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
        from_user_id: userId,
        to_user_id: null, // System purchase
        transaction_type: 'purchase',
        amount: cost,
        token_type: 'TXC',
        description: description,
        reference_id: featureId,
        reference_type: 'feature_purchase',
        status: 'completed',
        metadata: {
          ...metadata,
          purchased_at: new Date().toISOString(),
          feature_id: featureId
        }
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
      // Note: We don't return error here as balance was already deducted
      // In production, you'd want proper transaction handling
    }

    // Grant feature access (if applicable)
    if (featureId.startsWith('profile_') || featureId.startsWith('job_') || featureId.includes('monthly')) {
      let expiresAt: string | null = null
      
      // Set expiration for time-limited features
      if (featureId.includes('monthly')) {
        const expiry = new Date()
        expiry.setMonth(expiry.getMonth() + 1)
        expiresAt = expiry.toISOString()
      } else if (featureId.startsWith('job_')) {
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 30) // Default job posting duration
        expiresAt = expiry.toISOString()
      }

      const { error: featureError } = await supabaseClient
        .from('user_features')
        .insert({
          user_id: userId,
          feature_id: featureId,
          is_active: true,
          expires_at: expiresAt,
          metadata: {
            purchased_with_txc: true,
            cost_paid: cost,
            ...metadata
          }
        })

      if (featureError) {
        console.error('Error granting feature access:', featureError)
        // Don't fail the purchase, just log the error
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
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})