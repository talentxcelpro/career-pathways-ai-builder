import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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

    // Verify admin access
    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log(`🚀 Starting TXC backfill process by user: ${user.id}`)

    // Get all users who don't have TXC balances yet
    const { data: usersWithoutTXC, error: usersError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        title,
        about,
        profile_picture_url,
        created_at
      `)
      .not('id', 'in', `(SELECT user_id FROM user_txc_balances)`)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    let processedUsers = 0
    let errorCount = 0
    const calculations: Array<{
      email: string
      full_name: string
      total_txc: number
      posts_txc: number
      connections_txc: number
      profile_txc: number
      joining_txc: number
    }> = []

    for (const profile of usersWithoutTXC || []) {
      try {
        console.log(`Processing user: ${profile.email}`)

        // 1. Joining bonus: 500 TXC
        let totalTXC = 500
        const joiningTXC = 500

        // 2. Posts bonus: 150 TXC per post (max 10)
        const { data: posts } = await supabaseClient
          .from('posts')
          .select('id')
          .eq('user_id', profile.id)
          .limit(10)

        const postsCount = posts?.length || 0
        const postsTXC = postsCount * 150
        totalTXC += postsTXC

        // 3. Connections bonus: 75 TXC per connection (max 10)
        const { data: connections } = await supabaseClient
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .eq('status', 'accepted')
          .limit(10)

        const connectionsCount = connections?.length || 0
        const connectionsTXC = connectionsCount * 75
        totalTXC += connectionsTXC

        // 4. Profile completion bonus: 300 TXC
        let profileTXC = 0
        if (profile.full_name && profile.title && profile.about && profile.profile_picture_url) {
          profileTXC = 300
          totalTXC += profileTXC
        }

        console.log(`User ${profile.email}: Posts(${postsCount}): ${postsTXC}, Connections(${connectionsCount}): ${connectionsTXC}, Profile: ${profileTXC}, Total: ${totalTXC}`)

        // Create TXC balance record
        const { error: balanceError } = await supabaseClient
          .from('user_txc_balances')
          .insert({
            user_id: profile.id,
            txc_balance: totalTXC,
            total_earned: totalTXC,
            total_spent: 0
          })

        if (balanceError) {
          console.error(`Error creating TXC balance for ${profile.email}:`, balanceError)
          errorCount++
          continue
        }

        // Create transaction records
        const transactions = [
          {
            user_id: profile.id,
            transaction_type: 'bonus',
            amount: joiningTXC,
            description: 'Welcome bonus for joining TalentXcel'
          }
        ]

        if (postsTXC > 0) {
          transactions.push({
            user_id: profile.id,
            transaction_type: 'mining',
            amount: postsTXC,
            description: `Retroactive bonus for ${postsCount} posts created`
          })
        }

        if (connectionsTXC > 0) {
          transactions.push({
            user_id: profile.id,
            transaction_type: 'mining',
            amount: connectionsTXC,
            description: `Retroactive bonus for ${connectionsCount} connections made`
          })
        }

        if (profileTXC > 0) {
          transactions.push({
            user_id: profile.id,
            transaction_type: 'bonus',
            amount: profileTXC,
            description: 'Profile completion bonus'
          })
        }

        // Insert transactions
        const { error: txError } = await supabaseClient
          .from('txc_transactions')
          .insert(transactions)

        if (txError) {
          console.error(`Error creating transactions for ${profile.email}:`, txError)
        }

        processedUsers++
        calculations.push({
          email: profile.email || 'No email',
          full_name: profile.full_name || 'Unknown',
          total_txc: totalTXC,
          posts_txc: postsTXC,
          connections_txc: connectionsTXC,
          profile_txc: profileTXC,
          joining_txc: joiningTXC
        })

      } catch (error) {
        console.error(`Error processing user ${profile.email}:`, error)
        errorCount++
      }
    }

    const statistics = {
      total_users: usersWithoutTXC?.length || 0,
      processed_users: processedUsers,
      error_count: errorCount,
      calculations: calculations.slice(0, 10) // Return first 10 for display
    }

    console.log(`✅ Backfill completed: ${processedUsers} users processed, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `TXC backfill completed for ${processedUsers} users`,
        statistics
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Backfill error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})