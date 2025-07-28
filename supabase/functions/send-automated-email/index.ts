import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email_id: string;
  recipient_email: string;
  template: string;
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email_id, recipient_email, template, data = {} }: EmailRequest = await req.json();
    
    console.log(`Processing automated email ${email_id} for ${recipient_email} with template ${template}`);

    // Get SMTP configuration from environment
    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = Deno.env.get("SMTP_PORT");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");

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

    // Generate email content based on template
    let subject = '';
    let htmlContent = '';

    switch (template) {
      case 'profile_completion_reminder':
        subject = '🔔 Complete Your TalentXcel Profile';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Complete Your Profile on TalentXcel</h2>
            <p>Hi ${data.userName || 'there'},</p>
            <p>We noticed your TalentXcel profile isn't complete yet. A complete profile helps employers find you and increases your chances of landing your dream job!</p>
            <div style="margin: 20px 0;">
              <a href="https://talentxcel.in/profile" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Your Profile</a>
            </div>
            <p>Best regards,<br>The TalentXcel Team</p>
          </div>
        `;
        break;
      
      case 'welcome':
        subject = '🎉 Welcome to TalentXcel!';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to TalentXcel!</h2>
            <p>Hi ${data.userName || 'there'},</p>
            <p>Welcome to TalentXcel! We're excited to have you join our community of talented professionals.</p>
            <p>Get started by completing your profile and exploring job opportunities that match your skills.</p>
            <div style="margin: 20px 0;">
              <a href="https://talentxcel.in/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
            </div>
            <p>Best regards,<br>The TalentXcel Team</p>
          </div>
        `;
        break;

      default:
        subject = `Notification from TalentXcel`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">TalentXcel Notification</h2>
            <p>Hi there,</p>
            <p>You have a new notification from TalentXcel.</p>
            <p>Visit your dashboard to see more details.</p>
            <div style="margin: 20px 0;">
              <a href="https://talentxcel.in/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a>
            </div>
            <p>Best regards,<br>The TalentXcel Team</p>
          </div>
        `;
    }

    console.log(`Sending email with subject: ${subject}`);

    const info = await transporter.sendMail({
      from: '"TalentXcel" <admin@talentxcel.in>',
      to: recipient_email,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${recipient_email}, Message ID: ${info.messageId}`);

    return new Response(JSON.stringify({
      success: true,
      messageId: info.messageId,
      message: `Email sent successfully to ${recipient_email}`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Automated email send error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: `Failed to send automated email: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);