import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
}

const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceKey!
);

// Agent handles and their trigger conditions
const agentTriggers = {
  'admin-bot': {
    triggers: ['daily_9am', 'new_user_registered', 'system_anomaly'],
    tasks: ['generate_reports', 'onboard_user', 'cleanup_accounts'],
    escalationRules: ['flag_anomalies_to_human']
  },
  'ananya': {
    triggers: ['weekly_monday_10am', 'engagement_drop_20_percent'],
    tasks: ['post_weekly_update', 'send_engagement_reminder', 'reply_to_faqs'],
    escalationRules: ['forward_conflicts_to_human']
  },
  'arjun': {
    triggers: ['new_support_ticket', 'app_error_detected'],
    tasks: ['auto_solve_faqs', 'escalate_technical_bugs', 'send_resolution'],
    escalationRules: ['forward_unsolved_24hrs_to_engineering']
  },
  'ishaan': {
    triggers: ['resume_uploaded', 'career_help_clicked'],
    tasks: ['generate_job_roadmap', 'suggest_mock_interviews', 'give_career_tips'],
    escalationRules: ['forward_human_coach_requests']
  },
  'meera': {
    triggers: ['mentorship_application', 'new_mentor_joined'],
    tasks: ['auto_match_skills', 'send_intro_email'],
    escalationRules: ['send_unmatched_to_admin']
  },
  'nikki': {
    triggers: ['skill_test_failed', 'learning_plan_requested'],
    tasks: ['generate_course_roadmap', 'send_weekly_reminders'],
    escalationRules: ['escalate_stalled_learners_2weeks']
  },
  'raj': {
    triggers: ['new_job_posted', 'user_profile_updated'],
    tasks: ['suggest_job_matches', 'auto_notify_whatsapp_telegram'],
    escalationRules: ['flag_no_matches_to_admin']
  },
  'sana': {
    triggers: ['daily_11am', 'trending_job_topic_detected'],
    tasks: ['auto_create_seo_post', 'create_linkedin_update', 'create_blog_draft'],
    escalationRules: ['send_posts_for_review']
  },
  'shelly': {
    triggers: ['new_support_chat', 'negative_feedback_detected'],
    tasks: ['answer_faqs', 'resolve_simple_queries', 'log_feedback'],
    escalationRules: ['forward_unsatisfied_to_human']
  },
  'zoya': {
    triggers: ['job_rejection_detected', 'skill_gap_detected'],
    tasks: ['recommend_courses', 'offer_mentorship', 'send_reminders'],
    escalationRules: ['forward_inactive_learners_to_nikki']
  }
};

// Event detection and routing
async function detectAndRouteEvents() {
  const requestId = crypto.randomUUID();
  console.log(`🔄 [${requestId}] Starting event detection and routing`);
  
  const eventResults = [];
  
  try {
    // Check for various event types
    const events = await Promise.all([
      checkTimeBasedTriggers(),
      checkUserActionTriggers(),
      checkSystemEventTriggers(),
      checkEngagementTriggers(),
      checkContentTriggers()
    ]);
    
    const allEvents = events.flat();
    console.log(`📊 [${requestId}] Detected ${allEvents.length} events`);
    
    // Process each event
    for (const event of allEvents) {
      const result = await processEvent(event, requestId);
      eventResults.push(result);
    }
    
    return {
      success: true,
      eventsProcessed: allEvents.length,
      results: eventResults,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`💥 [${requestId}] Error in event detection:`, error);
    return {
      success: false,
      error: error.message,
      eventsProcessed: 0,
      results: eventResults
    };
  }
}

// Check time-based triggers (cron-like)
async function checkTimeBasedTriggers() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const events = [];
  
  // Daily 9 AM trigger for Admin Bot
  if (hour === 9) {
    events.push({
      type: 'time_trigger',
      trigger: 'daily_9am',
      agentHandle: 'admin-bot',
      priority: 'high',
      metadata: { hour, timestamp: now.toISOString() }
    });
  }
  
  // Daily 11 AM trigger for Sana (Content Creator)
  if (hour === 11) {
    events.push({
      type: 'time_trigger',
      trigger: 'daily_11am',
      agentHandle: 'sana',
      priority: 'medium',
      metadata: { hour, timestamp: now.toISOString() }
    });
  }
  
  // Weekly Monday 10 AM trigger for Ananya (Community Manager)
  if (dayOfWeek === 1 && hour === 10) {
    events.push({
      type: 'time_trigger',
      trigger: 'weekly_monday_10am',
      agentHandle: 'ananya',
      priority: 'high',
      metadata: { dayOfWeek, hour, timestamp: now.toISOString() }
    });
  }
  
  return events;
}

// Check user action triggers
async function checkUserActionTriggers() {
  const events = [];
  
  try {
    // Check for new user registrations (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: newUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', fiveMinutesAgo);
    
    if (newUsers && newUsers.length > 0) {
      events.push({
        type: 'user_action',
        trigger: 'new_user_registered',
        agentHandle: 'admin-bot',
        priority: 'high',
        metadata: { newUsers: newUsers.length, users: newUsers }
      });
    }
    
    // Check for resume uploads (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentResumes } = await supabaseAdmin
      .from('user_resumes')
      .select('id, user_id, created_at')
      .gte('created_at', tenMinutesAgo);
    
    if (recentResumes && recentResumes.length > 0) {
      events.push({
        type: 'user_action',
        trigger: 'resume_uploaded',
        agentHandle: 'ishaan',
        priority: 'medium',
        metadata: { uploads: recentResumes.length, resumes: recentResumes }
      });
    }
    
    // Check for new support tickets
    const { data: newTickets } = await supabaseAdmin
      .from('support_tickets')
      .select('id, user_id, priority, created_at')
      .gte('created_at', tenMinutesAgo);
    
    if (newTickets && newTickets.length > 0) {
      events.push({
        type: 'user_action',
        trigger: 'new_support_ticket',
        agentHandle: 'arjun',
        priority: 'high',
        metadata: { tickets: newTickets.length, ticketData: newTickets }
      });
    }
    
  } catch (error) {
    console.error('Error checking user action triggers:', error);
  }
  
  return events;
}

// Check system event triggers
async function checkSystemEventTriggers() {
  const events = [];
  
  try {
    // Check for app errors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: errorLogs } = await supabaseAdmin
      .from('error_logs')
      .select('id, error_type, severity, created_at')
      .gte('created_at', fiveMinutesAgo)
      .eq('severity', 'high');
    
    if (errorLogs && errorLogs.length > 0) {
      events.push({
        type: 'system_event',
        trigger: 'app_error_detected',
        agentHandle: 'arjun',
        priority: 'critical',
        metadata: { errors: errorLogs.length, errorData: errorLogs }
      });
    }
    
    // Check for new job postings (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: newJobs } = await supabaseAdmin
      .from('job_listings')
      .select('id, company_id, title, created_at')
      .gte('created_at', thirtyMinutesAgo);
    
    if (newJobs && newJobs.length > 0) {
      events.push({
        type: 'system_event',
        trigger: 'new_job_posted',
        agentHandle: 'raj',
        priority: 'medium',
        metadata: { jobs: newJobs.length, jobData: newJobs }
      });
    }
    
  } catch (error) {
    console.error('Error checking system event triggers:', error);
  }
  
  return events;
}

// Check engagement triggers
async function checkEngagementTriggers() {
  const events = [];
  
  try {
    // Check engagement metrics (simplified - in real implementation, this would be more sophisticated)
    const { data: engagementData } = await supabaseAdmin
      .from('engagement_metrics')
      .select('metric_value, metric_type, created_at')
      .eq('metric_type', 'daily_active_users')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (engagementData && engagementData.length >= 2) {
      const current = engagementData[0].metric_value;
      const previous = engagementData[1].metric_value;
      const dropPercentage = ((previous - current) / previous) * 100;
      
      if (dropPercentage >= 20) {
        events.push({
          type: 'engagement_trigger',
          trigger: 'engagement_drop_20_percent',
          agentHandle: 'ananya',
          priority: 'high',
          metadata: { dropPercentage, current, previous }
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking engagement triggers:', error);
  }
  
  return events;
}

// Check content triggers
async function checkContentTriggers() {
  const events = [];
  
  try {
    // Check for trending topics (simplified implementation)
    const { data: trendingTopics } = await supabaseAdmin
      .from('trending_topics')
      .select('topic, score, created_at')
      .gte('score', 80)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (trendingTopics && trendingTopics.length > 0) {
      events.push({
        type: 'content_trigger',
        trigger: 'trending_job_topic_detected',
        agentHandle: 'sana',
        priority: 'medium',
        metadata: { topics: trendingTopics }
      });
    }
    
  } catch (error) {
    console.error('Error checking content triggers:', error);
  }
  
  return events;
}

// Process individual event
async function processEvent(event: any, requestId: string) {
  try {
    console.log(`🎯 [${requestId}] Processing event: ${event.trigger} for agent: ${event.agentHandle}`);
    
    // Get agent details
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('*')
      .eq('handle', event.agentHandle)
      .single();
    
    if (!agent) {
      throw new Error(`Agent ${event.agentHandle} not found`);
    }
    
    // Create task for the agent
    const taskData = {
      agent_id: agent.id,
      source: 'automation_trigger',
      action: event.trigger,
      status: 'pending',
      payload: {
        event: event,
        triggeredAt: new Date().toISOString(),
        requestId: requestId
      },
      scheduled_at: new Date().toISOString(),
      attempts: 0
    };
    
    const { data: task, error: taskError } = await supabaseAdmin
      .from('agent_tasks')
      .insert(taskData)
      .select()
      .single();
    
    if (taskError) throw taskError;
    
    // Log the event
    await supabaseAdmin
      .from('agent_events')
      .insert({
        topic: `trigger.${event.trigger}`,
        origin: 'automation-system',
        ref_task: task.id,
        data: {
          agent: event.agentHandle,
          event: event,
          priority: event.priority,
          taskId: task.id
        }
      });
    
    // Execute the task immediately for high-priority events
    if (event.priority === 'critical' || event.priority === 'high') {
      await executeAgentTask(task.id, requestId);
    }
    
    return {
      success: true,
      agentHandle: event.agentHandle,
      trigger: event.trigger,
      taskId: task.id,
      priority: event.priority,
      executedImmediately: event.priority === 'critical' || event.priority === 'high'
    };
    
  } catch (error) {
    console.error(`💥 [${requestId}] Error processing event:`, error);
    return {
      success: false,
      agentHandle: event.agentHandle,
      trigger: event.trigger,
      error: error.message
    };
  }
}

// Execute agent task
async function executeAgentTask(taskId: string, requestId: string) {
  try {
    console.log(`⚡ [${requestId}] Executing task: ${taskId}`);
    
    // Update task status to running
    await supabaseAdmin
      .from('agent_tasks')
      .update({ 
        status: 'running', 
        started_at: new Date().toISOString() 
      })
      .eq('id', taskId);
    
    // Get task details
    const { data: task } = await supabaseAdmin
      .from('agent_tasks')
      .select('*, ai_agents(*)')
      .eq('id', taskId)
      .single();
    
    if (!task) throw new Error('Task not found');
    
    // Call the AI agent function to execute the task
    const { data: result, error: executeError } = await supabaseAdmin.functions.invoke('ai-agent', {
      body: {
        module: 'automation',
        task: task.action,
        input: task.payload,
        userId: 'system',
        prompt: `Execute ${task.action} for agent ${task.ai_agents.handle}`
      }
    });
    
    if (executeError) throw executeError;
    
    // Update task status to completed
    await supabaseAdmin
      .from('agent_tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        output: result
      })
      .eq('id', taskId);
    
    console.log(`✅ [${requestId}] Task ${taskId} completed successfully`);
    
    return result;
    
  } catch (error) {
    console.error(`💥 [${requestId}] Error executing task ${taskId}:`, error);
    
    // Update task status to failed
    await supabaseAdmin
      .from('agent_tasks')
      .update({ 
        status: 'failed',
        error: (error as any)?.message || String(error),
        attempts: 1
      })
      .eq('id', taskId);
    
    throw error;
  }
}

// Update KPIs and metrics
async function updateKPIs(agentHandle: string, taskResult: any, requestId: string) {
  try {
    const { data: agent } = await supabaseAdmin
      .from('ai_agents')
      .select('id, key_kpi')
      .eq('handle', agentHandle)
      .single();
    
    if (!agent) return;
    
    // Insert performance metric
    await supabaseAdmin
      .from('agent_metrics')
      .insert({
        agent_id: agent.id,
        metric_name: agent.key_kpi || 'task_completion',
        metric_value: taskResult.success ? 1 : 0,
        metadata: {
          taskResult,
          timestamp: new Date().toISOString(),
          requestId
        }
      });
    
    console.log(`📊 [${requestId}] KPIs updated for agent: ${agentHandle}`);
    
  } catch (error) {
    console.error(`💥 [${requestId}] Error updating KPIs:`, error);
  }
}

// Handle escalations
async function handleEscalation(agentHandle: string, event: any, reason: string, requestId: string) {
  try {
    console.log(`🚨 [${requestId}] Escalation triggered for ${agentHandle}: ${reason}`);
    
    const escalationRules = agentTriggers[agentHandle]?.escalationRules || [];
    
    // Create escalation task for Admin Bot or Human
    const escalationTask = {
      agent_id: 'admin-bot', // Always escalate to admin bot first
      source: 'escalation',
      action: 'handle_escalation',
      status: 'pending',
      payload: {
        originalAgent: agentHandle,
        originalEvent: event,
        escalationReason: reason,
        escalationRules,
        timestamp: new Date().toISOString()
      },
      scheduled_at: new Date().toISOString(),
      attempts: 0
    };
    
    await supabaseAdmin
      .from('agent_tasks')
      .insert(escalationTask);
    
    // Log escalation event
    await supabaseAdmin
      .from('agent_events')
      .insert({
        topic: 'escalation.triggered',
        origin: 'automation-system',
        ref_task: null,
        data: {
          originalAgent: agentHandle,
          reason,
          escalationRules,
          requestId
        }
      });
    
  } catch (error) {
    console.error(`💥 [${requestId}] Error handling escalation:`, error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const action = url.searchParams.get('action') || body.action || 'detect_and_route';

    switch (action) {
      case 'detect_and_route': {
        const result = await detectAndRouteEvents();
        return new Response(JSON.stringify(result, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'manual_trigger': {
        const { agentHandle, trigger, metadata } = body || {};
        if (!agentHandle || !trigger) {
          return new Response(JSON.stringify({ error: 'agentHandle and trigger are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const event = {
          type: 'manual_trigger',
          trigger,
          agentHandle,
          priority: 'high',
          metadata: { ...metadata, manual: true }
        };

        const requestId = crypto.randomUUID();
        const result = await processEvent(event, requestId);

        return new Response(JSON.stringify(result, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'health_check': {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          agentTriggers: Object.keys(agentTriggers),
          version: '1.0.1'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default: {
        return new Response('Invalid action. Available: detect_and_route, manual_trigger, health_check', {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        });
      }
    }

  } catch (error) {
    console.error('Trigger automation error:', error);
    return new Response(JSON.stringify({
      error: (error as any)?.message || String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});