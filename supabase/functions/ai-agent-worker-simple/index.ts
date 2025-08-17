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
    console.log('=== AI Agent Worker Starting ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required environment variables'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get pending tasks
    const { data: tasks, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .limit(5);
    
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

    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending tasks to process',
        tasksProcessed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing ${tasks.length} tasks`);
    
    // Process each task (simplified)
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
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mark as completed
      const { error: updateError } = await supabase
        .from('agent_tasks')
        .update({ 
          status: 'completed', 
          finished_at: new Date().toISOString() 
        })
        .eq('id', task.id);
      
      if (!updateError) {
        tasksProcessed++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Worker completed successfully`,
      tasksFound: tasks.length,
      tasksProcessed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});