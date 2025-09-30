import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Simulate system health monitoring
    // In a real implementation, you would check actual system metrics
    
    // Check recent processing performance
    const { data: recentFiles, error: filesError } = await supabaseClient
      .from('cv_files')
      .select('parsing_status, created_at, parsed_at')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .limit(1000);

    if (filesError) throw filesError;

    const recentCount = recentFiles?.length || 0;
    const successCount = recentFiles?.filter(f => f.parsing_status === 'completed').length || 0;
    const errorCount = recentFiles?.filter(f => f.parsing_status === 'error').length || 0;
    const processingCount = recentFiles?.filter(f => f.parsing_status === 'processing').length || 0;

    // Calculate error rate
    const errorRate = recentCount > 0 ? (errorCount / recentCount) * 100 : 0;

    // Calculate processing speed (files per minute)
    const processingSpeed = recentCount > 0 ? Math.round(successCount) : 0;

    // Determine overall health status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    
    if (errorRate > 10) {
      status = 'error';
    } else if (errorRate > 5 || processingCount > 100) {
      status = 'warning';
    }

    // Simulate CPU and memory usage (replace with actual metrics in production)
    const cpuUsage = Math.min(95, 20 + (processingCount * 0.5) + (errorRate * 2));
    const memoryUsage = Math.min(90, 30 + (recentCount * 0.1));
    
    const healthData = {
      status,
      cpu_usage: Math.round(cpuUsage),
      memory_usage: Math.round(memoryUsage),
      queue_depth: processingCount,
      error_rate: Math.round(errorRate * 100) / 100,
      processing_speed: processingSpeed,
      last_updated: new Date().toISOString()
    };

    console.log('System health check:', healthData);

    return new Response(JSON.stringify(healthData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting system health:', error);
    
    // Return degraded status on error
    return new Response(JSON.stringify({
      status: 'error',
      cpu_usage: 0,
      memory_usage: 0,
      queue_depth: 0,
      error_rate: 100,
      processing_speed: 0,
      last_updated: new Date().toISOString(),
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});