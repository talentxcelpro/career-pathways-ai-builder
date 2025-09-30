import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { SESv2Client, PutSuppressedDestinationCommand, DeleteSuppressedDestinationCommand } from "https://esm.sh/@aws-sdk/client-sesv2@3.490.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// AWS SESv2 Client for suppression list management
const createSESv2Client = () => {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials for SESv2 client');
  }

  return new SESv2Client({
    region: 'eu-north-1', // Primary region for suppression list management
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Handle SES bounce notifications
const handleBounce = async (bounceData: any) => {
  console.log('Processing SES bounce notification:', bounceData);

  const messageId = bounceData.mail.messageId;
  const bouncedRecipients = bounceData.bounce.bouncedRecipients;
  const bounceType = bounceData.bounce.bounceType; // 'Permanent' or 'Transient'
  const bounceSubType = bounceData.bounce.bounceSubType;

  for (const recipient of bouncedRecipients) {
    const email = recipient.emailAddress;
    const action = recipient.action;
    const status = recipient.status;
    const diagnosticCode = recipient.diagnosticCode;

    console.log(`Processing bounce for ${email}: ${bounceType}/${bounceSubType}`);

    // Update delivery tracking
    await supabase
      .from('email_delivery_tracking')
      .update({
        delivery_status: 'bounced',
        bounce_type: bounceType.toLowerCase(),
        bounce_subtype: bounceSubType,
        bounce_reason: diagnosticCode,
        bounced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('ses_message_id', messageId);

    // Update SES delivery logs if exists
    await supabase
      .from('ses_delivery_logs')
      .update({
        status: 'bounced',
        bounce_type: bounceType.toLowerCase(),
        bounce_reason: diagnosticCode,
        updated_at: new Date().toISOString()
      })
      .eq('message_id', messageId)
      .eq('recipient_email', email);

    // For permanent bounces, add to suppression list
    if (bounceType === 'Permanent') {
      console.log(`Adding ${email} to suppression list due to permanent bounce`);

      // Add to local suppression list
      await supabase
        .from('email_suppression_list')
        .upsert({
          email_address: email,
          suppression_type: 'bounce',
          reason: `Permanent bounce: ${bounceSubType}`,
          bounce_type: bounceType.toLowerCase(),
          bounce_subtype: bounceSubType,
          diagnostic_code: diagnosticCode,
          created_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'email_address'
        });

      // Add to AWS SES suppression list
      try {
        const sesClient = createSESv2Client();
        await sesClient.send(new PutSuppressedDestinationCommand({
          EmailAddress: email,
          Reason: 'BOUNCE'
        }));
        console.log(`Successfully added ${email} to AWS SES suppression list`);
      } catch (sesError) {
        console.error(`Failed to add ${email} to AWS SES suppression list:`, sesError);
      }

      // Update email queue status for this email
      await supabase
        .from('email_automation_queue')
        .update({
          status: 'suppressed',
          error_message: `Permanent bounce: ${bounceSubType}`,
          updated_at: new Date().toISOString()
        })
        .eq('recipient_email', email)
        .in('status', ['pending', 'failed']);
    }

    // Create notification for admin if bounce rate is high
    if (bounceType === 'Permanent') {
      await createBounceAlert(email, bounceSubType, diagnosticCode);
    }
  }

  return {
    processed: bouncedRecipients.length,
    permanentBounces: bouncedRecipients.filter((r: any) => bounceType === 'Permanent').length
  };
};

// Handle SES complaint notifications
const handleComplaint = async (complaintData: any) => {
  console.log('Processing SES complaint notification:', complaintData);

  const messageId = complaintData.mail.messageId;
  const complainedRecipients = complaintData.complaint.complainedRecipients;
  const complaintFeedbackType = complaintData.complaint.complaintFeedbackType;
  const complaintSubType = complaintData.complaint.complaintSubType;

  for (const recipient of complainedRecipients) {
    const email = recipient.emailAddress;

    console.log(`Processing complaint for ${email}: ${complaintFeedbackType}`);

    // Update delivery tracking
    await supabase
      .from('email_delivery_tracking')
      .update({
        delivery_status: 'complained',
        complaint_type: complaintFeedbackType,
        complaint_subtype: complaintSubType,
        complained_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('ses_message_id', messageId);

    // Update SES delivery logs
    await supabase
      .from('ses_delivery_logs')
      .update({
        status: 'complained',
        complaint_type: complaintFeedbackType,
        updated_at: new Date().toISOString()
      })
      .eq('message_id', messageId)
      .eq('recipient_email', email);

    // Add to suppression list for complaints
    console.log(`Adding ${email} to suppression list due to complaint`);

    await supabase
      .from('email_suppression_list')
      .upsert({
        email_address: email,
        suppression_type: 'complaint',
        reason: `Complaint: ${complaintFeedbackType}`,
        complaint_type: complaintFeedbackType,
        complaint_subtype: complaintSubType,
        created_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'email_address'
      });

    // Add to AWS SES suppression list
    try {
      const sesClient = createSESv2Client();
      await sesClient.send(new PutSuppressedDestinationCommand({
        EmailAddress: email,
        Reason: 'COMPLAINT'
      }));
      console.log(`Successfully added ${email} to AWS SES suppression list for complaint`);
    } catch (sesError) {
      console.error(`Failed to add ${email} to AWS SES suppression list:`, sesError);
    }

    // Update email queue status
    await supabase
      .from('email_automation_queue')
      .update({
        status: 'suppressed',
        error_message: `Complaint: ${complaintFeedbackType}`,
        updated_at: new Date().toISOString()
      })
      .eq('recipient_email', email)
      .in('status', ['pending', 'failed']);

    // Create immediate alert for complaints
    await createComplaintAlert(email, complaintFeedbackType);
  }

  return {
    processed: complainedRecipients.length
  };
};

// Handle SES delivery notifications
const handleDelivery = async (deliveryData: any) => {
  console.log('Processing SES delivery notification:', deliveryData);

  const messageId = deliveryData.mail.messageId;
  const recipients = deliveryData.delivery.recipients;
  const timestamp = deliveryData.delivery.timestamp;
  const processingTimeMillis = deliveryData.delivery.processingTimeMillis;

  for (const email of recipients) {
    // Update delivery tracking
    await supabase
      .from('email_delivery_tracking')
      .update({
        delivery_status: 'delivered',
        delivered_at: timestamp,
        processing_time_ms: processingTimeMillis,
        updated_at: new Date().toISOString()
      })
      .eq('ses_message_id', messageId)
      .eq('recipient_email', email);

    // Update SES delivery logs
    await supabase
      .from('ses_delivery_logs')
      .update({
        status: 'delivered',
        delivered_at: timestamp,
        processing_time_ms: processingTimeMillis,
        updated_at: new Date().toISOString()
      })
      .eq('message_id', messageId)
      .eq('recipient_email', email);
  }

  return {
    processed: recipients.length
  };
};

// Create bounce alert for high bounce rates
const createBounceAlert = async (email: string, bounceSubType: string, diagnosticCode: string) => {
  // Check bounce rate in last 24 hours
  const { data: recentBounces } = await supabase
    .from('email_delivery_tracking')
    .select('count')
    .eq('delivery_status', 'bounced')
    .gte('bounced_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (recentBounces && recentBounces.length > 10) { // More than 10 bounces in 24h
    await supabase
      .from('ses_alerts')
      .insert({
        alert_type: 'high_bounce_rate',
        severity: 'high',
        message: `High bounce rate detected: ${recentBounces.length} bounces in last 24 hours`,
        metadata: {
          latest_bounce: {
            email,
            bounceSubType,
            diagnosticCode
          },
          bounce_count_24h: recentBounces.length
        },
        created_at: new Date().toISOString()
      });
  }
};

// Create complaint alert
const createComplaintAlert = async (email: string, complaintType: string) => {
  await supabase
    .from('ses_alerts')
    .insert({
      alert_type: 'complaint_received',
      severity: 'critical',
      message: `Spam complaint received from ${email}`,
      metadata: {
        email,
        complaintType,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SES webhook handler started...');
    
    const body = await req.text();
    console.log('Raw webhook body:', body);

    // Parse SNS message
    let snsMessage;
    try {
      snsMessage = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse SNS message:', parseError);
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
    }

    // Handle SNS subscription confirmation
    if (snsMessage.Type === 'SubscriptionConfirmation') {
      console.log('SNS subscription confirmation received');
      
      // Auto-confirm subscription by calling the SubscribeURL
      if (snsMessage.SubscribeURL) {
        try {
          const confirmResponse = await fetch(snsMessage.SubscribeURL);
          console.log('SNS subscription confirmed:', confirmResponse.status);
        } catch (confirmError) {
          console.error('Failed to confirm SNS subscription:', confirmError);
        }
      }
      
      return new Response('Subscription confirmed', { 
        status: 200, 
        headers: { "Content-Type": "text/plain", ...corsHeaders } 
      });
    }

    // Handle SES notifications
    if (snsMessage.Type === 'Notification') {
      let sesMessage;
      try {
        sesMessage = JSON.parse(snsMessage.Message);
      } catch (parseError) {
        console.error('Failed to parse SES message:', parseError);
        return new Response('Invalid SES message format', { status: 400, headers: corsHeaders });
      }

      console.log('SES notification type:', sesMessage.notificationType);

      let result;
      switch (sesMessage.notificationType) {
        case 'Bounce':
          result = await handleBounce(sesMessage);
          break;
        case 'Complaint':
          result = await handleComplaint(sesMessage);
          break;
        case 'Delivery':
          result = await handleDelivery(sesMessage);
          break;
        default:
          console.warn('Unknown SES notification type:', sesMessage.notificationType);
          return new Response('Unknown notification type', { status: 400, headers: corsHeaders });
      }

      console.log('SES webhook processing completed:', result);

      return new Response(JSON.stringify({
        success: true,
        message: 'SES webhook processed successfully',
        notificationType: sesMessage.notificationType,
        result: result
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response('Unhandled SNS message type', { status: 400, headers: corsHeaders });

  } catch (error: any) {
    console.error("Error in SES webhook handler:", error);
    
    // Log webhook processing errors
    try {
      await supabase
        .from('ses_webhook_errors')
        .insert({
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_details: JSON.stringify(error),
          webhook_body: await req.text().catch(() => 'Failed to read body'),
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log webhook error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);