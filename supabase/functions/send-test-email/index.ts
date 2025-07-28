import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting direct SMTP test with nodemailer...');

    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Deno.env.get("SMTP_PORT");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Missing SMTP configuration. Please check environment variables.");
    }

    console.log('SMTP Config:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      passConfigured: !!SMTP_PASS
    });

    // Dynamic import of nodemailer
    const { default: nodemailer } = await import("npm:nodemailer@6.9.1");

    const transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    console.log('Transporter created, attempting to send email...');

    const info = await transporter.sendMail({
      from: '"TalentXcel Test" <admin@talentxcel.in>',
      to: "test@talentxcel.in", // Change this to your test email
      subject: "✅ Test Email from TalentXcel (Direct SMTP via Amazon SES)",
      text: "This is a test email sent using Amazon SES directly via Supabase Edge Function with nodemailer.",
      html: `
        <h2>✅ Direct SMTP Test Successful!</h2>
        <p>This email was sent using:</p>
        <ul>
          <li><strong>Provider:</strong> Amazon SES SMTP</li>
          <li><strong>Method:</strong> Direct nodemailer integration</li>
          <li><strong>Function:</strong> send-test-email</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p>If you received this email, your Amazon SES SMTP configuration is working correctly!</p>
        <hr>
        <p><small>TalentXcel Email Service</small></p>
      `,
    });

    console.log('Email sent successfully:', info);

    return new Response(JSON.stringify({
      success: true,
      messageId: info.messageId,
      message: `✅ Email sent successfully! Message ID: ${info.messageId}`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email send error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: `❌ Email failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);