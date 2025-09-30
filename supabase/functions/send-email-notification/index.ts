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
        <h1 style="color: #2563eb;">Test Email</h1>
        <p>Hi {{recipient_name}},</p>
        <p>This is a test email from {{platform_name}} to verify our email system is working correctly.</p>
        <p>If you received this email, our Amazon SES integration is functioning properly!</p>
        <p>Timestamp: {{timestamp}}</p>
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

  // Replace template variables
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    subject = subject.replace(regex, String(value));
    html = html.replace(regex, String(value));
  }

  return { subject, html };
}

async function sendEmailViaSES(to: string, subject: string, htmlContent: string): Promise<void> {
  const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
  const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured');
  }

  // Amazon SES configuration for Europe (Stockholm)
  let currentRegion = 'eu-north-1'; // Primary region: Europe (Stockholm)
  const fromEmail = 'TalentXcel <noreply@talentxcel.in>';
  
  const sesEndpoint = `https://email.${currentRegion}.amazonaws.com`;
  
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
    'host:email.' + currentRegion + '.amazonaws.com',
    'x-amz-date:' + timestamp,
    '',
    'content-type;host;x-amz-date',
    payloadHashHex
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    date + '/' + currentRegion + '/ses/aws4_request',
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
  
  const regionSignature = await crypto.subtle.sign('HMAC', regionKey, new TextEncoder().encode(currentRegion));
  
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

  const authorization = `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${date}/${currentRegion}/ses/aws4_request,SignedHeaders=content-type;host;x-amz-date,Signature=${signatureHex}`;

  // Send the request to SES
  const response = await fetch(sesEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': authorization,
      'X-Amz-Date': timestamp,
      'Host': `email.${currentRegion}.amazonaws.com`
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SES Error Response:', errorText);
    
    // Try fallback region if primary fails
    if (currentRegion === 'eu-north-1') {
      console.log('Trying fallback region eu-west-1 (Ireland)...');
      currentRegion = 'eu-west-1';
      // Recursive call with fallback region - simplified for demo
      throw new Error(`SES Error: ${response.status} - ${errorText}. Please check your SES configuration in ${currentRegion}.`);
    }
    
    throw new Error(`SES Error: ${response.status} - ${errorText}`);
  }

  console.log('Email sent successfully via Amazon SES');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Email notification service started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: EmailNotificationRequest = await req.json();
    console.log('Email request received:', {
      event_name: requestData.event_name,
      recipient_email: requestData.recipient_email
    });

    // Prepare template data
    const templateData = {
      recipient_name: requestData.recipient_name || 'User',
      platform_name: requestData.platform_name || 'TalentXcel',
      timestamp: new Date().toISOString(),
      ...requestData.data
    };

    // Render email template
    const { subject, html } = await renderTemplate(requestData.event_name, templateData);
    
    console.log('Sending email via Amazon SES...');
    
    // Send email via Amazon SES
    await sendEmailViaSES(requestData.recipient_email, subject, html);
    
    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully via Amazon SES' 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('Email notification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email notification' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);