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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('SES webhook received:', JSON.stringify(body, null, 2));

    // Handle SNS subscription confirmation
    if (body.Type === 'SubscriptionConfirmation') {
      console.log('SNS subscription confirmation received');
      const subscribeUrl = body.SubscribeURL;
      if (subscribeUrl) {
        const response = await fetch(subscribeUrl);
        console.log('Subscription confirmed:', response.status);
      }
      return new Response(JSON.stringify({ message: 'Subscription confirmed' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle SES event notifications
    if (body.Type === 'Notification') {
      const message = JSON.parse(body.Message);
      console.log('SES notification:', JSON.stringify(message, null, 2));

      for (const record of message.Records || []) {
        const sesEvent = record.ses;
        const eventType = record.eventType;
        const messageId = sesEvent?.mail?.messageId;

        if (!messageId) {
          console.log('No message ID found in SES event');
          continue;
        }

        let deliveryStatus = 'sent';
        let bounceType = null;
        let bounceReason = null;
        let complaintType = null;

        switch (eventType) {
          case 'send':
            deliveryStatus = 'sent';
            break;
          case 'delivery':
            deliveryStatus = 'delivered';
            break;
          case 'bounce':
            deliveryStatus = 'bounced';
            bounceType = sesEvent.bounce?.bounceType;
            bounceReason = sesEvent.bounce?.bouncedRecipients?.[0]?.diagnosticCode || 'Unknown bounce reason';
            break;
          case 'complaint':
            deliveryStatus = 'complained';
            complaintType = sesEvent.complaint?.complaintFeedbackType;
            break;
          case 'reject':
            deliveryStatus = 'failed';
            bounceReason = 'Email rejected by SES';
            break;
          default:
            console.log(`Unknown event type: ${eventType}`);
            continue;
        }

        // Update delivery tracking using our helper function
        const { error: updateError } = await supabase.rpc('update_email_delivery_status', {
          p_ses_message_id: messageId,
          p_delivery_status: deliveryStatus,
          p_bounce_type: bounceType,
          p_bounce_reason: bounceReason,
          p_complaint_type: complaintType,
          p_event_data: record
        });

        if (updateError) {
          console.error('Error updating delivery status:', updateError);
        } else {
          console.log(`Updated delivery status for message ${messageId}: ${deliveryStatus}`);
        }

        // For bounces and complaints, also update the email queue status
        if (deliveryStatus === 'bounced' || deliveryStatus === 'complained') {
          const { error: queueError } = await supabase
            .from('email_automation_queue')
            .update({
              status: 'failed',
              error_message: bounceReason || `Email ${deliveryStatus}`,
              updated_at: new Date().toISOString()
            })
            .eq('ses_message_id', messageId);

          if (queueError) {
            console.error('Error updating email queue:', queueError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: 'SES webhook processed successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in SES webhook:", error);
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