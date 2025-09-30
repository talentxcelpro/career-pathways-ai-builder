import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  event_name: string;
  recipient_email: string;
  recipient_name?: string;
  platform_name?: string;
  data?: Record<string, any>;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  region?: string;
  error?: string;
  attempts?: number;
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: "Welcome to {{platform_name}}!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to {{platform_name}}!</h1>
        <p>Hi {{recipient_name}},</p>
        <p>Welcome to our platform! We're excited to have you on board.</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Exploring job opportunities</li>
          <li>Connecting with professionals</li>
        </ul>
        <p>Best regards,<br>The {{platform_name}} Team</p>
      </div>
    `
  },
  profile_completion: {
    subject: "Complete Your {{platform_name}} Profile",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Complete Your Profile</h1>
        <p>Hi {{recipient_name}},</p>
        <p>Your profile on {{platform_name}} is almost complete!</p>
        <p>Add the finishing touches to boost your visibility to employers:</p>
        <ul>
          <li>Upload a professional photo</li>
          <li>Add your work experience</li>
          <li>Include your skills and expertise</li>
        </ul>
        <p>A complete profile gets 5x more views!</p>
        <p>Best regards,<br>The {{platform_name}} Team</p>
      </div>
    `
  },
  job_match: {
    subject: "New Job Match on {{platform_name}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Job Match!</h1>
        <p>Hi {{recipient_name}},</p>
        <p>We found a job that matches your profile on {{platform_name}}!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">{{job_title}}</h3>
          <p style="margin: 5px 0;">{{company_name}}</p>
          <p style="margin: 5px 0;">{{location}}</p>
        </div>
        <p>Don't wait - apply now to increase your chances!</p>
        <p>Best regards,<br>The {{platform_name}} Team</p>
      </div>
    `
  },
  test_email: {
    subject: "Test Email from {{platform_name}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">✅ Test Email Success</h1>
        <p>Hi {{recipient_name}},</p>
        <p>This is a test email from {{platform_name}} to verify our email system is working correctly.</p>
        <div style="background: #10b981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>✓ Email System Status: OPERATIONAL</strong>
        </div>
        <p><strong>Amazon SES integration is functioning properly!</strong></p>
        <p><small>Timestamp: {{timestamp}}</small></p>
        <p>Best regards,<br>The {{platform_name}} Team</p>
      </div>
    `
  },
  'social.new_post': {
    subject: "{{author_name}} shared a new post on {{platform_name}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Post from Your Connection</h1>
        <p>Hi {{recipient_name}},</p>
        <p><strong>{{author_name}}</strong> just shared a new post:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0; color: #374151;">{{post_preview}}</p>
        </div>
        <p>Check out the full post and engage with your connection!</p>
        <div style="margin: 30px 0;">
          <a href="{{platform_url}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Post</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">You're receiving this because you're connected with {{author_name}} on {{platform_name}}.</p>
        <p>Best regards,<br>The {{platform_name}} Team</p>
      </div>
    `
  }
};

async function renderTemplate(templateKey: string, data: Record<string, any>): Promise<{ subject: string; html: string }> {
  const template = emailTemplates[templateKey as keyof typeof emailTemplates];
  if (!template) {
    throw new Error(`Template '${templateKey}' not found`);
  }

  let subject = template.subject;
  let html = template.html;

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    subject = subject.replace(regex, String(value));
    html = html.replace(regex, String(value));
  }

  return { subject, html };
}

async function sendEmailViaSES(
  to: string, 
  subject: string, 
  htmlContent: string, 
  region: string = 'eu-north-1',
  attemptNumber: number = 1
): Promise<EmailSendResult> {
  const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  
  console.log(`[Attempt ${attemptNumber}] Sending email via SES in region: ${region}`);
  console.log(`[Attempt ${attemptNumber}] To: ${to}, Subject: ${subject}`);
  
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not configured');
    return {
      success: false,
      error: 'AWS credentials not configured',
      attempts: attemptNumber
    };
  }

  const fromEmail = 'noreply@talentxcel.in';
  const sesEndpoint = `https://email.${region}.amazonaws.com`;
  
  console.log(`[Attempt ${attemptNumber}] Using SES endpoint: ${sesEndpoint}`);
  console.log(`[Attempt ${attemptNumber}] From: ${fromEmail}`);
  
  try {
    // Create AWS V4 signature
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);
    
    const params = new URLSearchParams({
      'Action': 'SendEmail',
      'Source': fromEmail,
      'Destination.ToAddresses.member.1': to,
      'Message.Subject.Data': subject,
      'Message.Body.Html.Data': htmlContent,
      'Version': '2010-12-01'
    });

    const payloadHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(params.toString())
    );
    
    const payloadHashHex = Array.from(new Uint8Array(payloadHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const canonicalRequest = [
      'POST',
      '/',
      '',
      'content-type:application/x-www-form-urlencoded',
      'host:email.' + region + '.amazonaws.com',
      'x-amz-date:' + timestamp,
      '',
      'content-type;host;x-amz-date',
      payloadHashHex
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      date + '/' + region + '/ses/aws4_request',
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    ].join('\n');

    // Create signing key
    const dateKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('AWS4' + AWS_SECRET_ACCESS_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const dateSignature = await crypto.subtle.sign('HMAC', dateKey, new TextEncoder().encode(date));
    
    const regionKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(dateSignature),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const regionSignature = await crypto.subtle.sign('HMAC', regionKey, new TextEncoder().encode(region));
    
    const serviceKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(regionSignature),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const serviceSignature = await crypto.subtle.sign('HMAC', serviceKey, new TextEncoder().encode('ses'));
    
    const signingKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(serviceSignature),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const requestSignature = await crypto.subtle.sign('HMAC', signingKey, new TextEncoder().encode('aws4_request'));
    
    const finalKey = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(requestSignature),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', finalKey, new TextEncoder().encode(stringToSign));
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const authorization = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${date}/${region}/ses/aws4_request,SignedHeaders=content-type;host;x-amz-date,Signature=${signatureHex}`;

    console.log(`[Attempt ${attemptNumber}] Sending request to AWS SES...`);
    
    // Send the request to SES
    const response = await fetch(sesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authorization,
        'X-Amz-Date': timestamp,
        'Host': `email.${region}.amazonaws.com`
      },
      body: params.toString()
    });

    const responseText = await response.text();
    console.log(`[Attempt ${attemptNumber}] SES Response Status: ${response.status}`);
    console.log(`[Attempt ${attemptNumber}] SES Response: ${responseText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`[Attempt ${attemptNumber}] ❌ SES Error:`, responseText);
      
      // Try fallback region if primary fails and we haven't tried it yet
      if (region === 'eu-north-1' && attemptNumber < 2) {
        console.log('🔄 Attempting fallback to us-east-1 region...');
        return await sendEmailViaSES(to, subject, htmlContent, 'us-east-1', attemptNumber + 1);
      }
      
      return {
        success: false,
        error: `SES Error (${response.status}): ${responseText}`,
        region,
        attempts: attemptNumber
      };
    }

    // Extract Message ID from response
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : 'unknown';

    console.log(`[Attempt ${attemptNumber}] ✅ Email sent successfully! Message ID: ${messageId}`);
    
    return {
      success: true,
      messageId,
      region,
      attempts: attemptNumber
    };

  } catch (error: any) {
    console.error(`[Attempt ${attemptNumber}] ❌ Exception during email send:`, error);
    
    // Try fallback region on exception if we haven't tried it yet
    if (region === 'us-east-1' && attemptNumber < 2) {
      console.log('🔄 Attempting fallback to us-west-2 region after exception...');
      return await sendEmailViaSES(to, subject, htmlContent, 'us-west-2', attemptNumber + 1);
    }
    
    return {
      success: false,
      error: error.message || 'Unknown error',
      region,
      attempts: attemptNumber
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('📧 Email notification service started...');
    console.log(`📧 Environment check:`, {
      hasAwsKey: !!Deno.env.get('AWS_ACCESS_KEY_ID'),
      hasAwsSecret: !!Deno.env.get('AWS_SECRET_ACCESS_KEY'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasSupabaseKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: EmailNotificationRequest = await req.json();
    console.log('📧 Email request received:', {
      event_name: requestData.event_name,
      recipient_email: requestData.recipient_email,
      recipient_name: requestData.recipient_name
    });

    // Prepare template data
    const templateData = {
      recipient_name: requestData.recipient_name || 'User',
      platform_name: requestData.platform_name || 'TalentXcel',
      timestamp: new Date().toISOString(),
      ...requestData.data
    };

    // Render email template
    console.log('📧 Rendering template:', requestData.event_name);
    const { subject, html } = await renderTemplate(requestData.event_name, templateData);
    
    console.log('📧 Sending email via Amazon SES...');
    
    // Send email via Amazon SES with automatic regional fallback
    const result = await sendEmailViaSES(requestData.recipient_email, subject, html);
    
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ Email sent successfully in ${duration}ms`);
      console.log(`✅ Message ID: ${result.messageId}, Region: ${result.region}, Attempts: ${result.attempts}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully via Amazon SES',
          messageId: result.messageId,
          region: result.region,
          attempts: result.attempts,
          duration: `${duration}ms`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      console.error(`❌ Email failed after ${result.attempts} attempts in ${duration}ms`);
      console.error(`❌ Error: ${result.error}`);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error,
          attempts: result.attempts,
          duration: `${duration}ms`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Email notification error after ${duration}ms:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email notification',
        duration: `${duration}ms`
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
