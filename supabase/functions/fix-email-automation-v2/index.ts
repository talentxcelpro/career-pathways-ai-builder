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
    console.log('Enhanced email automation fix started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action = 'fix_all' } = await req.json().catch(() => ({ action: 'fix_all' }));
    
    let results = {
      fixed_failed_emails: 0,
      reset_pending_emails: 0,
      cleaned_old_emails: 0,
      test_smtp_result: null,
      total_processed: 0
    };

    // Test SMTP connection first
    try {
      console.log('Testing SMTP connection...');
      const { data: smtpTest, error: smtpError } = await supabase.functions.invoke('test-smtp-connection', {
        body: { sendTest: false }
      });
      
      if (smtpError) {
        console.error('SMTP test failed:', smtpError);
        results.test_smtp_result = { success: false, error: smtpError.message };
      } else {
        console.log('SMTP test successful:', smtpTest);
        results.test_smtp_result = smtpTest;
      }
    } catch (smtpTestError) {
      console.error('SMTP connection test error:', smtpTestError);
      results.test_smtp_result = { success: false, error: 'Could not test SMTP connection' };
    }

    if (action === 'fix_all' || action === 'fix_failed') {
      // Reset failed emails to pending for retry with better scheduling
      const { data: failedEmails, error: failedError } = await supabase
        .from('email_automation_queue')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
          scheduled_at: new Date(Date.now() + 3 * 60 * 1000).toISOString() // Retry in 3 minutes
        })
        .eq('status', 'failed')
        .select('id');

      if (!failedError && failedEmails) {
        results.fixed_failed_emails = failedEmails.length;
        console.log(`Reset ${failedEmails.length} failed emails to pending`);
      } else if (failedError) {
        console.error('Error resetting failed emails:', failedError);
      }
    }

    if (action === 'fix_all' || action === 'reset_pending') {
      // Reset stuck pending emails older than 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: stuckEmails, error: stuckError } = await supabase
        .from('email_automation_queue')
        .update({
          scheduled_at: new Date(Date.now() + 1 * 60 * 1000).toISOString() // Retry in 1 minute
        })
        .eq('status', 'pending')
        .lt('scheduled_at', twoHoursAgo)
        .select('id');

      if (!stuckError && stuckEmails) {
        results.reset_pending_emails = stuckEmails.length;
        console.log(`Reset ${stuckEmails.length} stuck pending emails`);
      } else if (stuckError) {
        console.error('Error resetting pending emails:', stuckError);
      }
    }

    if (action === 'fix_all' || action === 'cleanup_old') {
      // Clean up old sent/failed emails older than 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: oldEmails, error: cleanupError } = await supabase
        .from('email_automation_queue')
        .delete()
        .in('status', ['sent', 'failed'])
        .lt('created_at', thirtyDaysAgo)
        .select('id');

      if (!cleanupError && oldEmails) {
        results.cleaned_old_emails = oldEmails.length;
        console.log(`Cleaned up ${oldEmails.length} old emails`);
      } else if (cleanupError) {
        console.error('Error cleaning up old emails:', cleanupError);
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

    console.log('Enhanced email automation fix completed:', results);

    // Trigger immediate queue processing if we fixed emails
    if (results.fixed_failed_emails > 0 || results.reset_pending_emails > 0) {
      try {
        console.log('Triggering immediate queue processing...');
        const { data: queueResult, error: queueError } = await supabase.functions.invoke('process-email-queue', {
          body: { immediate: true }
        });
        
        if (queueError) {
          console.error('Queue processing trigger error:', queueError);
        } else {
          console.log('Queue processing triggered successfully:', queueResult);
        }
      } catch (queueTriggerError) {
        console.error('Failed to trigger queue processing:', queueTriggerError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email automation enhanced fix completed successfully',
      results,
      current_status: statusCounts,
      smtp_status: results.test_smtp_result?.success ? 'healthy' : 'needs_attention'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in fix-email-automation-v2:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);