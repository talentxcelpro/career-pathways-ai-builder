import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Notification trigger system for automated notifications
const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { trigger_type, data } = await req.json();
    
    console.log('Processing notification trigger:', trigger_type);

    switch (trigger_type) {
      case 'user_registration':
        await handleUserRegistration(data, supabase);
        break;
        
      case 'profile_incomplete':
        await handleProfileIncomplete(data, supabase);
        break;
        
      case 'job_application_submitted':
        await handleJobApplication(data, supabase);
        break;
        
      case 'perfect_job_match':
        await handleJobMatch(data, supabase);
        break;
        
      case 'connection_request':
        await handleConnectionRequest(data, supabase);
        break;
        
      case 'skill_assessment_completed':
        await handleSkillAssessment(data, supabase);
        break;
        
      case 'career_milestone':
        await handleCareerMilestone(data, supabase);
        break;
        
      case 'daily_engagement_check':
        await handleDailyEngagementCheck(supabase);
        break;
        
      case 'weekly_digest':
        await handleWeeklyDigest(supabase);
        break;
        
      default:
        console.log('Unknown trigger type:', trigger_type);
        return new Response(
          JSON.stringify({ error: 'Unknown trigger type' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Trigger processed successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error processing notification trigger:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// Handler functions for different triggers
async function handleUserRegistration(data: any, supabase: any) {
  const { user_id, user_email, user_name } = data;
  
  // Send welcome notification immediately
  await sendComprehensiveNotification(supabase, 'welcome', {
    name: user_name
  }, [user_id]);
  
  // Schedule profile completion reminder for 1 hour later
  setTimeout(async () => {
    await sendComprehensiveNotification(supabase, 'profile_completion_reminder', {
      name: user_name
    }, [user_id]);
  }, 60 * 60 * 1000); // 1 hour
}

async function handleProfileIncomplete(data: any, supabase: any) {
  const { user_id, completion_percentage } = data;
  
  if (completion_percentage < 50) {
    await sendComprehensiveNotification(supabase, 'profile_completion_reminder', {
      completion: completion_percentage
    }, [user_id]);
  }
}

async function handleJobApplication(data: any, supabase: any) {
  const { user_id, job_id, job_title, company_name } = data;
  
  // Send confirmation notification
  await sendComprehensiveNotification(supabase, 'application_status_update', {
    job_title,
    company_name,
    status: 'submitted'
  }, [user_id]);
  
  // Schedule follow-up reminders
  scheduleFollowUpNotifications(supabase, user_id, job_id, job_title);
}

async function handleJobMatch(data: any, supabase: any) {
  const { user_id, job_id, job_title, match_score } = data;
  
  if (match_score >= 85) {
    await sendComprehensiveNotification(supabase, 'perfect_job_match', {
      job_title,
      job_id,
      match_score
    }, [user_id]);
  }
}

async function handleConnectionRequest(data: any, supabase: any) {
  const { recipient_id, requester_id, requester_name } = data;
  
  await sendComprehensiveNotification(supabase, 'connection_request', {
    sender_name: requester_name,
    sender_id: requester_id
  }, [recipient_id]);
}

async function handleSkillAssessment(data: any, supabase: any) {
  const { user_id, skill_name, score, improvement_suggestions } = data;
  
  await sendComprehensiveNotification(supabase, 'skill_assessment_completed', {
    skill: skill_name,
    score,
    suggestions: improvement_suggestions
  }, [user_id]);
}

async function handleCareerMilestone(data: any, supabase: any) {
  const { user_id, milestone_type, milestone_value } = data;
  
  await sendComprehensiveNotification(supabase, 'career_milestone_achieved', {
    milestone: `${milestone_type}: ${milestone_value}`
  }, [user_id]);
}

async function handleDailyEngagementCheck(supabase: any) {
  console.log('Running daily engagement check...');
  
  // Get users who haven't been active in the last 3 days
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: inactiveUsers, error } = await supabase
    .from('profiles')
    .select('id, full_name, last_activity_at')
    .lt('last_activity_at', threeDaysAgo)
    .limit(100);
  
  if (error) {
    console.error('Error fetching inactive users:', error);
    return;
  }
  
  for (const user of inactiveUsers) {
    await sendComprehensiveNotification(supabase, 'engagement_reminder', {
      name: user.full_name
    }, [user.id]);
  }
  
  console.log(`Sent engagement reminders to ${inactiveUsers.length} users`);
}

async function handleWeeklyDigest(supabase: any) {
  console.log('Running weekly digest...');
  
  // Get all active users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_active', true)
    .limit(1000);
  
  if (error) {
    console.error('Error fetching users for digest:', error);
    return;
  }
  
  for (const user of users) {
    // Get user's weekly stats
    const weeklyStats = await getUserWeeklyStats(supabase, user.id);
    
    await sendComprehensiveNotification(supabase, 'weekly_digest', {
      name: user.full_name,
      stats: weeklyStats
    }, [user.id]);
  }
  
  console.log(`Sent weekly digest to ${users.length} users`);
}

async function getUserWeeklyStats(supabase: any, userId: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Get various stats for the user
  const [jobApplications, profileViews, connections, achievements] = await Promise.all([
    supabase.from('job_applications').select('count').eq('user_id', userId).gte('created_at', oneWeekAgo),
    supabase.from('profile_views').select('count').eq('viewed_user_id', userId).gte('created_at', oneWeekAgo),
    supabase.from('connections').select('count').eq('requester_id', userId).gte('created_at', oneWeekAgo),
    supabase.from('user_achievements').select('count').eq('user_id', userId).gte('created_at', oneWeekAgo)
  ]);
  
  return {
    applications: jobApplications.count || 0,
    profileViews: profileViews.count || 0,
    newConnections: connections.count || 0,
    achievements: achievements.count || 0
  };
}

async function scheduleFollowUpNotifications(supabase: any, userId: string, jobId: string, jobTitle: string) {
  // Schedule reminder in 7 days if no response
  const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from('scheduled_notifications')
    .insert({
      user_id: userId,
      notification_type: 'application_follow_up',
      scheduled_for: followUpDate.toISOString(),
      data: { job_id: jobId, job_title: jobTitle },
      is_sent: false
    });
  
  if (error) {
    console.error('Error scheduling follow-up notification:', error);
  }
}

async function sendComprehensiveNotification(
  supabase: any, 
  type: string, 
  data: Record<string, any>, 
  targetUsers: string[]
) {
  try {
    // Call the comprehensive notification function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-comprehensive-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        template: getDefaultTemplate(type),
        data,
        target_users: targetUsers
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send comprehensive notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending comprehensive notification:', error);
  }
}

function getDefaultTemplate(type: string) {
  // Return default templates for different notification types
  const templates: Record<string, any> = {
    welcome: {
      type: 'welcome',
      category: 'system_updates',
      title: 'Welcome to TalentXcel! 🎉',
      message: 'Welcome {{name}}! Start your career journey with us.',
      priority: 'medium',
      channels: ['push', 'email', 'in_app'],
      schedule: { immediate: true }
    },
    profile_completion_reminder: {
      type: 'profile_completion_reminder',
      category: 'career_growth',
      title: 'Complete Your Profile',
      message: 'Hi {{name}}! Complete your profile to unlock better opportunities.',
      priority: 'medium',
      channels: ['push', 'in_app'],
      schedule: { delay: 60, optimal_time: true }
    },
    // Add more templates as needed
  };
  
  return templates[type] || templates.welcome;
}

serve(handler);