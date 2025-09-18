import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPHandler } from "https://deno.land/x/denomailer@1.6.0/client/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing SMTP connection...');

    // Use SES SMTP endpoint instead of email-smtp for better reliability
    const smtpHost = Deno.env.get('SMTP_HOST') || "email-smtp.us-east-1.amazonaws.com";
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || "587");
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    const fromEmail = Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in';

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials not configured');
    }

    console.log(`Connecting to ${smtpHost}:${smtpPort} with user: ${smtpUser}`);

    const client = new SMTPHandler({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    console.log('SMTP connection successful ✅');

    // Optional: Send a test email
    const { sendTest } = await req.json().catch(() => ({ sendTest: false }));
    
    if (sendTest) {
      await client.send({
        from: fromEmail,
        to: "test@talentxcel.in",
        subject: "SMTP Connection Test",
        content: "This is a test email to verify SMTP connectivity.",
        html: `
          <h2>SMTP Test Successful</h2>
          <p>Your AWS SES SMTP configuration is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
      });
      console.log('Test email sent successfully');
    }

    await client.close();

    return new Response(JSON.stringify({
      success: true,
      message: 'SMTP connection test successful',
      config: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        from: fromEmail
      },
      testEmailSent: sendTest
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("SMTP connection test failed:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);