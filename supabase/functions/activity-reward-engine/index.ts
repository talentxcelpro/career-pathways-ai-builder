import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Activity reward configurations
const ACTIVITY_REWARDS = {
  'profile_completion': { base: 50, multiplier: 1.0, daily_limit: 100 },
  'job_application': { base: 25, multiplier: 1.2, daily_limit: 500 },
  'profile_sync': { base: 15, multiplier: 1.0, daily_limit: 200 },
  'network_connection': { base: 10, multiplier: 1.1, daily_limit: 300 },
  'skill_assessment': { base: 30, multiplier: 1.0, daily_limit: 150 },
  'interview_prep': { base: 20, multiplier: 1.0, daily_limit: 200 },
  'course_completion': { base: 100, multiplier: 2.0, daily_limit: 300 },
  'content_sharing': { base: 15, multiplier: 1.0, daily_limit: 150 },
  'referral_signup': { base: 500, multiplier: 1.0, daily_limit: 2000 },
  'premium_upgrade': { base: 1000, multiplier: 1.0, daily_limit: 1000 },
  'daily_login': { base: 5, multiplier: 1.0, daily_limit: 5 },
  'streak_bonus': { base: 50, multiplier: 1.5, daily_limit: 200 }
};

// Bonus multipliers based on user tier
const TIER_MULTIPLIERS = {
  'bronze': 1.0,
  'silver': 1.2,
  'gold': 1.5,
  'platinum': 2.0,
  'diamond': 2.5
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, action, activityData } = await req.json();

    // Validate session for user activities
    let userId = null;
    if (sessionToken) {
      const { data: session, error: sessionError } = await supabase
        .from('chrome_extension_sessions')
        .select('user_id')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = session.user_id;
    } else if (activityData?.userId) {
      userId = activityData.userId;
    }

    switch (action) {
      case 'process_activity': {
        const { activityType, metadata = {}, customAmount } = activityData;

        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's current tier and daily activity
        const { data: userStats, error: statsError } = await supabase
          .from('user_txc_stats')
          .select('current_tier, daily_earnings, last_activity_date')
          .eq('user_id', userId)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          console.error('User stats error:', statsError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get user stats' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userTier = userStats?.current_tier || 'bronze';
        const today = new Date().toISOString().split('T')[0];
        const lastActivityDate = userStats?.last_activity_date?.split('T')[0];
        const dailyEarnings = lastActivityDate === today ? (userStats?.daily_earnings || 0) : 0;

        // Calculate reward amount
        const rewardConfig = ACTIVITY_REWARDS[activityType];
        if (!rewardConfig && !customAmount) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid activity type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let baseAmount = customAmount || rewardConfig.base;
        let multiplier = rewardConfig?.multiplier || 1.0;
        let dailyLimit = rewardConfig?.dailyLimit || 1000;

        // Apply tier multiplier
        const tierMultiplier = TIER_MULTIPLIERS[userTier] || 1.0;
        multiplier *= tierMultiplier;

        // Apply activity-specific bonuses
        if (activityType === 'job_application' && metadata.appliedSameDay > 1) {
          multiplier *= 1.1; // Bonus for multiple applications
        }

        if (activityType === 'profile_completion' && metadata.completionPercentage >= 90) {
          multiplier *= 1.5; // Bonus for high completion
        }

        const finalAmount = Math.round(baseAmount * multiplier);

        // Check daily limits
        const currentTypeEarnings = await getDailyActivityEarnings(supabase, userId, activityType, today);
        if (currentTypeEarnings + finalAmount > dailyLimit) {
          const remainingLimit = Math.max(0, dailyLimit - currentTypeEarnings);
          if (remainingLimit === 0) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Daily limit reached for this activity',
                dailyLimit,
                currentEarnings: currentTypeEarnings
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          finalAmount = remainingLimit;
        }

        // Record the activity and reward
        const { data: activityRecord, error: activityError } = await supabase
          .from('txc_activities')
          .insert({
            user_id: userId,
            activity_type: activityType,
            amount_earned: finalAmount,
            multiplier_applied: multiplier,
            metadata: {
              ...metadata,
              tier: userTier,
              originalAmount: baseAmount,
              tierMultiplier
            },
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (activityError) {
          console.error('Activity recording error:', activityError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to record activity' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update user's TXC balance
        const { error: balanceError } = await supabase.rpc('add_txc_balance', {
          user_id: userId,
          amount: finalAmount
        });

        if (balanceError) {
          console.error('Balance update error:', balanceError);
        }

        // Update user stats
        await supabase
          .from('user_txc_stats')
          .upsert({
            user_id: userId,
            current_tier: userTier,
            daily_earnings: dailyEarnings + finalAmount,
            total_earned: (userStats?.total_earned || 0) + finalAmount,
            last_activity_date: new Date().toISOString(),
            activity_count: (userStats?.activity_count || 0) + 1
          });

        // Check for tier upgrades
        const newTier = await checkTierUpgrade(supabase, userId, userStats?.total_earned || 0 + finalAmount);
        
        return new Response(
          JSON.stringify({
            success: true,
            activityId: activityRecord.id,
            amountEarned: finalAmount,
            tier: userTier,
            newTier: newTier !== userTier ? newTier : null,
            dailyEarnings: dailyEarnings + finalAmount,
            multiplierApplied: multiplier
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_user_rewards': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's reward history
        const { data: rewardHistory, error: historyError } = await supabase
          .from('txc_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (historyError) {
          console.error('Reward history error:', historyError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get reward history' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user stats
        const { data: userStats } = await supabase
          .from('user_txc_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        return new Response(
          JSON.stringify({
            success: true,
            rewardHistory: rewardHistory || [],
            userStats: userStats || {},
            availableActivities: Object.keys(ACTIVITY_REWARDS)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_daily_limits': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const today = new Date().toISOString().split('T')[0];
        const dailyLimits = {};

        for (const [activityType, config] of Object.entries(ACTIVITY_REWARDS)) {
          const currentEarnings = await getDailyActivityEarnings(supabase, userId, activityType, today);
          dailyLimits[activityType] = {
            limit: config.daily_limit,
            used: currentEarnings,
            remaining: Math.max(0, config.daily_limit - currentEarnings)
          };
        }

        return new Response(
          JSON.stringify({
            success: true,
            dailyLimits,
            date: today
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_leaderboard': {
        // Get top earners for motivation
        const { data: leaderboard, error: leaderboardError } = await supabase
          .from('user_txc_stats')
          .select('user_id, total_earned, current_tier, profiles(full_name, profile_picture_url)')
          .order('total_earned', { ascending: false })
          .limit(20);

        if (leaderboardError) {
          console.error('Leaderboard error:', leaderboardError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get leaderboard' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            leaderboard: leaderboard || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Activity reward engine error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getDailyActivityEarnings(supabase: any, userId: string, activityType: string, date: string): Promise<number> {
  const { data, error } = await supabase
    .from('txc_activities')
    .select('amount_earned')
    .eq('user_id', userId)
    .eq('activity_type', activityType)
    .gte('created_at', `${date}T00:00:00.000Z`)
    .lt('created_at', `${date}T23:59:59.999Z`);

  if (error) {
    console.error('Daily earnings error:', error);
    return 0;
  }

  return (data || []).reduce((sum, record) => sum + record.amount_earned, 0);
}

async function checkTierUpgrade(supabase: any, userId: string, totalEarned: number): Promise<string> {
  const tierThresholds = {
    'bronze': 0,
    'silver': 1000,
    'gold': 5000,
    'platinum': 15000,
    'diamond': 50000
  };

  let newTier = 'bronze';
  for (const [tier, threshold] of Object.entries(tierThresholds)) {
    if (totalEarned >= threshold) {
      newTier = tier;
    } else {
      break;
    }
  }

  // Update tier if changed
  await supabase
    .from('user_txc_stats')
    .update({ current_tier: newTier })
    .eq('user_id', userId);

  return newTier;
}