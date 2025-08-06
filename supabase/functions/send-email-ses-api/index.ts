import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template_name?: string;
  template_data?: any;
}

// Helper function to create AWS signature V4
async function createAWSSignature(
  method: string,
  url: string,
  payload: string,
  region: string,
  service: string,
  accessKey: string,
  secretKey: string
) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  
  // Create canonical request
  const canonicalUri = new URL(url).pathname;
  const canonicalQueryString = '';
  const canonicalHeaders = `host:${new URL(url).host}\nx-amz-date:${timeStr}\n`;
  const signedHeaders = 'host;x-amz-date';
  
  const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const payloadHashHex = Array.from(new Uint8Array(payloadHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHashHex}`;
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStr}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const stringToSign = `${algorithm}\n${timeStr}\n${credentialScope}\n${canonicalRequestHashHex}`;
  
  // Create signature
  const key1 = await crypto.subtle.importKey('raw', new TextEncoder().encode(`AWS4${secretKey}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const key2 = await crypto.subtle.sign('HMAC', key1, new TextEncoder().encode(dateStr));
  const key3 = await crypto.subtle.importKey('raw', key2, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const key4 = await crypto.subtle.sign('HMAC', key3, new TextEncoder().encode(region));
  const key5 = await crypto.subtle.importKey('raw', key4, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const key6 = await crypto.subtle.sign('HMAC', key5, new TextEncoder().encode(service));
  const key7 = await crypto.subtle.importKey('raw', key6, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const key8 = await crypto.subtle.sign('HMAC', key7, new TextEncoder().encode('aws4_request'));
  const signingKey = await crypto.subtle.importKey('raw', key8, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  
  const signature = await crypto.subtle.sign('HMAC', signingKey, new TextEncoder().encode(stringToSign));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;
  
  return {
    Authorization: authorizationHeader,
    'X-Amz-Date': timeStr,
  };
}

async function sendViaSESAPI(emailData: EmailRequest) {
  const region = Deno.env.get('AWS_REGION') || 'eu-north-1';
  const accessKey = Deno.env.get('SES_ACCESS_KEY_ID');
  const secretKey = Deno.env.get('SES_SECRET_ACCESS_KEY');
  
  if (!accessKey || !secretKey) {
    throw new Error('AWS credentials not configured');
  }
  
  // Get email configuration
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  const { data: emailConfig } = await supabase
    .from('email_config_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['smtp_from_address', 'smtp_from_name']);
  
  const config = emailConfig?.reduce((acc, item) => {
    acc[item.setting_key] = item.setting_value;
    return acc;
  }, {} as Record<string, string>) || {};
  
  const fromAddress = config.smtp_from_address || 'no-reply@talentxcel.in';
  const fromName = config.smtp_from_name || 'TalentXcel';
  
  // Prepare SES API payload
  const sesPayload = new URLSearchParams({
    'Action': 'SendEmail',
    'Version': '2010-12-01',
    'Source': `${fromName} <${fromAddress}>`,
    'Destination.ToAddresses.member.1': emailData.to,
    'Message.Subject.Data': emailData.subject,
    'Message.Subject.Charset': 'UTF-8',
  });
  
  if (emailData.html) {
    sesPayload.append('Message.Body.Html.Data', emailData.html);
    sesPayload.append('Message.Body.Html.Charset', 'UTF-8');
  }
  
  if (emailData.text) {
    sesPayload.append('Message.Body.Text.Data', emailData.text);
    sesPayload.append('Message.Body.Text.Charset', 'UTF-8');
  }
  
  const url = `https://email.${region}.amazonaws.com/`;
  const payload = sesPayload.toString();
  
  // Create AWS signature
  const awsHeaders = await createAWSSignature('POST', url, payload, region, 'ses', accessKey, secretKey);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...awsHeaders,
    },
    body: payload,
  });
  
  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('SES API Error:', responseText);
    throw new Error(`SES API failed: ${response.status} - ${responseText}`);
  }
  
  // Parse message ID from XML response
  const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
  const messageId = messageIdMatch ? messageIdMatch[1] : 'unknown';
  
  console.log('✅ Email sent successfully via SES API:', messageId);
  return { messageId, provider: 'ses-api' };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 SES API Email Function Starting...');
    
    const emailRequest: EmailRequest = await req.json();
    console.log('📧 Processing email request via SES API...');
    
    if (!emailRequest.to || !emailRequest.subject) {
      console.error('❌ Missing required fields');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: to, subject' 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // If template_name is provided, get template content
    let finalContent = emailRequest.html || emailRequest.text || '';
    let finalSubject = emailRequest.subject;
    
    if (emailRequest.template_name) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: templateData } = await supabase
        .from('email_automation_settings')
        .select('subject_template, html_template')
        .eq('trigger_type', emailRequest.template_name)
        .eq('is_enabled', true)
        .maybeSingle();
      
      if (templateData) {
        // Replace template variables
        const replaceVars = (template: string, data: any) => {
          let result = template;
          const variables = template.match(/\{\{([^}]+)\}\}/g);
          if (variables) {
            variables.forEach(variable => {
              const key = variable.replace(/\{\{|\}\}/g, '').trim();
              const value = data[key] || data[key.toLowerCase()] || '';
              result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
            });
          }
          return result;
        };
        
        const templateDataWithDefaults = {
          company_name: 'TalentXcel',
          website_url: 'https://talentxcel.in',
          support_email: 'support@talentxcel.in',
          current_year: new Date().getFullYear().toString(),
          ...emailRequest.template_data
        };
        
        finalSubject = replaceVars(templateData.subject_template, templateDataWithDefaults);
        finalContent = replaceVars(templateData.html_template, templateDataWithDefaults);
      }
    }
    
    // Send email via SES API with retry logic
    let lastError: any;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Sending email attempt ${attempt}/${maxRetries}...`);
        
        const result = await sendViaSESAPI({
          to: emailRequest.to,
          subject: finalSubject,
          html: finalContent,
          text: emailRequest.text
        });
        
        console.log('✅ Email sent successfully:', result.messageId);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Email sent successfully via SES API',
          messageId: result.messageId,
          provider: 'ses-api',
          attempt: attempt
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
        
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ All retry attempts failed:', lastError);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: `Failed to send email after ${maxRetries} attempts: ${lastError.message}`,
      provider: 'ses-api'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ SES API email error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);