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
    const body = await req.json().catch(() => ({}));
    const { to, subject, html, from, test = false } = body;

    // Handle test mode with defaults
    const emailTo = to || (test ? 'test@talentxcel.in' : null);
    const emailSubject = subject || (test ? 'SMTP Test Email' : null);
    const emailHtml = html || (test ? '<h2>SMTP Test Successful</h2><p>Your SMTP configuration is working correctly.</p>' : null);

    // Validate inputs
    if (!emailTo || !emailSubject || !emailHtml) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // SMTP configuration with fallback to more reliable AWS region
    const smtpHost = Deno.env.get('SMTP_HOST') || 'email-smtp.us-east-1.amazonaws.com';
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in';

    console.log(`SMTP Config: ${smtpHost}:${smtpPort}, user: ${smtpUser ? 'SET' : 'NOT_SET'}`);

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('SMTP configuration incomplete. Check environment variables.');
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