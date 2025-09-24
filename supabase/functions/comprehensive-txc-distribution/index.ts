import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting comprehensive TXC distribution...');

    const startDate = new Date('2025-09-01T00:00:00Z');
    const now = new Date();

    // Phase 1: Get all users and issue 500 TXC welcome bonus
    const { data: allUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email, created_at, last_seen, is_online')
      .not('id', 'is', null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log(`Found ${allUsers.length} total users for TXC distribution`);

    let phase1Results = [];
    let phase2Results = [];
    let phase3Results = [];
    let totalAwarded = 0;

    // Phase 1: 500 TXC to all users (Welcome bonus)
    console.log('Phase 1: Awarding 500 TXC welcome bonus to all users...');
    
    for (const user of allUsers) {
      try {
        // Check if user already has a TXC balance record
        const { data: existingBalance } = await supabaseClient
          .from('user_txc_balances')
          .select('id, balance')
          .eq('user_id', user.id)
          .single();

        if (existingBalance) {
          // Update existing balance
          const { error: updateError } = await supabaseClient
            .from('user_txc_balances')
            .update({
              balance: existingBalance.balance + 500,
              total_earned: existingBalance.balance + 500,
              last_activity_at: now.toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          // Create new balance record
          const { error: insertError } = await supabaseClient
            .from('user_txc_balances')
            .insert({
              user_id: user.id,
              balance: 500,
              total_earned: 500,
              total_spent: 0,
              last_activity_at: now.toISOString()
            });

          if (insertError) throw insertError;
        }

        // Log the transaction
        await supabaseClient
          .from('token_transactions')
          .insert({
            to_user_id: user.id,
            amount: 500,
            transaction_type: 'reward',
            description: 'Platform-wide welcome bonus distribution',
            token_type: 'TXC',
            status: 'completed'
          });

        phase1Results.push({
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          awarded: 500,
          phase: 'welcome_bonus'
        });
        totalAwarded += 500;

      } catch (error) {
        console.error(`Failed to award welcome bonus to user ${user.id}:`, error);
        phase1Results.push({
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          awarded: 0,
          error: error.message,
          phase: 'welcome_bonus'
        });
      }
    }

    // Phase 2: Additional 150 TXC to active users
    console.log('Phase 2: Awarding 150 TXC bonus to active users...');
    
    const activeUsers = allUsers.filter(user => {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return user.last_seen && new Date(user.last_seen) > thirtyDaysAgo;
    });

    console.log(`Found ${activeUsers.length} active users (last seen within 30 days)`);

    for (const user of activeUsers) {
      try {
        // Update balance
        const { error: updateError } = await supabaseClient
          .from('user_txc_balances')
          .update({
            balance: supabaseClient.raw('balance + 150'),
            total_earned: supabaseClient.raw('total_earned + 150'),
            last_activity_at: now.toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Log the transaction
        await supabaseClient
          .from('token_transactions')
          .insert({
            to_user_id: user.id,
            amount: 150,
            transaction_type: 'reward',
            description: 'Active user bonus - platform distribution',
            token_type: 'TXC',
            status: 'completed'
          });

        phase2Results.push({
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          awarded: 150,
          phase: 'active_bonus'
        });
        totalAwarded += 150;

      } catch (error) {
        console.error(`Failed to award active user bonus to user ${user.id}:`, error);
        phase2Results.push({
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          awarded: 0,
          error: error.message,
          phase: 'active_bonus'
        });
      }
    }

    // Phase 3: Retroactive rewards based on policy from 01-09-2025
    console.log('Phase 3: Applying retroactive rewards from 01-09-2025...');

    for (const user of allUsers) {
      try {
        let retroactiveRewards = 0;
        const rewards = [];

        // Posts created since start date (+150 TXC each, max 10)
        const { data: posts } = await supabaseClient
          .from('posts')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
          .limit(10);

        if (posts && posts.length > 0) {
          const postReward = posts.length * 150;
          retroactiveRewards += postReward;
          rewards.push(`${posts.length} posts (+${postReward} TXC)`);
        }

        // Connections made since start date (+75 TXC each, max 10)
        const { data: connections } = await supabaseClient
          .from('connections')
          .select('id, created_at')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
          .limit(10);

        if (connections && connections.length > 0) {
          const connectionReward = connections.length * 75;
          retroactiveRewards += connectionReward;
          rewards.push(`${connections.length} connections (+${connectionReward} TXC)`);
        }

        // Profile completion bonus (+300 TXC if profile is complete)
        if (user.full_name && user.email) {
          retroactiveRewards += 300;
          rewards.push('Profile completion (+300 TXC)');
        }

        // Post likes since start date (+20 TXC each, max 50)
        const { data: postLikes } = await supabaseClient
          .from('post_likes')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
          .limit(50);

        if (postLikes && postLikes.length > 0) {
          const likeReward = postLikes.length * 20;
          retroactiveRewards += likeReward;
          rewards.push(`${postLikes.length} post likes (+${likeReward} TXC)`);
        }

        // Comments since start date (+20 TXC each, max 25)
        const { data: comments } = await supabaseClient
          .from('comments')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
          .limit(25);

        if (comments && comments.length > 0) {
          const commentReward = comments.length * 20;
          retroactiveRewards += commentReward;
          rewards.push(`${comments.length} comments (+${commentReward} TXC)`);
        }

        // Job applications since start date (+90 TXC each, max 10)
        const { data: applications } = await supabaseClient
          .from('job_applications')
          .select('id, applied_at')
          .eq('user_id', user.id)
          .gte('applied_at', startDate.toISOString())
          .order('applied_at', { ascending: true })
          .limit(10);

        if (applications && applications.length > 0) {
          const applicationReward = applications.length * 90;
          retroactiveRewards += applicationReward;
          rewards.push(`${applications.length} job applications (+${applicationReward} TXC)`);
        }

        // Profile views given since start date (+10 TXC each, max 20)
        const { data: profileViews } = await supabaseClient
          .from('profile_views')
          .select('id, viewed_at')
          .eq('viewer_id', user.id)
          .gte('viewed_at', startDate.toISOString())
          .order('viewed_at', { ascending: true })
          .limit(20);

        if (profileViews && profileViews.length > 0) {
          const viewReward = profileViews.length * 10;
          retroactiveRewards += viewReward;
          rewards.push(`${profileViews.length} profile views (+${viewReward} TXC)`);
        }

        // User activities since start date (+10 TXC each, max 30)
        const { data: activities } = await supabaseClient
          .from('user_activities')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
          .limit(30);

        if (activities && activities.length > 0) {
          const activityReward = activities.length * 10;
          retroactiveRewards += activityReward;
          rewards.push(`${activities.length} platform activities (+${activityReward} TXC)`);
        }

        if (retroactiveRewards > 0) {
          // Update balance
          const { error: updateError } = await supabaseClient
            .from('user_txc_balances')
            .update({
              balance: supabaseClient.raw(`balance + ${retroactiveRewards}`),
              total_earned: supabaseClient.raw(`total_earned + ${retroactiveRewards}`),
              last_activity_at: now.toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) throw updateError;

          // Log the transaction
          await supabaseClient
            .from('token_transactions')
            .insert({
              to_user_id: user.id,
              amount: retroactiveRewards,
              transaction_type: 'reward',
              description: `Retroactive rewards from 01-09-2025: ${rewards.join(', ')}`,
              token_type: 'TXC',
              status: 'completed'
            });

          phase3Results.push({
            user_id: user.id,
            name: user.full_name,
            email: user.email,
            awarded: retroactiveRewards,
            rewards: rewards,
            phase: 'retroactive'
          });
          totalAwarded += retroactiveRewards;
        }

      } catch (error) {
        console.error(`Failed to apply retroactive rewards to user ${user.id}:`, error);
        phase3Results.push({
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          awarded: 0,
          error: error.message,
          phase: 'retroactive'
        });
      }
    }

    const summary = {
      phase1_users: phase1Results.length,
      phase2_users: phase2Results.length,
      phase3_users: phase3Results.filter(r => r.awarded > 0).length,
      total_users_processed: allUsers.length,
      total_txc_awarded: totalAwarded,
      distribution_date: now.toISOString()
    };

    console.log('Comprehensive TXC distribution completed:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive TXC distribution completed successfully',
        summary,
        phase1_results: phase1Results,
        phase2_results: phase2Results,
        phase3_results: phase3Results,
        total_awarded: totalAwarded
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Comprehensive TXC distribution error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})