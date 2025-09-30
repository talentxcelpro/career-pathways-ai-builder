import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Email queue processing started...');
    
    // Handle health check requests more robustly
    let body: any = {};
    try {
      const requestText = await req.text();
      if (requestText.trim()) {
        body = JSON.parse(requestText);
      }
    } catch (parseError) {
      console.log('Could not parse request body, treating as empty object');
      body = {};
    }
    
    if (body.healthCheck) {
      console.log('Health check request received');
      return new Response(JSON.stringify({ 
        status: 'healthy',
        message: 'Edge function is operational',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from email_automation_queue table
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return new Response(JSON.stringify({ 
        message: 'No pending emails to process',
        processed: 0,
        failed: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${pendingEmails.length} emails to process`);

    let processed = 0;
    let failed = 0;
    const results = [];

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} to ${email.recipient_email} (attempt ${(email.retry_count || 0) + 1})`);

        // Increment retry_count before processing
        await supabase
          .from('email_automation_queue')
          .update({
            retry_count: (email.retry_count || 0) + 1
          })
          .eq('id', email.id);

        // Call Amazon SES email notification service
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-notification', {
          body: {
            event_name: email.trigger_type || 'test_email',
            recipient_email: email.recipient_email,
            recipient_name: email.recipient_name || 'User',
            platform_name: 'TalentXcel',
            data: email.template_data || {}
          }
        });

        if (emailError) {
          console.error('Amazon SES email service error details:', emailError);
          throw new Error(`Amazon SES email service error: ${emailError.message || 'Unknown error'}`);
        }

        if (!emailResult || !emailResult.success) {
          console.error('Email service returned unsuccessful result:', emailResult);
          throw new Error(`Email sending failed: ${emailResult?.error || 'Unknown error'}`);
        }

        console.log('Email sent successfully via Amazon SES:', emailResult);

        console.log(`Email sent successfully to ${email.recipient_email}`);

        // Update email status to sent
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', email.id);

        processed++;
        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: 'sent'
        });

      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id} to ${email.recipient_email}:`, emailError);
        
        const currentRetries = (email.retry_count || 0) + 1;
        const newStatus = currentRetries >= (email.max_retries || 3) ? 'failed' : 'pending';
        
        // Update email with error status or mark for retry
        await supabase
          .from('email_automation_queue')
          .update({
            status: newStatus,
            error_message: emailError.message || 'Unknown error'
          })
          .eq('id', email.id);

        if (newStatus === 'failed') {
          failed++;
        }

        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: newStatus,
          error: emailError.message,
          attempts: currentRetries
        });
      }
    }

    const summary = {
      message: 'Email processing complete',
      processed,
      failed,
      retrying: pendingEmails.length - processed - failed,
      total: pendingEmails.length,
      timestamp: new Date().toISOString(),
      results
    };

    console.log('Processing summary:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(
      JSON.stringify({ 
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