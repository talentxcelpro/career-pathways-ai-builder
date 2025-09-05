import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Behavioral Email Engine processing...');
    
    // Process different types of behavioral triggers
    await processInactivityTriggers();
    await processEngagementTriggers();
    await processConversionTriggers();
    await processRecommendationTriggers();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Behavioral email triggers processed successfully',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Behavioral Email Engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processInactivityTriggers() {
  console.log('🔍 Processing inactivity triggers...');
  
  // Find users who haven't logged in for 7 days
  const { data: inactiveUsers, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, last_seen')
    .lt('last_seen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('is_ai_bot', false);

  if (error) {
    console.error('Error fetching inactive users:', error);
    return;
  }

  console.log(`Found ${inactiveUsers?.length || 0} inactive users`);

  for (const user of inactiveUsers || []) {
    // Check if we already sent an inactivity email recently
    const { data: recentEmail } = await supabase
      .from('email_automation_queue')
      .select('id')
      .eq('recipient_email', user.email)
      .eq('trigger_type', 'user_inactivity_7d')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (recentEmail && recentEmail.length > 0) {
      continue; // Skip if already sent recently
    }

    // Get user's job preferences for personalization
    const { data: jobMatches } = await supabase
      .from('ai_job_matches')
      .select('job_id, match_score')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })
      .limit(3);

    await supabase
      .from('email_automation_queue')
      .insert({
        trigger_type: 'user_inactivity_7d',
        recipient_email: user.email,
        recipient_name: user.full_name,
        template_data: {
          user_name: user.full_name,
          days_inactive: Math.floor((Date.now() - new Date(user.last_seen).getTime()) / (1000 * 60 * 60 * 24)),
          job_recommendations: jobMatches || [],
          return_incentive: 'new job matches waiting'
        },
        scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Send in 5 minutes
      });
  }
}

async function processEngagementTriggers() {
  console.log('📊 Processing engagement triggers...');

  // Find highly engaged users (opened 3+ emails in last week)
  const { data: engagedUsers } = await supabase
    .from('user_behavior_events')
    .select('user_id, COUNT(*) as engagement_count')
    .eq('event_type', 'email_open')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .group('user_id')
    .having('COUNT(*)', 'gte', 3);

  for (const user of engagedUsers || []) {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, title')
      .eq('id', user.user_id)
      .single();

    if (!profile) continue;

    // Check if we already sent an engagement reward email
    const { data: recentEmail } = await supabase
      .from('email_automation_queue')
      .select('id')
      .eq('recipient_email', profile.email)
      .eq('trigger_type', 'high_engagement_reward')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (recentEmail && recentEmail.length > 0) continue;

    // Send engagement reward email
    await supabase
      .from('email_automation_queue')
      .insert({
        trigger_type: 'high_engagement_reward',
        recipient_email: profile.email,
        recipient_name: profile.full_name,
        template_data: {
          user_name: profile.full_name,
          engagement_count: user.engagement_count,
          reward_type: 'premium_features_trial',
          title: profile.title
        },
        scheduled_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });
  }
}

async function processConversionTriggers() {
  console.log('🎯 Processing conversion triggers...');

  // Find users who viewed jobs but didn't apply (abandoned conversion)
  const { data: jobViews } = await supabase
    .from('user_behavior_events')
    .select('user_id, event_data')
    .eq('event_type', 'job_view')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  for (const view of jobViews || []) {
    const jobId = view.event_data?.job_id;
    if (!jobId) continue;

    // Check if user applied to this job
    const { data: application } = await supabase
      .from('job_applications')
      .select('id')
      .eq('user_id', view.user_id)
      .eq('job_id', jobId);

    if (application && application.length > 0) continue; // User already applied

    // Get user and job details
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', view.user_id)
      .single();

    const { data: job } = await supabase
      .from('jobs')
      .select('title, company_name, location')
      .eq('id', jobId)
      .single();

    if (!profile || !job) continue;

    // Check if already sent abandon email for this job
    const { data: recentEmail } = await supabase
      .from('email_automation_queue')
      .select('id')
      .eq('recipient_email', profile.email)
      .eq('trigger_type', 'job_application_abandoned')
      .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    if (recentEmail && recentEmail.length > 0) continue;

    await supabase
      .from('email_automation_queue')
      .insert({
        trigger_type: 'job_application_abandoned',
        recipient_email: profile.email,
        recipient_name: profile.full_name,
        template_data: {
          user_name: profile.full_name,
          job_title: job.title,
          company_name: job.company_name,
          job_location: job.location,
          job_id: jobId,
          urgency_message: 'Application deadline approaching'
        },
        scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Send in 30 minutes
      });
  }
}

async function processRecommendationTriggers() {
  console.log('🤖 Processing AI recommendation triggers...');

  // Find users with new job matches that haven't been notified
  const { data: newMatches } = await supabase
    .from('ai_job_matches')
    .select(`
      user_id,
      job_id,
      match_score,
      created_at,
      profiles!ai_job_matches_user_id_fkey(email, full_name),
      jobs!ai_job_matches_job_id_fkey(title, company_name, location)
    `)
    .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Last 2 hours
    .gte('match_score', 0.8); // High match score only

  for (const match of newMatches || []) {
    const profile = (match as any).profiles;
    const job = (match as any).jobs;
    
    if (!profile || !job) continue;

    // Check if already notified about this job
    const { data: recentNotification } = await supabase
      .from('email_automation_queue')
      .select('id')
      .eq('recipient_email', profile.email)
      .eq('trigger_type', 'new_job_match')
      .eq('template_data->job_id', match.job_id);

    if (recentNotification && recentNotification.length > 0) continue;

    await supabase
      .from('email_automation_queue')
      .insert({
        trigger_type: 'new_job_match',
        recipient_email: profile.email,
        recipient_name: profile.full_name,
        template_data: {
          user_name: profile.full_name,
          job_title: job.title,
          company_name: job.company_name,
          job_location: job.location,
          match_score: Math.round(match.match_score * 100),
          job_id: match.job_id,
          urgency: match.match_score > 0.9 ? 'high' : 'medium'
        },
        scheduled_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // Send in 15 minutes
      });
  }

  console.log('✅ Behavioral triggers processing completed');
}