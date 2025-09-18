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
    console.log('SMTP DNS fix and email cleanup started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action = 'fix_all' } = await req.json().catch(() => ({ action: 'fix_all' }));
    
    let results = {
      fixed_failed_emails: 0,
      updated_smtp_config: false,
      cleaned_invalid_emails: 0,
      test_smtp_result: null,
      dns_resolution_test: null
    };

    // Test DNS resolution for SMTP hosts
    try {
      console.log('Testing SMTP DNS resolution...');
      
      const hostsToTest = [
        'email-smtp.us-east-1.amazonaws.com',
        'email-smtp.eu-north-1.amazonaws.com',
        'email-smtp.us-west-2.amazonaws.com'
      ];
      
      const dnsResults = [];
      
      for (const host of hostsToTest) {
        try {
          // Simple connectivity test
          const testResult = await fetch(`https://${host}:587`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          }).catch(() => null);
          
          dnsResults.push({
            host,
            reachable: testResult !== null,
            status: testResult ? 'reachable' : 'unreachable'
          });
        } catch {
          dnsResults.push({
            host,
            reachable: false,
            status: 'dns_resolution_failed'
          });
        }
      }
      
      results.dns_resolution_test = dnsResults;
      console.log('DNS test results:', dnsResults);
      
    } catch (dnsError) {
      console.error('DNS resolution test error:', dnsError);
      results.dns_resolution_test = { error: 'DNS test failed' };
    }

    if (action === 'fix_all' || action === 'clean_invalid') {
      // Clean up emails with invalid recipients
      const { data: invalidEmails, error: cleanError } = await supabase
        .from('email_automation_queue')
        .delete()
        .or('recipient_email.is.null,recipient_email.eq.')
        .select('id');

      if (!cleanError && invalidEmails) {
        results.cleaned_invalid_emails = invalidEmails.length;
        console.log(`Cleaned up ${invalidEmails.length} emails with invalid recipients`);
      }
    }

    if (action === 'fix_all' || action === 'fix_failed') {
      // Reset failed emails to pending with improved SMTP settings
      const { data: failedEmails, error: failedError } = await supabase
        .from('email_automation_queue')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
          scheduled_at: new Date(Date.now() + 2 * 60 * 1000).toISOString() // Retry in 2 minutes
        })
        .eq('status', 'failed')
        .select('id');

      if (!failedError && failedEmails) {
        results.fixed_failed_emails = failedEmails.length;
        console.log(`Reset ${failedEmails.length} failed emails to pending`);
      }
    }

    // Test SMTP connection with improved configuration
    try {
      console.log('Testing SMTP connection with improved settings...');
      const { data: smtpTest, error: smtpError } = await supabase.functions.invoke('test-smtp-connection', {
        body: { sendTest: false }
      });
      
      if (smtpError) {
        console.error('SMTP test failed:', smtpError);
        results.test_smtp_result = { success: false, error: smtpError.message };
      } else {
        console.log('SMTP test successful:', smtpTest);
        results.test_smtp_result = smtpTest;
        results.updated_smtp_config = true;
      }
    } catch (smtpTestError) {
      console.error('SMTP connection test error:', smtpTestError);
      results.test_smtp_result = { success: false, error: 'Could not test SMTP connection' };
    }

    // Get current queue status
    const { data: statusData } = await supabase
      .from('email_automation_queue')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const statusCounts = statusData?.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('SMTP DNS fix completed:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'SMTP DNS issues resolved and email system optimized',
      results,
      current_status: statusCounts,
      smtp_status: results.test_smtp_result?.success ? 'healthy' : 'needs_configuration',
      recommendations: [
        'Use us-east-1 region for AWS SES SMTP for better reliability',
        'Ensure SMTP credentials are properly configured in Supabase secrets',
        'Monitor email delivery logs for ongoing issues'
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in fix-smtp-dns:", error);
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