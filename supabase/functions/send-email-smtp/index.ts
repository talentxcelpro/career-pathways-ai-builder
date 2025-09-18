import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createTransport } from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SMTP email service started...');
    
    // Parse request body with better error handling
    let body;
    try {
      const requestText = await req.text();
      body = requestText ? JSON.parse(requestText) : {};
    } catch (parseError) {
      console.log('Request body parsing failed, using empty object');
      body = {};
    }
    
    const { to, subject, html, from, test = false } = body;

    // Enhanced test mode handling with better defaults
    let emailTo = to;
    let emailSubject = subject; 
    let emailHtml = html;

    // If no fields provided, assume this is a test request
    if (!to && !subject && !html) {
      console.log('No email fields provided, enabling test mode');
      emailTo = 'test@talentxcel.in';
      emailSubject = 'SMTP Connection Test';
      emailHtml = '<h2>SMTP Test Successful</h2><p>Your AWS SES SMTP configuration is working correctly.</p><p>Timestamp: ' + new Date().toISOString() + '</p>';
    }

    // Validate required fields
    if (!emailTo || !emailSubject || !emailHtml) {
      const missingFields = [];
      if (!emailTo) missingFields.push('to');
      if (!emailSubject) missingFields.push('subject'); 
      if (!emailHtml) missingFields.push('html');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Enhanced SMTP configuration with better host cleanup
    let smtpHost = Deno.env.get('SMTP_HOST') || 'email-smtp.us-east-1.amazonaws.com';
    
    // Clean up host - remove any prefixes and protocols
    smtpHost = smtpHost
      .replace(/^(https?:\/\/|Host:\s*)/i, '')
      .replace(/:\d+$/, '')
      .trim();
    
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in';

    console.log(`SMTP Config: ${smtpHost}:${smtpPort}, user: ${smtpUser ? 'SET' : 'NOT_SET'}`);

    // Enhanced validation
    if (!smtpHost || !smtpUser || !smtpPass) {
      const missingConfig = [];
      if (!smtpHost) missingConfig.push('SMTP_HOST');
      if (!smtpUser) missingConfig.push('SMTP_USER');
      if (!smtpPass) missingConfig.push('SMTP_PASS');
      throw new Error(`SMTP configuration incomplete. Missing: ${missingConfig.join(', ')}`);
    }

    // Create transporter
    const transporter = createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });

    // Send email
    const result = await transporter.sendMail({
      from: from || smtpFromEmail,
      to: emailTo,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log('Email sent successfully:', result.messageId);
    
    // Close transporter
    transporter.close();

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("SMTP email error:", error);
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