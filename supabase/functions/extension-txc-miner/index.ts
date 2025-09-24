import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TXC reward rates for different activities
const TXC_REWARDS = {
  'profile_sync': 100,
  'linkedin_profile_sync': 150,
  'naukri_profile_sync': 150,
  'twitter_profile_sync': 100,
  'job_application_assist': 200,
  'cover_letter_generation': 150,
  'profile_optimization': 100,
  'network_expansion': 50,
  'daily_extension_use': 25,
  'referral_bonus': 500,
  'achievement_unlock': 300,
  'ai_feature_usage': 75,
  'skill_verification': 200,
  'interview_prep': 250
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, activity, sessionToken, metadata = {} } = await req.json();

    // If sessionToken provided, validate it
    if (sessionToken) {
      const { data: session, error: sessionError } = await supabase
        .from('chrome_extension_sessions')
        .select('user_id')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session || session.user_id !== userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if activity is valid and get reward amount
    const baseReward = TXC_REWARDS[activity];
    if (!baseReward) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid activity type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate final reward amount (with potential multipliers)
    let rewardAmount = baseReward;
    
    // Apply multipliers based on metadata
    if (metadata.premium_user) {
      rewardAmount = Math.floor(rewardAmount * 1.5); // 50% bonus for premium users
    }
    
    if (metadata.streak_days && metadata.streak_days >= 7) {
      rewardAmount = Math.floor(rewardAmount * 1.25); // 25% bonus for weekly streak
    }

    // Check for daily limits to prevent abuse
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyEarnings, error: dailyError } = await supabase
      .from('txc_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'earned')
      .eq('source', 'chrome_extension')
      .gte('created_at', today + 'T00:00:00.000Z')
      .lt('created_at', today + 'T23:59:59.999Z');

    if (dailyError) {
      console.error('Daily earnings check error:', dailyError);
    }

    const dailyTotal = dailyEarnings?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const dailyLimit = 2000; // 2000 TXC daily limit from extension

    if (dailyTotal + rewardAmount > dailyLimit) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Daily TXC limit reached',
          dailyTotal,
          dailyLimit 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate recent activities (anti-spam)
    const recentDuplicate = await supabase
      .from('txc_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('source', 'chrome_extension')
      .eq('metadata->activity', activity)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes
      .limit(1);

    if (recentDuplicate.data && recentDuplicate.data.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Recent duplicate activity detected',
          cooldownMinutes: 5
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create TXC transaction
    const { data: transaction, error: txError } = await supabase
      .from('txc_transactions')
      .insert({
        user_id: userId,
        amount: rewardAmount,
        transaction_type: 'earned',
        source: 'chrome_extension',
        description: `TXC earned for ${activity.replace(/_/g, ' ')}`,
        metadata: {
          activity,
          extension_version: metadata.extension_version,
          browser: metadata.browser,
          platform: metadata.platform,
          ...metadata
        },
        status: 'completed'
      })
      .select()
      .single();

    if (txError) {
      console.error('TXC transaction error:', txError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process TXC reward' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's TXC balance
    const { error: balanceError } = await supabase
      .rpc('update_user_txc_balance', {
        user_uuid: userId,
        amount_change: rewardAmount
      });

    if (balanceError) {
      console.error('Balance update error:', balanceError);
    }

    // Log extension activity
    await supabase
      .from('chrome_extension_activities')
      .insert({
        user_id: userId,
        activity_type: activity,
        txc_earned: rewardAmount,
        metadata,
        created_at: new Date().toISOString()
      });

    // Check for achievements
    const achievements = await checkAndUnlockAchievements(supabase, userId, activity, metadata);

    return new Response(
      JSON.stringify({
        success: true,
        txcEarned: rewardAmount,
        transactionId: transaction.id,
        totalDailyEarnings: dailyTotal + rewardAmount,
        achievements: achievements,
        message: `You earned ${rewardAmount} TXC for ${activity.replace(/_/g, ' ')}!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Extension TXC miner error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkAndUnlockAchievements(supabase: any, userId: string, activity: string, metadata: any) {
  const achievements = [];
  
  try {
    // Check for profile completion achievement
    if (activity === 'linkedin_profile_sync') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, title, about, skills, linkedin_url')
        .eq('id', userId)
        .single();
      
      if (profile && profile.full_name && profile.title && profile.about && 
          profile.skills?.length > 0 && profile.linkedin_url) {
        achievements.push({
          type: 'profile_complete',
          title: 'Profile Master',
          description: 'Completed your professional profile',
          txc_bonus: 300
        });
      }
    }
    
    // Check for activity streak achievements
    if (metadata.streak_days) {
      if (metadata.streak_days === 7) {
        achievements.push({
          type: 'week_streak',
          title: 'Consistent Professional',
          description: '7-day activity streak',
          txc_bonus: 500
        });
      } else if (metadata.streak_days === 30) {
        achievements.push({
          type: 'month_streak',
          title: 'Career Champion',
          description: '30-day activity streak',
          txc_bonus: 1500
        });
      }
    }
    
    // Award achievement bonuses
    for (const achievement of achievements) {
      await supabase
        .from('txc_transactions')
        .insert({
          user_id: userId,
          amount: achievement.txc_bonus,
          transaction_type: 'earned',
          source: 'achievement',
          description: `Achievement bonus: ${achievement.title}`,
          metadata: { achievement_type: achievement.type }
        });
      
      await supabase
        .rpc('update_user_txc_balance', {
          user_uuid: userId,
          amount_change: achievement.txc_bonus
        });
    }
    
  } catch (error) {
    console.error('Achievement check error:', error);
  }
  
  return achievements;
}