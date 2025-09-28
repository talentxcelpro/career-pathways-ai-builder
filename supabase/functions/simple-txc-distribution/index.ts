import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface DistributionRequest {
  phase: 'welcome' | 'active' | 'retroactive';
  batchSize?: number;
  startOffset?: number;
  dryRun?: boolean;
}

interface UserResult {
  user_id: string;
  name: string | null;
  email: string | null;
  awarded: number;
  phase: string;
  success: boolean;
  error?: string;
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

    const { phase, batchSize = 50, startOffset = 0, dryRun = false }: DistributionRequest = await req.json()

    console.log(`🚀 Starting ${phase} TXC distribution - Batch size: ${batchSize}, Offset: ${startOffset}, Dry run: ${dryRun}`)

    let results: UserResult[] = []
    let totalAwarded = 0
    let processedCount = 0

    if (phase === 'welcome') {
      // Phase 1: Welcome bonus for users without existing TXC
      const { data: usersWithoutTXC, error: queryError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email')
        .not('id', 'in', `(SELECT user_id FROM user_txc_balances)`)
        .range(startOffset, startOffset + batchSize - 1)
        .order('created_at', { ascending: true })

      if (queryError) {
        throw new Error(`Failed to fetch users: ${queryError.message}`)
      }

      console.log(`📊 Found ${usersWithoutTXC?.length || 0} users for welcome bonus`)

      for (const user of usersWithoutTXC || []) {
        try {
          if (!dryRun) {
            // Create TXC balance record
            const { error: balanceError } = await supabaseClient
              .from('user_txc_balances')
              .upsert({
                user_id: user.id,
                txc_balance: 500,
                total_earned: 500
              })

            if (balanceError) throw balanceError

            // Create transaction record
            const { error: txError } = await supabaseClient
              .from('txc_transactions')
              .insert({
                user_id: user.id,
                amount: 500,
                transaction_type: 'mining',
                activity_type: 'joining_bonus',
                description: 'Welcome to TalentXcel! 🎉 Here\'s your 500 TXC welcome bonus'
              })

            if (txError) throw txError
          }

          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: 500,
            phase: 'welcome',
            success: true
          })

          totalAwarded += 500
          processedCount++

          if (processedCount % 10 === 0) {
            console.log(`✅ Processed ${processedCount} welcome bonuses`)
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`❌ Failed to award welcome bonus to ${user.id}:`, error)
          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: 0,
            phase: 'welcome',
            success: false,
            error: errorMessage
          })
        }
      }

    } else if (phase === 'active') {
      // Phase 2: Active user bonus (users with activity in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      // Get active user IDs first
      const { data: activeUserIds, error: idsError } = await supabaseClient
        .rpc('get_active_user_ids', { days_back: 30 })

      if (idsError || !activeUserIds?.length) {
        console.log('No active users found or error:', idsError)
        return new Response(
          JSON.stringify({ success: true, message: 'No active users found', summary: { phase, processed_count: 0, total_awarded: 0 } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: activeUsers, error: queryError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email')
        .in('id', activeUserIds.slice(startOffset, startOffset + batchSize))

      if (queryError) {
        throw new Error(`Failed to fetch active users: ${queryError.message}`)
      }

      console.log(`📊 Found ${activeUsers?.length || 0} active users`)

      for (const user of activeUsers || []) {
        try {
          if (!dryRun) {
            // Check if user already has TXC balance
            const { data: existingBalance } = await supabaseClient
              .from('user_txc_balances')
              .select('txc_balance, total_earned')
              .eq('user_id', user.id)
              .maybeSingle()

            if (existingBalance) {
              // Update existing balance
              const newBalance = existingBalance.txc_balance + 150
              const newTotalEarned = existingBalance.total_earned + 150

              const { error: balanceError } = await supabaseClient
                .from('user_txc_balances')
                .update({
                  txc_balance: newBalance,
                  total_earned: newTotalEarned
                })
                .eq('user_id', user.id)

              if (balanceError) throw balanceError
            } else {
              // Create new balance record
              const { error: balanceError } = await supabaseClient
                .from('user_txc_balances')
                .insert({
                  user_id: user.id,
                  txc_balance: 150,
                  total_earned: 150
                })

              if (balanceError) throw balanceError
            }

            // Create transaction record
            const { error: txError } = await supabaseClient
              .from('txc_transactions')
              .insert({
                user_id: user.id,
                amount: 150,
                transaction_type: 'mining',
                activity_type: 'active_user_bonus',
                description: 'Active user bonus - thank you for being engaged! 🌟'
              })

            if (txError) throw txError
          }

          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: 150,
            phase: 'active',
            success: true
          })

          totalAwarded += 150
          processedCount++

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`❌ Failed to award active bonus to ${user.id}:`, error)
          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: 0,
            phase: 'active',
            success: false,
            error: errorMessage
          })
        }
      }

    } else if (phase === 'retroactive') {
      // Phase 3: Retroactive rewards based on contributions
      const { data: contributingUsers, error: queryError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email')
        .range(startOffset, startOffset + batchSize - 1)
        .order('created_at', { ascending: true })

      if (queryError) {
        throw new Error(`Failed to fetch contributing users: ${queryError.message}`)
      }

      console.log(`📊 Found ${contributingUsers?.length || 0} users for retroactive rewards`)

      for (const user of contributingUsers || []) {
        try {
          // Calculate contribution score based on activity
          console.log(`🔍 Processing retroactive rewards for user: ${user.email}`)
          
          const { count: postCount } = await supabaseClient
            .from('posts')
            .select('id', { count: 'exact' })
            .or(`user_id.eq.${user.id},author_id.eq.${user.id}`)

          const { count: connectionCount } = await supabaseClient
            .from('connections')
            .select('id', { count: 'exact' })
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .eq('status', 'accepted')

          // Enhanced reward calculation based on actual activity
          const posts = Math.min(postCount || 0, 10) // Cap at 10 posts
          const connections = Math.min(connectionCount || 0, 10) // Cap at 10 connections
          const postReward = posts * 150 // 150 TXC per post
          const connectionReward = connections * 75 // 75 TXC per connection
          const profileReward = 300 // Profile completion bonus
          
          const totalReward = postReward + connectionReward + profileReward
          
          console.log(`📊 User ${user.email} activity: ${posts} posts (${postReward} TXC), ${connections} connections (${connectionReward} TXC), profile bonus (${profileReward} TXC) = ${totalReward} TXC total`)
          
          if (!dryRun && totalReward > 0) {
            // Check if user already has TXC balance
            const { data: existingBalance } = await supabaseClient
              .from('user_txc_balances')
              .select('txc_balance, total_earned')
              .eq('user_id', user.id)
              .maybeSingle()

            if (existingBalance) {
              // Calculate the difference to avoid double rewarding
              const currentEarned = existingBalance.total_earned || 0
              // Only award if they haven't already received retroactive rewards
              if (currentEarned < totalReward + 500) { // 500 is welcome bonus
                const additionalReward = Math.max(0, totalReward + 500 - currentEarned)
                
                if (additionalReward > 0) {
                  const newBalance = existingBalance.txc_balance + additionalReward
                  const newTotalEarned = existingBalance.total_earned + additionalReward

                  const { error: balanceError } = await supabaseClient
                    .from('user_txc_balances')
                    .update({
                      txc_balance: newBalance,
                      total_earned: newTotalEarned,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)

                  if (balanceError) {
                    console.error(`Balance update error for ${user.email}:`, balanceError)
                    throw balanceError
                  }

                  // Create transaction record
                  const { error: txError } = await supabaseClient
                    .from('txc_transactions')
                    .insert({
                      user_id: user.id,
                      amount: additionalReward,
                      transaction_type: 'mining',
                      activity_type: 'retroactive_reward',
                      description: `Retroactive reward: ${posts} posts (${postReward}), ${connections} connections (${connectionReward}), profile bonus (${profileReward}) 🏆`
                    })

                  if (txError) {
                    console.error(`Transaction error for ${user.email}:`, txError)
                    // Don't throw, just log
                  }
                  
                  console.log(`✅ Awarded ${additionalReward} additional TXC to ${user.email}`)
                } else {
                  console.log(`ℹ️ User ${user.email} already has sufficient rewards`)
                }
              } else {
                console.log(`ℹ️ User ${user.email} already received full retroactive rewards`)
              }
            } else {
              // Create new balance record with welcome bonus + retroactive rewards
              const initialBalance = 500 + totalReward // Welcome bonus + activity rewards
              
              const { error: balanceError } = await supabaseClient
                .from('user_txc_balances')
                .insert({
                  user_id: user.id,
                  txc_balance: initialBalance,
                  total_earned: initialBalance,
                  total_spent: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (balanceError) {
                console.error(`Balance creation error for ${user.email}:`, balanceError)
                throw balanceError
              }

              // Create transaction records
              const transactions = [
                {
                  user_id: user.id,
                  amount: 500,
                  transaction_type: 'bonus',
                  activity_type: 'welcome_bonus',
                  description: 'Welcome to TalentXcel! 🎉'
                },
                {
                  user_id: user.id,
                  amount: totalReward,
                  transaction_type: 'mining',
                  activity_type: 'retroactive_reward',
                  description: `Retroactive reward: ${posts} posts (${postReward}), ${connections} connections (${connectionReward}), profile bonus (${profileReward}) 🏆`
                }
              ]

              const { error: txError } = await supabaseClient
                .from('txc_transactions')
                .insert(transactions)

              if (txError) {
                console.error(`Transaction creation error for ${user.email}:`, txError)
                // Don't throw, just log
              }
              
              console.log(`✅ Created new balance with ${initialBalance} TXC for ${user.email}`)
            }
          }

          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: totalReward,
            phase: 'retroactive',
            success: true
          })

          totalAwarded += totalReward
          processedCount++

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`❌ Failed to award retroactive reward to ${user.id}:`, error)
          results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: 0,
            phase: 'retroactive',
            success: false,
            error: errorMessage
          })
        }
      }
    }

    const summary = {
      phase,
      processed_count: processedCount,
      total_awarded: totalAwarded,
      success_count: results.filter(r => r.success).length,
      error_count: results.filter(r => !r.success).length,
      dry_run: dryRun,
      batch_info: {
        batch_size: batchSize,
        start_offset: startOffset,
        end_offset: startOffset + processedCount - 1
      }
    }

    console.log(`🎉 ${phase} distribution complete:`, summary)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${phase} TXC distribution ${dryRun ? 'simulated' : 'completed'} successfully`,
        summary,
        results: results.slice(0, 20), // Limit results in response
        total_results: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('TXC distribution error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: errorStack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

function calculateRetroactiveReward(contributionScore: number): number {
  // Reward calculation based on contribution score
  if (contributionScore >= 20) return 1000  // High contributors
  if (contributionScore >= 10) return 600   // Medium contributors  
  if (contributionScore >= 5) return 400    // Low contributors
  if (contributionScore >= 1) return 200    // Minimal contributors
  return 0
}