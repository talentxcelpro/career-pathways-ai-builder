import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
        }
      }
      token_balances: {
        Row: {
          user_id: string
          balance: number
          locked_balance: number
          token_type: string
        }
        Insert: {
          user_id: string
          balance: number
          locked_balance?: number
          token_type?: string
        }
        Update: {
          balance?: number
          locked_balance?: number
        }
      }
      token_transactions: {
        Insert: {
          to_user_id: string
          transaction_type: string
          amount: number
          token_type?: string
          description: string
          reference_type?: string
          metadata?: any
          status?: string
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

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('role', ['super_admin', 'admin'])
      .single()

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log('Starting joining bonus award process...')

    // Get all users who haven't received a joining bonus yet
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const results = []
    let totalAwarded = 0
    const JOINING_BONUS = 100

    for (const profile of users || []) {
      try {
        // Check if user already received joining bonus
        const { data: existingBonus } = await supabaseClient
          .from('token_transactions')
          .select('id')
          .eq('to_user_id', profile.id)
          .eq('transaction_type', 'joining_bonus')
          .limit(1)
          .single()

        if (existingBonus) {
          results.push({
            user_id: profile.id,
            name: profile.full_name,
            email: profile.email,
            already_received: true,
            awarded: 0
          })
          continue
        }

        // Get current balance
        const { data: balance } = await supabaseClient
          .from('token_balances')
          .select('*')
          .eq('user_id', profile.id)
          .single()

        const currentBalance = balance?.balance || 0
        const newBalance = currentBalance + JOINING_BONUS

        // Update or insert balance
        await supabaseClient
          .from('token_balances')
          .upsert({
            user_id: profile.id,
            balance: newBalance,
            locked_balance: balance?.locked_balance || 0,
            token_type: 'TXC'
          })

        // Record transaction
        await supabaseClient
          .from('token_transactions')
          .insert({
            to_user_id: profile.id,
            transaction_type: 'joining_bonus',
            amount: JOINING_BONUS,
            token_type: 'TXC',
            description: 'Welcome to TalentXcel! Here\'s your joining bonus.',
            reference_type: 'welcome_bonus',
            status: 'completed',
            metadata: {
              bonus_type: 'joining',
              awarded_at: new Date().toISOString()
            }
          })

        results.push({
          user_id: profile.id,
          name: profile.full_name,
          email: profile.email,
          awarded: JOINING_BONUS,
          new_balance: newBalance,
          already_received: false
        })

        totalAwarded += JOINING_BONUS

        console.log(`Awarded ${JOINING_BONUS} TXC joining bonus to ${profile.full_name}`)

      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error)
        results.push({
          user_id: profile.id,
          name: profile.full_name,
          error: error.message
        })
      }
    }

    console.log(`Joining bonus award process completed. Total awarded: ${totalAwarded} TXC to ${results.filter(r => r.awarded > 0).length} users`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully awarded joining bonuses`,
        total_awarded: totalAwarded,
        users_awarded: results.filter(r => r.awarded > 0).length,
        already_received: results.filter(r => r.already_received).length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in award-joining-bonus:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})