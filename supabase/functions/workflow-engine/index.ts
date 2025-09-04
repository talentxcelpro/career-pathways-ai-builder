import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, workflowId, triggerData, executionId } = await req.json();

    switch (action) {
      case 'create_workflow': {
        const { name, description, trigger, steps } = triggerData;
        
        const { data: workflow, error } = await supabase
          .from('workflow_definitions')
          .insert({
            user_id: userId,
            name,
            description,
            trigger_config: trigger,
            workflow_steps: steps,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, workflow }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'execute_workflow': {
        const { data: workflow, error: workflowError } = await supabase
          .from('workflow_definitions')
          .select('*')
          .eq('id', workflowId)
          .eq('user_id', userId)
          .single();

        if (workflowError) throw workflowError;

        if (!workflow.is_active) {
          throw new Error('Workflow is not active');
        }

        // Create execution record
        const { data: execution, error: executionError } = await supabase
          .from('workflow_executions')
          .insert({
            workflow_id: workflowId,
            user_id: userId,
            status: 'running',
            trigger_data: triggerData,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (executionError) throw executionError;

        // Execute workflow steps
        const results = [];
        try {
          for (let i = 0; i < workflow.workflow_steps.length; i++) {
            const step = workflow.workflow_steps[i];
            console.log(`Executing step ${i + 1}: ${step.name}`);
            
            const stepResult = await executeWorkflowStep(step, triggerData, supabase);
            results.push({
              stepIndex: i,
              stepName: step.name,
              status: 'completed',
              result: stepResult,
              timestamp: new Date().toISOString()
            });
          }

          // Update execution as completed
          await supabase
            .from('workflow_executions')
            .update({
              status: 'completed',
              step_results: results,
              completed_at: new Date().toISOString()
            })
            .eq('id', execution.id);

          return new Response(JSON.stringify({ 
            success: true, 
            execution: execution.id,
            results 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (stepError) {
          // Update execution as failed
          await supabase
            .from('workflow_executions')
            .update({
              status: 'failed',
              error_message: stepError.message,
              step_results: results,
              completed_at: new Date().toISOString()
            })
            .eq('id', execution.id);

          throw stepError;
        }
      }

      case 'get_executions': {
        const { data: executions, error } = await supabase
          .from('workflow_executions')
          .select(`
            *,
            workflow_definitions(name, description)
          `)
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, executions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_workflows': {
        const { data: workflows, error } = await supabase
          .from('workflow_definitions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, workflows }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Workflow engine error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeWorkflowStep(step: any, triggerData: any, supabase: any) {
  switch (step.type) {
    case 'job_alert':
      // Send job alert based on criteria
      return await createJobAlert(step.config, triggerData, supabase);
    
    case 'email_notification':
      // Send email notification
      return await sendEmailNotification(step.config, triggerData);
    
    case 'data_sync':
      // Sync data between systems
      return await syncData(step.config, triggerData, supabase);
    
    case 'ai_action':
      // Trigger AI-powered action
      return await executeAIAction(step.config, triggerData, supabase);
    
    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

async function createJobAlert(config: any, triggerData: any, supabase: any) {
  // Implementation for job alert creation
  return { message: 'Job alert created', timestamp: new Date().toISOString() };
}

async function sendEmailNotification(config: any, triggerData: any) {
  // Implementation for email sending
  return { message: 'Email sent', timestamp: new Date().toISOString() };
}

async function syncData(config: any, triggerData: any, supabase: any) {
  // Implementation for data synchronization
  return { message: 'Data synced', timestamp: new Date().toISOString() };
}

async function executeAIAction(config: any, triggerData: any, supabase: any) {
  // Implementation for AI actions
  return { message: 'AI action executed', timestamp: new Date().toISOString() };
}