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
      posts: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          recipient_id: string
          status: string
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

    console.log('Starting social TXC award process...')

    // Get all users with their post and connection counts
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

    for (const profile of users || []) {
      try {
        // Count user's posts
        const { count: postCount } = await supabaseClient
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('is_deleted', false)

        // Count user's connections (both as requester and recipient)
        const { count: connectionCount } = await supabaseClient
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .eq('status', 'accepted')

        const posts = postCount || 0
        const connections = connectionCount || 0

        // Calculate TXC award based on activity
        let awardAmount = 100 // Base amount
        
        // Bonus for posts (10 TXC per post, max 50 bonus)
        const postBonus = Math.min(posts * 10, 50)
        
        // Bonus for connections (5 TXC per connection, max 50 bonus)
        const connectionBonus = Math.min(connections * 5, 50)
        
        awardAmount += postBonus + connectionBonus

        // Get current balance
        const { data: balance } = await supabaseClient
          .from('token_balances')
          .select('*')
          .eq('user_id', profile.id)
          .single()

        const currentBalance = balance?.balance || 0
        const newBalance = currentBalance + awardAmount

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
            transaction_type: 'social_bonus',
            amount: awardAmount,
            token_type: 'TXC',
            description: `Social activity bonus: ${posts} posts, ${connections} connections`,
            reference_type: 'social_activity_bonus',
            status: 'completed',
            metadata: {
              posts: posts,
              connections: connections,
              base_amount: 100,
              post_bonus: postBonus,
              connection_bonus: connectionBonus,
              awarded_at: new Date().toISOString()
            }
          })

        results.push({
          user_id: profile.id,
          name: profile.full_name,
          email: profile.email,
          posts: posts,
          connections: connections,
          awarded: awardAmount,
          new_balance: newBalance
        })

        totalAwarded += awardAmount

        console.log(`Awarded ${awardAmount} TXC to ${profile.full_name} (${posts} posts, ${connections} connections)`)

      } catch (error) {
        console.error(`Error processing user ${profile.id}:`, error)
        results.push({
          user_id: profile.id,
          name: profile.full_name,
          error: error.message
        })
      }
    }

    console.log(`Social TXC award process completed. Total awarded: ${totalAwarded} TXC to ${results.length} users`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully awarded TXC to ${results.length} users`,
        total_awarded: totalAwarded,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in award-social-txc:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})