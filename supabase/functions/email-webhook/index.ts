import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookEvent {
  event: string; // 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  email: string;
  messageId?: string;
  linkUrl?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received:', req.method, req.url);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('Webhook body:', body);

    // Handle different email service providers
    let events: WebhookEvent[] = [];
    
    // SendGrid webhook format
    if (Array.isArray(body)) {
      events = body.map((event: any) => ({
        event: event.event,
        email: event.email,
        messageId: event.sg_message_id,
        linkUrl: event.url,
        userAgent: event.useragent,
        ip: event.ip,
        timestamp: event.timestamp
      }));
    }
    // Resend webhook format
    else if (body.type) {
      events = [{
        event: body.type,
        email: body.data?.to?.[0] || body.data?.email,
        messageId: body.data?.message_id,
        linkUrl: body.data?.click?.link,
        userAgent: body.data?.user_agent,
        ip: body.data?.ip,
        timestamp: body.created_at
      }];
    }
    // Generic format
    else {
      events = [body as WebhookEvent];
    }

    console.log('Processed events:', events);

    for (const event of events) {
      if (!event.email || !event.event) {
        console.log('Skipping invalid event:', event);
        continue;
      }

      // Find the email in our queue by recipient email
      const { data: emailRecord } = await supabase
        .from('email_automation_queue')
        .select('id')
        .eq('recipient_email', event.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Found email record:', emailRecord);

      // Insert delivery event
      const { error: eventError } = await supabase
        .from('email_delivery_events')
        .insert({
          email_id: emailRecord?.id,
          event_type: event.event.toLowerCase(),
          event_data: {
            messageId: event.messageId,
            userAgent: event.userAgent,
            timestamp: event.timestamp
          },
          recipient_email: event.email,
          user_agent: event.userAgent,
          ip_address: event.ip,
          link_url: event.linkUrl,
          external_id: event.messageId
        });

      if (eventError) {
        console.error('Error inserting delivery event:', eventError);
      } else {
        console.log('Successfully recorded delivery event:', event.event, 'for', event.email);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});