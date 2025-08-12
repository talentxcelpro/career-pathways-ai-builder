import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  from: string;
  subject: string;
  html: string;
  messageId?: string;
  headers?: Record<string, string>;
  smtp?: {
    host: string;
    port: string;
    user: string;
    pass: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 SMTP Email Function Starting...');
    console.log('📊 Request method:', req.method);

    const requestBody = await req.text();
    console.log('📄 Raw request body:', requestBody);

    if (!requestBody) {
      throw new Error('Request body is empty');
    }

    const emailData: EmailRequest = JSON.parse(requestBody);
    const { to, from, subject, html, messageId } = emailData;

    console.log(`📧 Sending email via SMTP to: ${to}`);

    // Validate required fields
    if (!to || !from || !subject || !html) {
      throw new Error('Missing required email fields: to, from, subject, html');
    }

    // Get SMTP config from environment variables
    const smtpConfig = {
      host: Deno.env.get('SMTP_HOST'),
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      user: Deno.env.get('SMTP_USER'),
      pass: Deno.env.get('SMTP_PASS'),
    };

    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('Missing SMTP configuration in environment variables');
    }

    console.log('🔧 Creating SMTP client...');
    console.log('📡 SMTP Host:', smtpConfig.host);
    console.log('📡 SMTP Port:', smtpConfig.port);

    // Create SMTP client with denomailer
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: smtpConfig.port,
        tls: true,
        auth: {
          username: smtpConfig.user,
          password: smtpConfig.pass,
        },
      },
    });

    console.log('✉️ Sending email...');

    // Generate a plain-text fallback from HTML to ensure proper multipart/alternative
    const plainText = (html || '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    // Send the email with explicit HTML + text parts (multipart/alternative)
    await client.send({
      from: from,
      to: to,
      subject: subject,
      content: plainText || ' ',
      html: html,
    });

    console.log('📤 Closing SMTP connection...');
    await client.close();

    const responseMessageId = messageId || crypto.randomUUID();
    console.log('✅ Email sent successfully:', responseMessageId);

    return new Response(JSON.stringify({
      success: true,
      messageId: responseMessageId,
      provider: 'smtp-denomailer',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ SMTP email service error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});