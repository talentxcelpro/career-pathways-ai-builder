import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BUILD_VERSION = 'enhanced-agent-logger:2025-08-17T20:50Z';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogEntry {
  task_id?: string;
  agent_id?: string;
  action_type: string;
  description: string;
  metadata?: Record<string, any>;
  level?: 'info' | 'warn' | 'error';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 ' + BUILD_VERSION);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    const body: LogEntry = (() => { 
      try { 
        return rawBody ? JSON.parse(rawBody) : {}; 
      } catch { 
        return {}; 
      } 
    })();

    console.log('📝 Enhanced agent logger request:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.action_type || !body.description) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'action_type and description are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced metadata with tracking information
    const enhancedMetadata = {
      action_type: body.action_type,
      timestamp: new Date().toISOString(),
      source: 'enhanced-agent-logger',
      build_version: BUILD_VERSION,
      ...body.metadata
    };

    // Insert activity log
    const { error: logError } = await supabase
      .from('agent_logs')
      .insert({
        task_id: body.task_id,
        agent_id: body.agent_id,
        message: body.description,
        level: body.level || 'info',
        metadata: enhancedMetadata
      });

    if (logError) {
      console.error('❌ Error inserting agent log:', logError);
      throw logError;
    }

    // Log agent metrics if this is a performance-related action
    if (body.action_type === 'performance_metric' && body.agent_id && body.metadata) {
      const { error: metricsError } = await supabase
        .from('agent_metrics')
        .insert({
          agent_id: body.agent_id,
          metric_name: body.metadata.metric_name || body.action_type,
          metric_value: body.metadata.metric_value || 1,
          metadata: enhancedMetadata
        });

      if (metricsError) {
        console.error('⚠️ Warning: Failed to insert agent metric:', metricsError);
        // Don't fail the request for metrics errors
      }
    }

    // Create agent event for real-time monitoring
    if (body.task_id) {
      const { error: eventError } = await supabase
        .from('agent_events')
        .insert({
          topic: 'agent.activity',
          origin: body.agent_id || 'unknown',
          ref_task: body.task_id,
          data: {
            action_type: body.action_type,
            description: body.description,
            level: body.level,
            metadata: enhancedMetadata
          }
        });

      if (eventError) {
        console.error('⚠️ Warning: Failed to create agent event:', eventError);
        // Don't fail the request for event errors
      }
    }

    console.log('✅ Agent activity logged successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Activity logged successfully',
        action_type: body.action_type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Enhanced agent logger error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        build_version: BUILD_VERSION
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});