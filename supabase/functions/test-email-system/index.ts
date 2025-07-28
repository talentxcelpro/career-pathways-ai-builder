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
    console.log('Testing email system with configured SMTP settings...');

    // Get SMTP configuration from secrets
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Deno.env.get("SMTP_PORT");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");

    console.log('SMTP Config check:', {
      host: !!SMTP_HOST,
      port: !!SMTP_PORT,
      user: !!SMTP_USER,
      pass: !!SMTP_PASS
    });

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Missing SMTP configuration");
    }

    // Dynamic import of nodemailer
    const { default: nodemailer } = await import("npm:nodemailer@6.9.1");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    console.log('Transporter created, sending test email...');

    const testEmailResult = await transporter.sendMail({
      from: '"TalentXcel Test" <no-reply@talentxcel.in>',
      to: "nexgennwelfare@gmail.com", // Using the logged-in user's email
      subject: "✅ Email System Test - TalentXcel",
      text: "This is a test email to verify that your TalentXcel email system is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email System Test Successful!</h2>
          <p>Congratulations! Your TalentXcel email system is now working correctly.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>Provider:</strong> Amazon SES</li>
              <li><strong>Host:</strong> ${SMTP_HOST}</li>
              <li><strong>Port:</strong> ${SMTP_PORT}</li>
              <li><strong>Method:</strong> Direct SMTP via Nodemailer</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p>Your email queue and automated email functions should now work properly!</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>TalentXcel Email Service</strong><br>
            This email was sent from your Supabase Edge Function
          </p>
        </div>
      `,
    });

    console.log('Test email sent successfully:', testEmailResult);

    return new Response(JSON.stringify({
      success: true,
      message: "✅ Email system test successful!",
      messageId: testEmailResult.messageId,
      testEmail: "nexgennwelfare@gmail.com",
      smtpHost: SMTP_HOST,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email system test failed:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: `❌ Email test failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);