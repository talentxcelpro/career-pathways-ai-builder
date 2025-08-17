import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI Agent Scheduler Starting ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required environment variables',
        env: {
          SUPABASE_URL: !!supabaseUrl,
          SUPABASE_SERVICE_KEY: !!supabaseServiceKey
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get active agents
    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: `Database error: ${error.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${agents?.length || 0} active agents`);
    
    // Create simple test tasks for each agent
    let tasksCreated = 0;
    for (const agent of agents || []) {
      const { error: taskError } = await supabase
        .from('agent_tasks')
        .insert({
          agent_id: agent.id,
          source: 'scheduler',
          action: 'test_task',
          payload: { message: 'Test task from scheduler' },
          status: 'pending'
        });
      
      if (!taskError) {
        tasksCreated++;
      } else {
        console.error(`Failed to create task for agent ${agent.handle}:`, taskError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scheduler completed successfully`,
      agentsFound: agents?.length || 0,
      tasksCreated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scheduler error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});