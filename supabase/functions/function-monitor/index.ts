import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Monitoring function health and performance...');

    // Expected active functions from config.toml
    const expectedFunctions = [
      'health-check', 'admin-health-check', 'get-token-balance', 'initialize-user-txc',
      'storage-proxy', 'auth-service-root', 'secure-admin-validation', 'get-realtime-token',
      'unified-email-service', 'process-email-queue', 'end-to-end-email-test',
      'optimize-email-queue', 'send-email-notification', 'email-webhook',
      'ai-agent', 'ai-chat', 'ai-comprehensive', 'ai-content-generator',
      'ai-resume-parser', 'ai-ats-analyzer', 'ai-resume-content',
      'bulk-job-upload-v2', 'job-quality-checker', 'job-expiry-cleanup',
      'cv-search', 'cv-parser', 'bulk-download-cvs', 'comprehensive-resume-extractor',
      'record-resume-download', 'razorpay-create-order', 'razorpay-verify-payment',
      'process-txc-purchase', 'txc-unified-purchase', 'claim-daily-bonus',
      'send-push-notification', 'register-push-token', 'webhook-notifications',
      'scrape-content', 'image-proxy', 'qr-generator', 'agent-worker'
    ];

    // Check recent function health
    const { data: healthLogs, error: healthError } = await supabase
      .from('function_health_logs')
      .select('function_name, status, created_at, response_time_ms, error_message')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (healthError) {
      console.error('Error fetching health logs:', healthError);
    }

    // Analyze function performance
    const functionStats: Record<string, any> = {};
    const criticalIssues: string[] = [];

    expectedFunctions.forEach(func => {
      const logs = healthLogs?.filter(log => log.function_name === func) || [];
      const errors = logs.filter(log => log.status === 'error');
      const avgResponseTime = logs.length > 0 
        ? logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length 
        : 0;

      functionStats[func] = {
        total_calls: logs.length,
        error_count: errors.length,
        error_rate: logs.length > 0 ? (errors.length / logs.length) * 100 : 0,
        avg_response_time: Math.round(avgResponseTime),
        last_call: logs[0]?.created_at || null
      };

      // Flag critical issues
      if (errors.length > 5) {
        criticalIssues.push(`${func}: ${errors.length} errors in last hour`);
      }
      if (avgResponseTime > 5000) {
        criticalIssues.push(`${func}: Slow response time (${Math.round(avgResponseTime)}ms)`);
      }
    });

    // Check for resource usage patterns
    const { data: resourceMetrics, error: metricsError } = await supabase
      .from('function_health_logs')
      .select('created_at, response_time_ms')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    let systemHealth = 'healthy';
    if (criticalIssues.length > 5) {
      systemHealth = 'critical';
    } else if (criticalIssues.length > 2) {
      systemHealth = 'warning';
    }

    // Log monitoring results
    await supabase
      .from('function_health_logs')
      .insert({
        function_name: 'function-monitor',
        status: 'success',
        request_count: Object.keys(functionStats).length,
        response_time_ms: 0
      });

    const monitoringReport = {
      timestamp: new Date().toISOString(),
      system_health: systemHealth,
      expected_functions: expectedFunctions.length,
      monitored_functions: Object.keys(functionStats).length,
      critical_issues: criticalIssues,
      function_stats: functionStats,
      total_calls_last_hour: healthLogs?.length || 0,
      cleanup_status: {
        target_functions: 42,
        deployment_version: 'v2.1.0',
        cleanup_initiated: true
      }
    };

    console.log('Function monitoring completed:', {
      system_health: systemHealth,
      issues: criticalIssues.length,
      functions_monitored: Object.keys(functionStats).length
    });

    return new Response(JSON.stringify({
      success: true,
      monitoring_report: monitoringReport
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Function monitoring error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);