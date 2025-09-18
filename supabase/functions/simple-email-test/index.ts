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
    console.log('Simple email queue test started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { test_recipients = [] } = await req.json().catch(() => ({ test_recipients: [] }));
    
    // Get a few real user emails for testing
    const { data: testUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .not('email', 'is', null)
      .limit(3);

    if (usersError) {
      throw new Error(`Failed to get test users: ${usersError.message}`);
    }

    let queued = 0;
    const errors = [];

    // Queue welcome emails for test users
    if (testUsers && testUsers.length > 0) {
      for (const user of testUsers) {
        const { error: queueError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'welcome_email',
            recipient_email: user.email,
            recipient_name: user.full_name || 'User',
            template_data: {
              candidate_name: user.full_name || 'User',
              user_id: user.id
            },
            scheduled_at: new Date().toISOString(),
            status: 'pending'
          });

        if (queueError) {
          errors.push(`${user.email}: ${queueError.message}`);
        } else {
          queued++;
        }
      }
    }

    // Test SMTP connection
    let smtpTest = null;
    try {
      const { data: smtpResult, error: smtpError } = await supabase.functions.invoke('send-email-smtp', {
        body: {
          test: true
        }
      });
      
      smtpTest = smtpError ? { success: false, error: smtpError.message } : smtpResult;
    } catch (smtpErr) {
      smtpTest = { success: false, error: 'SMTP connection failed' };
    }

    // Trigger queue processing
    try {
      const { data: queueResult, error: queueError } = await supabase.functions.invoke('process-email-queue', {
        body: { immediate: true }
      });
      
      if (queueError) {
        console.error('Queue processing error:', queueError);
      }
    } catch (queueErr) {
      console.error('Failed to trigger queue:', queueErr);
    }

    console.log(`Simple email test completed: ${queued} emails queued`);

    return new Response(JSON.stringify({
      success: true,
      message: `Email test completed successfully`,
      queued_emails: queued,
      test_users: testUsers?.length || 0,
      errors,
      smtp_test: smtpTest
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in simple email test:", error);
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