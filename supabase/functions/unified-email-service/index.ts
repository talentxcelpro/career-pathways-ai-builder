import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template?: string;
  templateData?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  provider?: 'sendgrid' | 'resend' | 'auto';
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  fallback?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, template, templateData, priority = 'medium', provider = 'auto' }: EmailRequest = await req.json();
    
    console.log(`Processing email request: ${to}, provider: ${provider}, priority: ${priority}`);

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API keys
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!SENDGRID_API_KEY && !RESEND_API_KEY) {
      throw new Error('No email service providers configured. Please set SENDGRID_API_KEY or RESEND_API_KEY');
    }

    // Determine which provider to use
    let primaryProvider = provider;
    let fallbackProvider = null;

    if (provider === 'auto') {
      // Intelligent provider selection based on availability and priority
      if (RESEND_API_KEY && SENDGRID_API_KEY) {
        // Use Resend for high priority, SendGrid for others
        primaryProvider = priority === 'high' ? 'resend' : 'sendgrid';
        fallbackProvider = primaryProvider === 'resend' ? 'sendgrid' : 'resend';
      } else if (RESEND_API_KEY) {
        primaryProvider = 'resend';
      } else {
        primaryProvider = 'sendgrid';
      }
    }

    let result: EmailResponse;

    try {
      // Try primary provider
      result = await sendWithProvider(primaryProvider, { to, subject, html, template, templateData });
      console.log(`Email sent successfully via ${primaryProvider}`);
    } catch (primaryError) {
      console.log(`Primary provider ${primaryProvider} failed:`, primaryError);
      
      // Try fallback provider if available
      if (fallbackProvider) {
        try {
          result = await sendWithProvider(fallbackProvider, { to, subject, html, template, templateData });
          result.fallback = true;
          console.log(`Email sent successfully via fallback provider ${fallbackProvider}`);
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
          throw new Error(`Both providers failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
        }
      } else {
        throw primaryError;
      }
    }

    // Log delivery event
    try {
      await supabase.from('email_delivery_events').insert({
        recipient_email: to,
        subject,
        provider_used: result.provider,
        message_id: result.messageId,
        event_type: 'sent',
        event_data: {
          template,
          priority,
          fallback: result.fallback || false
        }
      });
    } catch (logError) {
      console.error('Failed to log email event:', logError);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Unified email service error:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function sendWithProvider(provider: string, { to, subject, html, template, templateData }: any): Promise<EmailResponse> {
  if (provider === 'resend') {
    return await sendWithResend(to, subject, html, template, templateData);
  } else if (provider === 'sendgrid') {
    return await sendWithSendGrid(to, subject, html, template, templateData);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function sendWithResend(to: string, subject: string, html: string, template?: string, templateData?: any): Promise<EmailResponse> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  // Add tracking pixel for open tracking
  const messageId = crypto.randomUUID();
  const trackingPixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook?event=opened&id=${messageId}" width="1" height="1" style="display:none;" />`;
  const htmlWithTracking = html + trackingPixel;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TalentXcel <noreply@talentxcel.in>',
      to: [to],
      subject,
      html: htmlWithTracking,
      tags: [
        { name: 'template', value: template || 'default' },
        { name: 'provider', value: 'resend' }
      ]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend Error: ${error}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    messageId: data.id,
    provider: 'resend'
  };
}

async function sendWithSendGrid(to: string, subject: string, html: string, template?: string, templateData?: any): Promise<EmailResponse> {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  // Add tracking pixel for open tracking
  const messageId = crypto.randomUUID();
  const trackingPixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook?event=opened&id=${messageId}" width="1" height="1" style="display:none;" />`;
  const htmlWithTracking = html + trackingPixel;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ 
        to: [{ email: to }],
        custom_args: {
          message_id: messageId,
          template: template || 'default'
        }
      }],
      from: { email: 'noreply@talentxcel.in', name: "TalentXcel" },
      subject,
      content: [{ type: 'text/html', value: htmlWithTracking }],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true },
        subscription_tracking: { enable: false }
      },
      custom_args: {
        message_id: messageId,
        template: template || 'default',
        provider: 'sendgrid'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid Error: ${error}`);
  }

  return {
    success: true,
    messageId: messageId,
    provider: 'sendgrid'
  };
}

serve(handler);