import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
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
        processed: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} to ${email.recipient_email}`);

        // Send email via the automated email function
        const emailResponse = await supabase.functions.invoke('send-automated-email', {
          body: {
            template_name: email.trigger_type,
            recipient_email: email.recipient_email,
            recipient_name: email.recipient_name,
            template_data: email.template_data
          }
        });

        if (emailResponse.error) {
          throw new Error(emailResponse.error.message || 'Failed to send email');
        }

        console.log('Email sent successfully via automated email function');

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

      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id}:`, emailError);
        
        // Update email with error status
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'failed',
            error_message: emailError.message || 'Unknown error'
          })
          .eq('id', email.id);

        failed++;
      }
    }

    console.log(`Email processing complete: ${processed} sent, ${failed} failed`);

    return new Response(JSON.stringify({
      message: 'Email processing complete',
      processed,
      failed,
      total: pendingEmails.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);