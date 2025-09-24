import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Achievement definitions
const ACHIEVEMENTS = {
  // Profile achievements
  'profile_perfectionist': {
    name: 'Profile Perfectionist',
    description: 'Complete 100% of your profile',
    category: 'profile',
    condition: { field: 'profile_completion', operator: 'gte', value: 100 },
    reward: 200,
    badge: 'perfectionist'
  },
  'social_connector': {
    name: 'Social Connector',
    description: 'Link all your social profiles',
    category: 'profile',
    condition: { field: 'linked_platforms', operator: 'gte', value: 4 },
    reward: 150,
    badge: 'connector'
  },

  // Job search achievements
  'job_hunter': {
    name: 'Job Hunter',
    description: 'Apply to 10 jobs',
    category: 'job_search',
    condition: { field: 'job_applications', operator: 'gte', value: 10 },
    reward: 100,
    badge: 'hunter'
  },
  'application_master': {
    name: 'Application Master',
    description: 'Apply to 50 jobs',
    category: 'job_search',
    condition: { field: 'job_applications', operator: 'gte', value: 50 },
    reward: 500,
    badge: 'master'
  },
  'interview_ace': {
    name: 'Interview Ace',
    description: 'Complete 5 interview preps',
    category: 'job_search',
    condition: { field: 'interview_preps', operator: 'gte', value: 5 },
    reward: 300,
    badge: 'ace'
  },

  // Networking achievements
  'network_builder': {
    name: 'Network Builder',
    description: 'Connect with 25 professionals',
    category: 'networking',
    condition: { field: 'connections', operator: 'gte', value: 25 },
    reward: 250,
    badge: 'builder'
  },
  'influencer': {
    name: 'Influencer',
    description: 'Share 20 professional posts',
    category: 'networking',
    condition: { field: 'content_shares', operator: 'gte', value: 20 },
    reward: 400,
    badge: 'influencer'
  },

  // Learning achievements
  'skill_collector': {
    name: 'Skill Collector',
    description: 'Add 15 skills to your profile',
    category: 'learning',
    condition: { field: 'skills_count', operator: 'gte', value: 15 },
    reward: 180,
    badge: 'collector'
  },
  'course_completer': {
    name: 'Course Completer',
    description: 'Complete 5 courses',
    category: 'learning',
    condition: { field: 'courses_completed', operator: 'gte', value: 5 },
    reward: 600,
    badge: 'completer'
  },

  // Extension achievements
  'extension_explorer': {
    name: 'Extension Explorer',
    description: 'Use extension features 30 times',
    category: 'extension',
    condition: { field: 'extension_usage', operator: 'gte', value: 30 },
    reward: 200,
    badge: 'explorer'
  },
  'automation_expert': {
    name: 'Automation Expert',
    description: 'Use auto-apply feature 20 times',
    category: 'extension',
    condition: { field: 'auto_applies', operator: 'gte', value: 20 },
    reward: 350,
    badge: 'expert'
  },

  // Milestone achievements
  'first_week': {
    name: 'First Week Warrior',
    description: 'Active for 7 consecutive days',
    category: 'milestone',
    condition: { field: 'consecutive_days', operator: 'gte', value: 7 },
    reward: 100,
    badge: 'warrior'
  },
  'monthly_champion': {
    name: 'Monthly Champion',
    description: 'Active for 30 consecutive days',
    category: 'milestone',
    condition: { field: 'consecutive_days', operator: 'gte', value: 30 },
    reward: 1000,
    badge: 'champion'
  },

  // TXC achievements
  'txc_collector': {
    name: 'TXC Collector',
    description: 'Earn 1,000 TXC tokens',
    category: 'txc',
    condition: { field: 'total_txc_earned', operator: 'gte', value: 1000 },
    reward: 200,
    badge: 'collector'
  },
  'txc_millionaire': {
    name: 'TXC Millionaire',
    description: 'Earn 10,000 TXC tokens',
    category: 'txc',
    condition: { field: 'total_txc_earned', operator: 'gte', value: 10000 },
    reward: 2000,
    badge: 'millionaire'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, action, achievementData } = await req.json();

    // Validate session for user-specific actions
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
    } else if (achievementData?.userId) {
      userId = achievementData.userId;
    }

    switch (action) {
      case 'check_achievements': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's current stats
        const userStats = await getUserStats(supabase, userId);
        
        // Get user's existing achievements
        const { data: existingAchievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_key')
          .eq('user_id', userId);

        if (achievementsError) {
          console.error('Existing achievements error:', achievementsError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get existing achievements' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const earnedAchievements = new Set(existingAchievements.map(a => a.achievement_key));
        const newAchievements = [];

        // Check each achievement
        for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
          if (earnedAchievements.has(key)) continue;

          const { field, operator, value } = achievement.condition;
          const userValue = userStats[field] || 0;

          let conditionMet = false;
          switch (operator) {
            case 'gte':
              conditionMet = userValue >= value;
              break;
            case 'lte':
              conditionMet = userValue <= value;
              break;
            case 'eq':
              conditionMet = userValue === value;
              break;
          }

          if (conditionMet) {
            // Award achievement
            const { data: newAchievement, error: achievementError } = await supabase
              .from('user_achievements')
              .insert({
                user_id: userId,
                achievement_key: key,
                achievement_name: achievement.name,
                achievement_description: achievement.description,
                category: achievement.category,
                badge: achievement.badge,
                reward_amount: achievement.reward,
                earned_at: new Date().toISOString()
              })
              .select()
              .single();

            if (achievementError) {
              console.error('Achievement creation error:', achievementError);
              continue;
            }

            // Award TXC reward
            if (achievement.reward > 0) {
              await supabase.functions.invoke('activity-reward-engine', {
                body: {
                  activityData: {
                    userId,
                    activityType: 'achievement_unlock',
                    customAmount: achievement.reward,
                    metadata: { achievementKey: key, achievementName: achievement.name }
                  },
                  action: 'process_activity'
                }
              });
            }

            newAchievements.push(newAchievement);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            newAchievements,
            totalNewAchievements: newAchievements.length,
            totalRewardEarned: newAchievements.reduce((sum, a) => sum + a.reward_amount, 0)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_user_achievements': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's achievements
        const { data: userAchievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (achievementsError) {
          console.error('User achievements error:', achievementsError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get user achievements' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user stats for progress tracking
        const userStats = await getUserStats(supabase, userId);
        
        // Calculate progress for unearned achievements
        const earnedKeys = new Set(userAchievements.map(a => a.achievement_key));
        const availableAchievements = [];

        for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
          if (earnedKeys.has(key)) continue;

          const { field, operator, value } = achievement.condition;
          const userValue = userStats[field] || 0;
          
          let progress = 0;
          if (operator === 'gte') {
            progress = Math.min(100, (userValue / value) * 100);
          }

          availableAchievements.push({
            key,
            ...achievement,
            progress: Math.round(progress),
            currentValue: userValue,
            targetValue: value
          });
        }

        const achievementStats = {
          totalEarned: userAchievements.length,
          totalAvailable: Object.keys(ACHIEVEMENTS).length,
          totalRewards: userAchievements.reduce((sum, a) => sum + a.reward_amount, 0),
          categoriesCompleted: new Set(userAchievements.map(a => a.category)).size,
          recentAchievements: userAchievements.slice(0, 5)
        };

        return new Response(
          JSON.stringify({
            success: true,
            userAchievements: userAchievements || [],
            availableAchievements,
            stats: achievementStats
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_achievement_leaderboard': {
        // Get top achievers for motivation
        const { category } = achievementData || {};

        let query = supabase
          .from('user_achievements')
          .select('user_id, profiles(full_name, profile_picture_url)');

        if (category) {
          query = query.eq('category', category);
        }

        const { data: leaderboard, error: leaderboardError } = await query
          .order('count', { ascending: false })
          .limit(20);

        if (leaderboardError) {
          console.error('Achievement leaderboard error:', leaderboardError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get leaderboard' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            leaderboard: leaderboard || [],
            category: category || 'all'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_user_stat': {
        // Update a specific user stat that may trigger achievements
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { statName, increment = 1, setValue } = achievementData;

        const updateData: any = { user_id: userId };
        
        if (setValue !== undefined) {
          updateData[statName] = setValue;
        } else {
          // For increments, we'll use the database function to handle atomic updates
          const { data: currentStats } = await supabase
            .from('user_achievement_stats')
            .select(statName)
            .eq('user_id', userId)
            .single();
          
          updateData[statName] = (currentStats?.[statName] || 0) + increment;
        }

        updateData.updated_at = new Date().toISOString();

        const { error: updateError } = await supabase
          .from('user_achievement_stats')
          .upsert(updateData);

        if (updateError) {
          console.error('User stat update error:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update user stat' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check for new achievements after stat update
        const { data: checkResult } = await supabase.functions.invoke('achievement-tracker', {
          body: {
            action: 'check_achievements',
            achievementData: { userId }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            statUpdated: statName,
            newAchievements: checkResult?.newAchievements || []
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
    console.error('Achievement tracker error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getUserStats(supabase: any, userId: string): Promise<any> {
  // Get various user statistics for achievement checking
  const [
    profileStats,
    jobStats,
    networkStats,
    txcStats,
    extensionStats
  ] = await Promise.all([
    getProfileStats(supabase, userId),
    getJobStats(supabase, userId),
    getNetworkStats(supabase, userId),
    getTXCStats(supabase, userId),
    getExtensionStats(supabase, userId)
  ]);

  return {
    ...profileStats,
    ...jobStats,
    ...networkStats,
    ...txcStats,
    ...extensionStats
  };
}

async function getProfileStats(supabase: any, userId: string): Promise<any> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) return {};

  const completionFields = ['full_name', 'title', 'about', 'location', 'skills', 'experience'];
  const completedFields = completionFields.filter(field => profile[field] && profile[field].length > 0);
  
  const linkedPlatforms = [
    profile.linkedin_url,
    profile.twitter_url,
    profile.instagram_url,
    profile.github_url
  ].filter(Boolean);

  return {
    profile_completion: Math.round((completedFields.length / completionFields.length) * 100),
    linked_platforms: linkedPlatforms.length,
    skills_count: profile.skills?.length || 0
  };
}

async function getJobStats(supabase: any, userId: string): Promise<any> {
  const { data: applications } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', userId);

  const { data: interviewPreps } = await supabase
    .from('ai_coach_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('session_type', 'interview_prep');

  return {
    job_applications: applications?.length || 0,
    interview_preps: interviewPreps?.length || 0
  };
}

async function getNetworkStats(supabase: any, userId: string): Promise<any> {
  const { data: connections } = await supabase
    .from('connections')
    .select('id')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted');

  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);

  return {
    connections: connections?.length || 0,
    content_shares: posts?.length || 0
  };
}

async function getTXCStats(supabase: any, userId: string): Promise<any> {
  const { data: txcStats } = await supabase
    .from('user_txc_stats')
    .select('total_earned')
    .eq('user_id', userId)
    .single();

  return {
    total_txc_earned: txcStats?.total_earned || 0
  };
}

async function getExtensionStats(supabase: any, userId: string): Promise<any> {
  const { data: extensionLogs } = await supabase
    .from('extension_api_logs')
    .select('id')
    .eq('user_id', userId);

  const { data: autoApplies } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', userId)
    .eq('application_method', 'auto_apply');

  return {
    extension_usage: extensionLogs?.length || 0,
    auto_applies: autoApplies?.length || 0
  };
}