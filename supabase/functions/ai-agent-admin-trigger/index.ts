import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI Agent Admin Trigger Starting ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action } = await req.json();
    
    console.log(`Executing action: ${action}`);

    switch (action) {
      case 'trigger_scheduler': {
        // Get active agents and create tasks
        const { data: agents, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('status', 'active');
        
        if (error) {
          console.error('Failed to fetch agents:', error);
          return new Response(JSON.stringify({
            success: false,
            error: `Failed to fetch agents: ${error.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let tasksCreated = 0;
        for (const agent of agents || []) {
          const { error: taskError } = await supabase
            .from('agent_tasks')
          .insert({
              source: 'admin_trigger',
              action: 'scheduled_task',
              payload: { message: 'Task created by admin scheduler', ai_agent_id: agent.id, ai_agent_handle: agent.handle },
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
          message: 'Scheduler triggered successfully',
          agentsFound: agents?.length || 0,
          tasksCreated
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'trigger_worker': {
        // Get pending tasks and process them
        const { data: tasks, error } = await supabase
          .from('agent_tasks')
          .select('*')
          .eq('status', 'pending')
          .limit(5);
        
        if (error) {
          console.error('Failed to fetch tasks:', error);
          return new Response(JSON.stringify({
            success: false,
            error: `Failed to fetch tasks: ${error.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!tasks || tasks.length === 0) {
          return new Response(JSON.stringify({
            success: true,
            message: 'No pending tasks to process',
            tasksProcessed: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let tasksProcessed = 0;
        for (const task of tasks) {
          // Mark as running
          await supabase
            .from('agent_tasks')
            .update({ 
              status: 'running', 
              started_at: new Date().toISOString() 
            })
            .eq('id', task.id);

          // Log start
          await supabase.from('agent_logs').insert({
            task_id: task.id,
            agent_id: task.agent_id,
            message: `Started task: ${task.action || task.kind || 'task'}`,
            level: 'info',
            metadata: {
              action_type: 'task_execution',
              task_action: task.action || task.kind || 'task',
              execution_status: 'started',
              task_source: task.source
            }
          });
          
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Mark as completed
          const { error: updateError } = await supabase
            .from('agent_tasks')
            .update({ 
              status: 'completed', 
              completed_at: new Date().toISOString() 
            })
            .eq('id', task.id);
          
          if (!updateError) {
            tasksProcessed++;
            
            // Log completion
            await supabase.from('agent_logs').insert({
              task_id: task.id,
              agent_id: task.agent_id,
              message: `Completed task: ${task.action || task.kind || 'task'}`,
              level: 'info',
              metadata: {
                action_type: 'task_execution',
                task_action: task.action || task.kind || 'task',
                execution_status: 'completed'
              }
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Worker completed successfully',
          tasksFound: tasks.length,
          tasksProcessed
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'create_test_tasks': {
        // Get active agents
        const { data: agents, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('status', 'active')
          .limit(3);
        
        if (error) {
          console.error('Failed to fetch agents:', error);
          return new Response(JSON.stringify({
            success: false,
            error: `Failed to fetch agents: ${error.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        let tasksCreated = 0;
        for (const agent of agents || []) {
          const { error: taskError } = await supabase
            .from('agent_tasks')
            .insert({
              source: 'admin_test',
              action: 'test_task',
              payload: { message: 'Test task created from admin panel', ai_agent_id: agent.id, ai_agent_handle: agent.handle },
              status: 'pending'
            });
          
          if (!taskError) {
            tasksCreated++;
          } else {
            console.error(`Failed to create test task for agent ${agent.handle}:`, taskError);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Test tasks created successfully',
          tasksCreated
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_system_health': {
        // Get system health data
        const { data: agents, error: agentsError } = await supabase
          .from('ai_agents')
          .select('*');

        const { data: tasks, error: tasksError } = await supabase
          .from('agent_tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        const healthData = {
          agents: {
            total: agents?.length || 0,
            active: agents?.filter(a => a.status === 'active').length || 0,
            error: agentsError?.message || null
          },
          tasks: {
            total: tasks?.length || 0,
            pending: tasks?.filter(t => t.status === 'pending').length || 0,
            running: tasks?.filter(t => t.status === 'running').length || 0,
            completed: tasks?.filter(t => t.status === 'completed').length || 0,
            failed: tasks?.filter(t => t.status === 'failed').length || 0,
            error: tasksError?.message || null
          },
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: true,
          data: healthData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: `Unknown action: ${action}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Admin trigger error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});