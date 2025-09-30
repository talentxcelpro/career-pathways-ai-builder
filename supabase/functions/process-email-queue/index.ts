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

    // Get pending emails from queue, including retry logic
    // Also get failed emails that can be retried (reset their status to pending)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .or('status.eq.pending,and(status.eq.failed,attempts.lt.3)')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(50); // Process in batches

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
        console.log(`Processing email ${email.id} to ${email.recipient_email} via unified service (attempt ${(email.attempts || 0) + 1})`);

        // Reset failed emails to pending status for retry
        if (email.status === 'failed') {
          console.log(`Retrying failed email ${email.id}`);
          await supabase
            .from('email_automation_queue')
            .update({
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);
        }

        // Increment attempts before processing
        await supabase
          .from('email_automation_queue')
          .update({
            attempts: (email.attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // Prepare email data for unified service
        const emailData = {
          event_name: email.trigger_type, // Use trigger_type as event_name for unified service
          recipient_email: email.recipient_email,
          recipient_name: email.recipient_name || 'User',
          ...email.template_data,
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in',
          current_year: new Date().getFullYear().toString(),
          current_date: new Date().toLocaleDateString()
        };

        console.log(`Calling unified email service for ${email.trigger_type}`);

        // Call unified email notification service (centralized)
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-notification', {
          body: emailData
        });

        if (emailError) {
          console.error('Unified email service error details:', emailError);
          throw new Error(`Unified email service error: ${emailError.message || 'Unknown error'}`);
        }

        if (!emailResult || !emailResult.success) {
          console.error('Email service returned unsuccessful result:', emailResult);
          throw new Error(`Email sending failed: ${emailResult?.error || 'Unknown error'}`);
        }

        console.log('Email sent successfully via unified service:', emailResult);

        console.log(`Email sent successfully to ${email.recipient_email}`);

        // Extract SES message ID from result for enhanced tracking
        const sesMessageId = emailResult?.messageId || emailResult?.data?.MessageId || emailResult?.results?.[0]?.messageId;
        const sesRegion = emailResult?.region || 'us-east-1';

        // Check for suppressed emails before updating status
        const isEmailSuppressed = await supabase
          .from('email_suppression_list')
          .select('email_address')
          .eq('email_address', email.recipient_email)
          .eq('is_active', true)
          .single();

        if (isEmailSuppressed.data) {
          console.log(`Email ${email.recipient_email} is suppressed, skipping`);
          await supabase
            .from('email_automation_queue')
            .update({
              status: 'suppressed',
              error_message: 'Email address is in suppression list',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);
          continue;
        }

        // Update email status to sent and store SES message ID with region
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
            ses_message_id: sesMessageId,
            ses_region: sesRegion,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // Create comprehensive delivery tracking record
        if (sesMessageId) {
          await supabase
            .from('email_delivery_tracking')
            .insert({
              email_automation_queue_id: email.id,
              recipient_email: email.recipient_email,
              ses_message_id: sesMessageId,
              ses_region: sesRegion,
              delivery_status: 'sent',
              template_type: email.trigger_type,
              sent_at: new Date().toISOString()
            });

          // Also create SES delivery log for monitoring
          try {
            await supabase
              .from('ses_delivery_logs')
              .insert({
                message_id: sesMessageId,
                recipient_email: email.recipient_email,
                event_type: email.trigger_type,
                template_name: email.trigger_type,
                region: sesRegion,
                status: 'sent',
                sent_at: new Date().toISOString()
              });
            console.log('SES delivery log created');
          } catch (logError) {
            console.warn('Failed to create SES delivery log:', logError);
          }
        }

        processed++;
        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: 'sent',
          template: email.trigger_type
        });

      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id} to ${email.recipient_email}:`, emailError);
        
        const currentAttempts = (email.attempts || 0) + 1;
        const newStatus = currentAttempts >= 3 ? 'failed' : 'pending';
        
        // Update email with error status or mark for retry
        await supabase
          .from('email_automation_queue')
          .update({
            status: newStatus,
            error_message: emailError.message || 'Unknown error',
            updated_at: new Date().toISOString(),
            // Schedule retry in 5 minutes if not at max attempts
            ...(newStatus === 'pending' && {
              scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            })
          })
          .eq('id', email.id);

        if (newStatus === 'failed') {
          failed++;
        }

        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: newStatus,
          template: email.trigger_type,
          error: emailError.message,
          attempts: currentAttempts
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