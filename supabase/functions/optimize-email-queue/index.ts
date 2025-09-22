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

    const { config, actions } = await req.json();
    
    console.log('Starting email queue optimization with config:', config);
    
    const results = [];

    // Cleanup failed emails older than 24 hours
    if (actions.includes('cleanup_failed_emails')) {
      const { count, error } = await supabase
        .from('email_automation_queue')
        .delete()
        .eq('status', 'failed')
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (error) {
        console.error('Error cleaning failed emails:', error);
      } else {
        console.log(`Cleaned up ${count} failed emails`);
        results.push(`Cleaned ${count || 0} failed emails`);
      }
    }

    // Reset stuck emails (pending for more than 30 minutes)
    if (actions.includes('batch_pending_emails')) {
      const { count, error } = await supabase
        .from('email_automation_queue')
        .update({ 
          status: 'pending',
          scheduled_at: new Date().toISOString(),
          attempts: 0
        })
        .eq('status', 'processing')
        .lt('scheduled_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());
      
      if (error) {
        console.error('Error resetting stuck emails:', error);
      } else {
        console.log(`Reset ${count} stuck emails`);
        results.push(`Reset ${count || 0} stuck emails`);
      }
    }

    // Optimize retry logic - move retryable emails back to pending
    if (actions.includes('optimize_retry_logic')) {
      const { count, error } = await supabase
        .from('email_automation_queue')
        .update({
          status: 'pending',
          scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
        })
        .eq('status', 'failed')
        .lt('attempts', config.maxRetries || 3);
      
      if (error) {
        console.error('Error optimizing retry logic:', error);
      } else {
        console.log(`Queued ${count} emails for retry`);
        results.push(`Queued ${count || 0} emails for retry`);
      }
    }

    // Update system settings with new configuration
    if (actions.includes('update_processing_intervals')) {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'email_performance_config',
          value: config,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating config:', error);
      } else {
        console.log('Updated performance configuration');
        results.push('Updated performance configuration');
      }
    }

    // Generate performance metrics
    const { data: queueStats } = await supabase
      .from('email_automation_queue')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const metrics = {
      totalInQueue: queueStats?.length || 0,
      pendingCount: queueStats?.filter(email => email.status === 'pending').length || 0,
      failedCount: queueStats?.filter(email => email.status === 'failed').length || 0,
      sentCount: queueStats?.filter(email => email.status === 'sent').length || 0,
      optimizationResults: results
    };

    console.log('Optimization completed:', metrics);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email queue optimization completed',
      metrics,
      optimizationsApplied: results.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email queue optimization error:", error);
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