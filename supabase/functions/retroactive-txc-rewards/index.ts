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
          total_spent: number
          last_activity_at: string | null
        }
        Update: {
          balance?: number
          total_earned?: number
          last_activity_at?: string
        }
      }
      txc_transactions: {
        Insert: {
          user_id: string
          amount: number
          transaction_type: string
          description: string
          activity_type?: string
          reference_id?: string
        }
      }
    }
  }
}

const TXC_REWARDS = {
  'post_created': { amount: 150, description: 'Create a post' },
  'connection_made': { amount: 75, description: 'Connect with someone' },
  'profile_completed': { amount: 300, description: 'Complete your profile' },
  'joining_bonus': { amount: 500, description: 'Welcome to TalentXcel!' }
};

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

    console.log(`Starting retroactive TXC rewards process...`);

    // Get all users who have posts
    const { data: postsData } = await supabaseClient
      .from('posts')
      .select('user_id')
      .not('user_id', 'is', null);

    // Get all users who have connections
    const { data: connectionsData } = await supabaseClient
      .from('connections')
      .select('requester_id, recipient_id')
      .eq('status', 'accepted');

    // Get all users with completed profiles
    const { data: profilesData } = await supabaseClient
      .from('profiles')
      .select('id')
      .not('full_name', 'is', null)
      .not('bio', 'is', null);

    // Get all unique user IDs from posts
    const userPostCounts = new Map<string, number>();
    postsData?.forEach(post => {
      if (post.user_id) {
        userPostCounts.set(post.user_id, (userPostCounts.get(post.user_id) || 0) + 1);
      }
    });

    // Get all unique user IDs from connections
    const userConnectionCounts = new Map<string, number>();
    connectionsData?.forEach(connection => {
      if (connection.requester_id) {
        userConnectionCounts.set(connection.requester_id, (userConnectionCounts.get(connection.requester_id) || 0) + 1);
      }
      if (connection.recipient_id) {
        userConnectionCounts.set(connection.recipient_id, (userConnectionCounts.get(connection.recipient_id) || 0) + 1);
      }
    });

    // Get all users with completed profiles
    const usersWithCompletedProfiles = new Set(profilesData?.map(p => p.id) || []);

    // Get all unique user IDs
    const allUserIds = new Set([
      ...userPostCounts.keys(),
      ...userConnectionCounts.keys(),
      ...usersWithCompletedProfiles
    ]);

    console.log(`Found ${allUserIds.size} users with activity to reward`);

    let totalRewardsGiven = 0;
    let usersRewarded = 0;

    // Process each user
    for (const userId of allUserIds) {
      try {
        // Get or create user balance
        let { data: balance } = await supabaseClient
          .from('user_txc_balances')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!balance) {
          const { data: newBalance, error: createError } = await supabaseClient
            .from('user_txc_balances')
            .insert({
              user_id: userId,
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              last_activity_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error(`Error creating balance for user ${userId}:`, createError);
            continue;
          }
          balance = newBalance;
        }

        let userTotalReward = 0;
        const transactions = [];

        // Award joining bonus
        transactions.push({
          user_id: userId,
          amount: TXC_REWARDS.joining_bonus.amount,
          transaction_type: 'mining',
          description: TXC_REWARDS.joining_bonus.description,
          activity_type: 'joining_bonus'
        });
        userTotalReward += TXC_REWARDS.joining_bonus.amount;

        // Award for posts (max 10 posts rewarded)
        const postCount = Math.min(userPostCounts.get(userId) || 0, 10);
        if (postCount > 0) {
          const postReward = postCount * TXC_REWARDS.post_created.amount;
          transactions.push({
            user_id: userId,
            amount: postReward,
            transaction_type: 'mining',
            description: `Retroactive reward for ${postCount} posts`,
            activity_type: 'post_created'
          });
          userTotalReward += postReward;
        }

        // Award for connections (max 10 connections rewarded)
        const connectionCount = Math.min(userConnectionCounts.get(userId) || 0, 10);
        if (connectionCount > 0) {
          const connectionReward = connectionCount * TXC_REWARDS.connection_made.amount;
          transactions.push({
            user_id: userId,
            amount: connectionReward,
            transaction_type: 'mining',
            description: `Retroactive reward for ${connectionCount} connections`,
            activity_type: 'connection_made'
          });
          userTotalReward += connectionReward;
        }

        // Award for completed profile
        if (usersWithCompletedProfiles.has(userId)) {
          transactions.push({
            user_id: userId,
            amount: TXC_REWARDS.profile_completed.amount,
            transaction_type: 'mining',
            description: TXC_REWARDS.profile_completed.description,
            activity_type: 'profile_completed'
          });
          userTotalReward += TXC_REWARDS.profile_completed.amount;
        }

        // Insert all transactions
        if (transactions.length > 0) {
          const { error: txError } = await supabaseClient
            .from('txc_transactions')
            .insert(transactions);

          if (txError) {
            console.error(`Error creating transactions for user ${userId}:`, txError);
            continue;
          }

          // Update balance
          const newBalance = (balance.balance || 0) + userTotalReward;
          const newTotalEarned = (balance.total_earned || 0) + userTotalReward;

          const { error: updateError } = await supabaseClient
            .from('user_txc_balances')
            .update({
              balance: newBalance,
              total_earned: newTotalEarned,
              last_activity_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error(`Error updating balance for user ${userId}:`, updateError);
            continue;
          }

          totalRewardsGiven += userTotalReward;
          usersRewarded++;
          
          console.log(`Awarded ${userTotalReward} TXC to user ${userId} (Posts: ${postCount}, Connections: ${connectionCount}, Profile: ${usersWithCompletedProfiles.has(userId)})`);
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        continue;
      }
    }

    console.log(`Retroactive rewards complete: ${usersRewarded} users rewarded with ${totalRewardsGiven} total TXC`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully awarded retroactive rewards to ${usersRewarded} users`,
        total_rewards: totalRewardsGiven,
        users_rewarded: usersRewarded
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in retroactive-txc-rewards:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});