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
  provider?: 'ses' | 'resend' | 'auto';
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

    if (!to || !subject || (!html && !template)) {
      throw new Error('Missing required fields: to, subject, and either html or template');
    }

    // Perform simple token replacement for provided raw HTML (e.g., {{candidate_name}})
    const processedHtml = html && templateData
      ? replaceTemplateVariables(html, templateData)
      : html;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get API keys
    const SES_CONFIG = {
      host: Deno.env.get('SMTP_HOST'),
      port: Deno.env.get('SMTP_PORT'),
      user: Deno.env.get('SMTP_USER'),
      pass: Deno.env.get('SMTP_PASS'),
    };
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!SES_CONFIG.host && !RESEND_API_KEY) {
      throw new Error('No email service providers configured. Please set Amazon SES SMTP credentials or RESEND_API_KEY');
    }

    // Determine which provider to use
    let primaryProvider = provider;
    let fallbackProvider = null;

    if (provider === 'auto') {
      // Prefer React Email when a template is provided
      if (template) {
        primaryProvider = 'react-email';
        fallbackProvider = RESEND_API_KEY ? 'resend' : (SES_CONFIG.host ? 'ses' : null);
      } else {
        // Intelligent provider selection based on availability and priority
        if (RESEND_API_KEY && SES_CONFIG.host) {
          // Use Resend for high priority, SES for others
          primaryProvider = priority === 'high' ? 'resend' : 'ses';
          fallbackProvider = primaryProvider === 'resend' ? 'ses' : 'resend';
        } else if (RESEND_API_KEY) {
          primaryProvider = 'resend';
        } else {
          primaryProvider = 'ses';
        }
      }
    }

    let result: EmailResponse;

  try {
      // Try primary provider
      result = await sendWithProvider(primaryProvider, { to, subject, html: processedHtml, template, templateData });
      console.log(`Email sent successfully via ${primaryProvider}`);
    } catch (primaryError) {
      console.log(`Primary provider ${primaryProvider} failed:`, primaryError);
      
      // Try fallback provider if available
      if (fallbackProvider) {
        try {
          result = await sendWithProvider(fallbackProvider, { to, subject, html: processedHtml, template, templateData });
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
  } else if (provider === 'react-email') {
    return await sendWithReactEmail(to, subject, template, templateData);
  } else if (provider === 'ses') {
    return await sendWithSES(to, subject, html, template, templateData);
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

async function sendWithSES(to: string, subject: string, html: string, template?: string, templateData?: any): Promise<EmailResponse> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const maxAttempts = 3;
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`SES API send attempt ${attempt} for ${to}`);
      const response = await supabase.functions.invoke('send-email-aws-ses', {
        body: {
          to,
          subject,
          html,
          template,
          data: templateData || {}
        }
      });

      if (response.error) {
        throw new Error(`Amazon SES API Error: ${JSON.stringify(response.error)}`);
      }
      if (!response.data?.success) {
        throw new Error(`Amazon SES API Error: ${response.data?.error || 'Unknown error'}`);
      }

      return {
        success: true,
        messageId: response.data.messageId,
        provider: 'ses'
      };
    } catch (error: any) {
      lastError = error;
      console.error(`SES API attempt ${attempt} failed:`, error?.message || error);
      if (attempt < maxAttempts) {
        const backoff = attempt * 300;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
    }
  }

  console.error('SES API Error (after retries):', lastError);
  throw lastError || new Error('SES API failed after retries');
}



async function sendWithReactEmail(to: string, subject: string, template: string, templateData?: any): Promise<EmailResponse> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured for React Email');
  }

  try {
    // Create the Supabase client and call the React Email function directly
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const response = await supabase.functions.invoke('send-email-react', {
      body: {
        to: to,
        subject: subject,
        template: template,
        data: templateData || {}
      }
    });

    if (response.error) {
      throw new Error(`React Email Error: ${JSON.stringify(response.error)}`);
    }
    
    if (!response.data?.success) {
      throw new Error(`React Email Error: ${response.data?.error || 'Unknown error'}`);
    }

    return {
      success: true,
      messageId: response.data.messageId,
      provider: 'react-email'
    };
  } catch (error) {
    console.error('React Email Error:', error);
    throw error;
  }
}


// Simple mustache-style token replacement: replaces {{ token }} with data[token]
function replaceTemplateVariables(html: string, data: Record<string, any> = {}): string {
  if (!html) return html;
  try {
    return html.replace(/{{\s*([\w.-]+)\s*}}/g, (_match, key) => {
      const value = data?.[key];
      return value !== undefined && value !== null ? String(value) : '';
    });
  } catch (_e) {
    return html;
  }
}

serve(handler);