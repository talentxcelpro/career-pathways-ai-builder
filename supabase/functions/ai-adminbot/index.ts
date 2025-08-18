// XHR polyfill removed to prevent Illegal return in Deno runtime
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

async function getSystemHealth() {
  try {
    // Get task status counts
    const { data: taskCounts, error: taskError } = await supabaseAdmin.rpc('count_tasks_by_status');
    
    // Get deadletter tasks
    const { data: deadTasks } = await supabaseAdmin
      .from('agent_tasks')
      .select('id, kind, error, attempts, created_at')
      .eq('status', 'deadletter')
      .order('created_at', { ascending: false })
      .limit(50);

    // Get recent events
    const { data: recentEvents } = await supabaseAdmin
      .from('agent_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get agent status
    const { data: agents } = await supabaseAdmin
      .from('ai_agents')
      .select('handle, display_name, status, frequency, role')
      .order('display_name');

    // Calculate health metrics
    const totalTasks = taskCounts?.reduce((sum: number, item: any) => sum + parseInt(item.cnt), 0) || 0;
    const pendingTasks = taskCounts?.find((item: any) => item.status === 'pending')?.cnt || 0;
    const failedTasks = taskCounts?.find((item: any) => item.status === 'failed')?.cnt || 0;
    const deadletterTasks = taskCounts?.find((item: any) => item.status === 'deadletter')?.cnt || 0;

    const healthScore = totalTasks > 0 ? 
      Math.round(((totalTasks - failedTasks - deadletterTasks) / totalTasks) * 100) : 100;

    return {
      timestamp: new Date().toISOString(),
      healthScore,
      metrics: {
        totalTasks,
        pendingTasks,
        failedTasks,
        deadletterTasks,
        activeAgents: agents?.filter(a => a.status === 'active').length || 0,
        totalAgents: agents?.length || 0
      },
      taskBreakdown: taskCounts || [],
      deadletterTasks: deadTasks || [],
      recentEvents: recentEvents || [],
      agents: agents || [],
      recommendations: generateRecommendations({
        pendingTasks,
        failedTasks,
        deadletterTasks,
        healthScore
      })
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    return {
      timestamp: new Date().toISOString(),
      healthScore: 0,
      error: error.message,
      metrics: {},
      recommendations: ['System health check failed - investigate immediately']
    };
  }
}

function generateRecommendations(metrics: any) {
  const recommendations = [];

  if (metrics.pendingTasks > 100) {
    recommendations.push('High pending task count - consider scaling workers');
  }

  if (metrics.failedTasks > 20) {
    recommendations.push('Multiple task failures detected - check error logs');
  }

  if (metrics.deadletterTasks > 10) {
    recommendations.push('Deadletter tasks accumulating - manual intervention needed');
  }

  if (metrics.healthScore < 80) {
    recommendations.push('System health below threshold - investigate immediately');
  }

  if (metrics.healthScore >= 95) {
    recommendations.push('System operating optimally');
  }

  if (recommendations.length === 0) {
    recommendations.push('System operating normally');
  }

  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AdminBot starting...');
    
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'health';

    switch (action) {
      case 'health': {
        const health = await getSystemHealth();
        return new Response(JSON.stringify(health, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'retry-deadletter': {
        // Retry all deadletter tasks
        const { data: retried, error } = await supabaseAdmin
          .from('agent_tasks')
          .update({
            status: 'pending',
            attempts: 0,
            error: null,
            scheduled_at: new Date().toISOString()
          })
          .eq('status', 'deadletter')
          .select('id');

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({
          action: 'retry-deadletter',
          retriedCount: retried?.length || 0,
          retriedTasks: retried?.map(t => t.id) || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'clear-old-events': {
        // Clear events older than 7 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);

        const { data: deleted, error } = await supabaseAdmin
          .from('agent_events')
          .delete()
          .lt('created_at', cutoff.toISOString())
          .select('id');

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({
          action: 'clear-old-events',
          deletedCount: deleted?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'agent-status': {
        const { data: agents } = await supabaseAdmin
          .from('ai_agents')
          .select(`
            *,
            agent_tasks!inner(status, created_at, attempts)
          `)
          .order('display_name');

        // Aggregate task stats per agent
        const agentStats = agents?.map(agent => {
          const tasks = agent.agent_tasks || [];
          return {
            ...agent,
            taskStats: {
              total: tasks.length,
              pending: tasks.filter((t: any) => t.status === 'pending').length,
              running: tasks.filter((t: any) => t.status === 'running').length,
              completed: tasks.filter((t: any) => t.status === 'completed').length,
              failed: tasks.filter((t: any) => t.status === 'failed').length,
              deadletter: tasks.filter((t: any) => t.status === 'deadletter').length,
            }
          };
        });

        return new Response(JSON.stringify({
          agents: agentStats || [],
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default: {
        return new Response('Invalid action. Available: health, retry-deadletter, clear-old-events, agent-status', {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        });
      }
    }

  } catch (error) {
    console.error('Adminbot error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});