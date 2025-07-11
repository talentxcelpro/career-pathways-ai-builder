import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  password?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, password }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TalentXcel <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to TalentXcel Platform!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Welcome to TalentXcel!</h1>
          
          <p>Hello ${name},</p>
          
          <p>Your account has been successfully created on the TalentXcel platform. We're excited to have you join our community!</p>
          
          ${password ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p style="color: #dc2626; font-size: 14px;">⚠️ Please change your password after your first login for security.</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://talentxcel.in'}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Complete your profile setup</li>
            <li>Explore available features</li>
            <li>Connect with other professionals</li>
            <li>Start your journey with us!</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This email was sent automatically. Please do not reply to this email.<br>
            <a href="${Deno.env.get('SITE_URL') || 'https://talentxcel.in'}" style="color: #2563eb;">TalentXcel Platform</a>
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);