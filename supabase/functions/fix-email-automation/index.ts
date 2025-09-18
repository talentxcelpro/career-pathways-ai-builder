import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Email automation fix started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();
    
    let results = {
      fixed_failed_emails: 0,
      reset_pending_emails: 0,
      cleaned_old_emails: 0,
      total_processed: 0
    };

    if (action === 'fix_all' || action === 'fix_failed') {
      // Reset failed emails to pending for retry
      const { data: failedEmails, error: failedError } = await supabase
        .from('email_automation_queue')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
          scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
        })
        .eq('status', 'failed')
        .lt('attempts', 3);

      if (!failedError) {
        results.fixed_failed_emails = failedEmails?.length || 0;
      }
    }

    if (action === 'fix_all' || action === 'reset_pending') {
      // Reset stuck pending emails older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: stuckEmails, error: stuckError } = await supabase
        .from('email_automation_queue')
        .update({
          scheduled_at: new Date(Date.now() + 2 * 60 * 1000).toISOString() // Retry in 2 minutes
        })
        .eq('status', 'pending')
        .lt('scheduled_at', oneHourAgo);

      if (!stuckError) {
        results.reset_pending_emails = stuckEmails?.length || 0;
      }
    }

    if (action === 'fix_all' || action === 'cleanup_old') {
      // Clean up old sent/failed emails older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: oldEmails, error: cleanupError } = await supabase
        .from('email_automation_queue')
        .delete()
        .in('status', ['sent', 'failed'])
        .lt('created_at', thirtyDaysAgo);

      if (!cleanupError) {
        results.cleaned_old_emails = oldEmails?.length || 0;
      }
    }

    // Get current status
    const { data: statusData } = await supabase
      .from('email_automation_queue')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const statusCounts = statusData?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    results.total_processed = results.fixed_failed_emails + results.reset_pending_emails + results.cleaned_old_emails;

    console.log('Email automation fix completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email automation fixed successfully',
      results,
      current_status: statusCounts
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in fix-email-automation:", error);
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