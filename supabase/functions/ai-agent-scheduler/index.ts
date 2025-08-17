import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_SERVICE_KEY: !!supabaseServiceKey
  });
}

const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceKey!
);

const FREQ_TO_MINUTES: Record<string, number> = { 
  daily: 1440, 
  weekly: 10080, 
  'as_needed': 0 
};

async function emitEvent(topic: string, origin: string, ref_task: string | null, data: any) {
  return await supabaseAdmin.from('agent_events').insert({
    topic,
    origin,
    ref_task,
    data
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting agent scheduler...');
    
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Find agents that are due based on last event of type 'scheduler.ran'
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from('ai_agents')
      .select('*')
      .neq('status', 'paused');

    if (agentsError) {
      console.error('Error fetching agents:', agentsError);
      throw agentsError;
    }

    console.log(`Found ${agents?.length || 0} active agents`);

    for (const agent of agents || []) {
      const freqMin = FREQ_TO_MINUTES[agent.frequency] ?? 1440;
      if (freqMin === 0) continue; // as_needed -> skip

      // Check last run
      const { data: lastRun } = await supabaseAdmin
        .from('agent_events')
        .select('created_at')
        .eq('origin', agent.handle)
        .eq('topic', 'scheduler.ran')
        .order('created_at', { ascending: false })
        .limit(1);

      const due = !lastRun?.length || 
        (Date.now() - new Date(lastRun[0].created_at).getTime()) / 60000 > freqMin;

      if (!due) {
        console.log(`Agent ${agent.handle} not due yet`);
        continue;
      }

      // Enqueue default tasks per agent role (using exact role names from database)
      const defaults: Record<string, any[]> = {
        'Admin Bot': [{ 
          kind: 'platform_announcement', 
          payload: { message: 'Daily system health check completed' } 
        }],
        'Community Manager': [{ 
          kind: 'post_community', 
          payload: { title: 'Welcome to TalentXcel Community', url: 'https://talentxcel.in' } 
        }],
        'Application Support Specialist': [{ 
          kind: 'support_reply', 
          payload: { issue: 'Login assistance needed' } 
        }],
        'Career Coach (Pro)': [{ 
          kind: 'career_advice', 
          payload: { roleOrDomain: 'Software Development' } 
        }],
        'Mentorship Coordinator': [{ 
          kind: 'mentor_match', 
          payload: { topic: 'Career Transition' } 
        }],
        'Learning Path Assistant': [{ 
          kind: 'learning_path', 
          payload: { skillTarget: 'Data Science', audience: 'Freshers' } 
        }],
        'Job Matching AI': [{ 
          kind: 'match_jobs', 
          payload: { skills: 'React,Node,SQL', prefs: 'Hybrid', region: 'India' } 
        }],
        'Content Creator': [{ 
          kind: 'post_community', 
          payload: { title: 'TalentXcel Career Tips', url: 'https://talentxcel.in/career' } 
        }],
        'Upskilling Advisor': [{ 
          kind: 'learning_path', 
          payload: { skillTarget: 'AI/ML Basics', audience: 'Working Professionals' } 
        }],
        'Customer Service Representative': [{ 
          kind: 'support_reply', 
          payload: { issue: 'Account access support' } 
        }],
      };

      const taskList = defaults[agent.role] ?? [];
      
      for (const task of taskList) {
        const { error: taskError } = await supabaseAdmin
          .from('agent_tasks')
          .insert({
            agent_id: agent.id,
            kind: task.kind,
            payload: task.payload,
            priority: 5,
            status: 'pending'
          });

        if (taskError) {
          console.error(`Error creating task for agent ${agent.handle}:`, taskError);
        }
      }

      await emitEvent('scheduler.ran', agent.handle, null, { count: taskList.length });
      console.log(`Scheduled ${taskList.length} tasks for agent ${agent.handle}`);
    }

    return new Response('Scheduler completed successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(`Scheduler failed: ${error.message}`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  }
});