import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userEmail: string;
  userName: string;
  temporaryPassword?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, temporaryPassword }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "TalentXcel <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Welcome to TalentXcel Platform - Account Activated!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">Welcome to TalentXcel!</h1>
            <p style="color: #64748b; font-size: 16px; margin: 10px 0 0 0;">Your professional journey starts here</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 20px;">Hello ${userName}!</h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.95;">Your account has been successfully created and activated. You can now access all platform features!</p>
          </div>
          
          ${temporaryPassword ? `
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #92400e; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🔐</span> Your Login Credentials
              </h3>
              <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f3f4f6;">
                <p style="margin: 5px 0;"><strong>Email:</strong> <code style="background: #f8fafc; padding: 2px 6px; border-radius: 3px;">${userEmail}</code></p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8fafc; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
              </div>
              <div style="margin-top: 15px; padding: 10px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #dc2626; font-size: 14px;">
                  <strong>🚨 Security Notice:</strong> Please change your password immediately after your first login for security.
                </p>
              </div>
            </div>
          ` : `
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #047857;">✅ Account Ready</h3>
              <p style="margin: 0; color: #065f46;">Your account is ready to use. Please log in with your existing credentials.</p>
            </div>
          `}
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://talentxcel.in'}/auth" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
              🚀 Access Your Account
            </a>
          </div>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">🌟 What's Next?</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center;">
                <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">👤</span>
                <span style="color: #4b5563;">Complete your profile setup</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">🔍</span>
                <span style="color: #4b5563;">Explore job opportunities</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">🤝</span>
                <span style="color: #4b5563;">Connect with professionals</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="color: #2563eb; margin-right: 10px; font-size: 16px;">📈</span>
                <span style="color: #4b5563;">Track your career progress</span>
              </div>
            </div>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">💡 Need Help?</h4>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
              Our support team is here to help! Contact us if you have any questions or need assistance getting started.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
          
          <div style="text-align: center;">
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              This email was sent automatically by TalentXcel. Please do not reply to this email.
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://talentxcel.in'}" style="color: #2563eb; text-decoration: none;">TalentXcel Platform</a> • 
              Empowering Your Career Journey
            </p>
          </div>
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