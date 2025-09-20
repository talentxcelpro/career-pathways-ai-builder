import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TXCCalculation {
  user_id: string;
  email: string;
  full_name: string;
  posts_txc: number;
  connections_txc: number;
  joining_bonus: number;
  profile_bonus: number;
  daily_login_txc: number;
  social_activity_txc: number;
  total_txc: number;
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

    console.log('Starting TXC backfill process for all users...')

    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: true })

    if (profilesError) {
      throw new Error('Failed to fetch user profiles: ' + profilesError.message)
    }

    const calculations: TXCCalculation[] = []
    let processedCount = 0
    let errorCount = 0
    let skippedCount = 0

    console.log(`Found ${profiles.length} users to process`)

    for (const profile of profiles) {
      try {
        // Check if user already has TXC balance
        const { data: existingBalance } = await supabaseClient
          .from('user_txc_balances')
          .select('balance')
          .eq('user_id', profile.id)
          .maybeSingle()

        if (existingBalance && existingBalance.balance > 0) {
          console.log(`User ${profile.email} already has TXC balance: ${existingBalance.balance}, skipping...`)
          skippedCount++
          continue
        }

        // Get posts count
        const { count: postsCount } = await supabaseClient
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${profile.id},author_id.eq.${profile.id}`)

        // Get connections count (as requester)
        const { count: connectionsCount } = await supabaseClient
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .eq('requester_id', profile.id)
          .eq('status', 'accepted')

        // Calculate account age in days
        const accountAge = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))

        // Calculate TXC amounts with reasonable limits
        const finalPostsCount = Math.min(postsCount || 0, 5000) // Cap at 5000 posts for sanity
        const finalConnectionsCount = Math.min(connectionsCount || 0, 1000) // Cap at 1000 connections
        const finalAccountAge = Math.min(accountAge, 365) // Cap daily bonuses at 1 year
        
        const calculation: TXCCalculation = {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          posts_txc: finalPostsCount * 150, // 150 TXC per post
          connections_txc: finalConnectionsCount * 75, // 75 TXC per connection
          joining_bonus: 500, // One-time joining bonus
          profile_bonus: profile.full_name && profile.full_name.trim() ? 300 : 0, // Profile completion bonus
          daily_login_txc: finalAccountAge * 50, // 50 TXC per day (reduced from 75)
          social_activity_txc: Math.floor(finalAccountAge / 7) * 200, // 200 TXC per week (reduced from 300)
          total_txc: 0
        }

        calculation.total_txc = calculation.posts_txc + 
                               calculation.connections_txc + 
                               calculation.joining_bonus + 
                               calculation.profile_bonus + 
                               calculation.daily_login_txc + 
                               calculation.social_activity_txc

        calculations.push(calculation)

        // Award TXC to user if they have earned any
        if (calculation.total_txc > 0) {
          // Create or update TXC balance record
          const { error: balanceError } = await supabaseClient
            .from('user_txc_balances')
            .upsert({
              user_id: profile.id,
              balance: calculation.total_txc
            }, {
              onConflict: 'user_id'
            })

          if (balanceError) {
            console.error(`Error updating balance for ${profile.email}:`, balanceError)
            errorCount++
            continue
          }

          // Create transaction record
          const { error: txError } = await supabaseClient
            .from('txc_transactions')
            .insert({
              user_id: profile.id,
              transaction_type: 'mining',
              amount: calculation.total_txc,
              description: `Historical backfill: ${finalPostsCount} posts, ${finalConnectionsCount} connections, ${finalAccountAge} days active`
            })

          if (txError) {
            console.error(`Error creating transaction for ${profile.email}:`, txError)
            errorCount++
            continue
          }

          processedCount++
          console.log(`✅ Awarded ${calculation.total_txc.toLocaleString()} TXC to ${profile.email} (Posts: ${finalPostsCount}, Connections: ${finalConnectionsCount})`)
        } else {
          console.log(`❌ No TXC earned for ${profile.email} (no activity)`)
        }

      } catch (error) {
        console.error(`❌ Error processing user ${profile.email}:`, error)
        errorCount++
      }

      // Add small delay to avoid overwhelming the database
      if (processedCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`🎉 TXC backfill completed: ${processedCount} users processed, ${skippedCount} skipped, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `TXC backfill completed successfully`,
        statistics: {
          total_users: profiles.length,
          processed_users: processedCount,
          skipped_users: skippedCount,
          error_count: errorCount,
          calculations: calculations.slice(0, 10) // Show first 10 for preview
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in backfill-user-txc:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Failed to process TXC backfill'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})