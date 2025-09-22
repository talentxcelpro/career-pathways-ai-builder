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

    const { action, confirm } = await req.json();
    
    if (!confirm || confirm !== 'EMERGENCY_CLEANUP') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Emergency confirmation required'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Starting emergency database cleanup...');
    
    const results = [];

    // Clean up old function logs (older than 7 days)
    if (action === 'cleanup_function_logs' || action === 'cleanup_all') {
      const { count: logsDeleted, error: logsError } = await supabase
        .from('function_health_logs')
        .delete()
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (logsError) {
        console.error('Error cleaning function logs:', logsError);
      } else {
        console.log(`Cleaned ${logsDeleted || 0} old function logs`);
        results.push(`Cleaned ${logsDeleted || 0} function logs`);
      }
    }

    // Clean up old email queue entries
    if (action === 'cleanup_email_queue' || action === 'cleanup_all') {
      const { count: emailsDeleted, error: emailError } = await supabase
        .from('email_automation_queue')
        .delete()
        .in('status', ['sent', 'failed'])
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (emailError) {
        console.error('Error cleaning email queue:', emailError);
      } else {
        console.log(`Cleaned ${emailsDeleted || 0} old email queue entries`);
        results.push(`Cleaned ${emailsDeleted || 0} email queue entries`);
      }
    }

    // Clean up old security events
    if (action === 'cleanup_security_events' || action === 'cleanup_all') {
      const { count: securityDeleted, error: securityError } = await supabase
        .from('security_events')
        .delete()
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (securityError) {
        console.error('Error cleaning security events:', securityError);
      } else {
        console.log(`Cleaned ${securityDeleted || 0} old security events`);
        results.push(`Cleaned ${securityDeleted || 0} security events`);
      }
    }

    // Clean up old AI processing logs
    if (action === 'cleanup_ai_logs' || action === 'cleanup_all') {
      const { count: aiLogsDeleted, error: aiLogsError } = await supabase
        .from('ai_processing_logs')
        .delete()
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (aiLogsError) {
        console.error('Error cleaning AI logs:', aiLogsError);
      } else {
        console.log(`Cleaned ${aiLogsDeleted || 0} old AI processing logs`);
        results.push(`Cleaned ${aiLogsDeleted || 0} AI processing logs`);
      }
    }

    // Clean up expired cache entries
    if (action === 'cleanup_cache' || action === 'cleanup_all') {
      const { count: cacheDeleted, error: cacheError } = await supabase
        .from('ai_prefill_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (cacheError) {
        console.error('Error cleaning cache:', cacheError);
      } else {
        console.log(`Cleaned ${cacheDeleted || 0} expired cache entries`);
        results.push(`Cleaned ${cacheDeleted || 0} cache entries`);
      }
    }

    // Log cleanup completion
    await supabase
      .from('function_health_logs')
      .insert({
        function_name: 'database-cleanup',
        status: 'success',
        request_count: results.length
      });

    console.log('Database cleanup completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Database cleanup completed successfully',
      results,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Database cleanup error:", error);
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