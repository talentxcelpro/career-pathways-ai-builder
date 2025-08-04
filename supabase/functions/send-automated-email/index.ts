import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: "Welcome to TalentXcel - Your Career Journey Starts Here! 🎉",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">Welcome to TalentXcel!</h1>
          <p style="font-size: 18px; margin: 0 0 30px 0; opacity: 0.9;">Hi ${data.first_name || data.name || 'there'},</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We're thrilled to have you join our community of ambitious professionals! TalentXcel is your gateway to endless career opportunities and professional growth.
          </p>
          <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #ffd700;">🚀 What's next?</h3>
            <ul style="text-align: left; padding-left: 0; list-style: none;">
              <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                <span style="position: absolute; left: 0; color: #ffd700;">✓</span> Complete your profile to get noticed by top employers
              </li>
              <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                <span style="position: absolute; left: 0; color: #ffd700;">✓</span> Browse thousands of job opportunities
              </li>
              <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                <span style="position: absolute; left: 0; color: #ffd700;">✓</span> Connect with industry professionals
              </li>
              <li style="margin: 10px 0; padding-left: 25px; position: relative;">
                <span style="position: absolute; left: 0; color: #ffd700;">✓</span> Use our AI-powered resume builder
              </li>
            </ul>
          </div>
          <a href="https://talentxcel.in/profile" style="display: inline-block; background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; transition: transform 0.2s;">
            Complete Your Profile Now
          </a>
          <p style="font-size: 14px; opacity: 0.8; margin-top: 30px;">
            Need help? Reply to this email and our team will assist you.
          </p>
        </div>
        <div style="background: rgba(0,0,0,0.1); padding: 20px; text-align: center; font-size: 12px; opacity: 0.7;">
          <p>© 2025 TalentXcel. Building careers, connecting futures.</p>
          <p>You received this email because you signed up for TalentXcel.</p>
        </div>
      </div>
    `
  },
  
  job_match: {
    subject: "🎯 New Job Matches Found - Perfect for Your Skills!",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px;">New Job Matches!</h1>
          <p style="margin: 0; opacity: 0.9;">Hi ${data.name}, we found ${data.job_count || 'several'} jobs that match your profile</p>
        </div>
        <div style="padding: 30px; background: white;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Based on your skills and preferences, we've found some exciting opportunities that could be perfect for your next career move.
          </p>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">Why these matches are special:</h3>
            <p style="color: #666; margin: 0;">Our AI algorithm analyzed your profile and found positions that align with your experience, skills, and career goals.</p>
          </div>
          <a href="https://talentxcel.in/jobs" style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            View Job Matches
          </a>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2025 TalentXcel - Your AI-powered career platform</p>
        </div>
      </div>
    `
  },

  connection_request: {
    subject: "New Connection Request on TalentXcel",
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px;">New Connection Request</h1>
          <p style="margin: 0; opacity: 0.9;">${data.sender_name} wants to connect with you!</p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${data.recipient_name},<br><br>
            ${data.sender_name} would like to connect with you on TalentXcel. Building your professional network opens doors to new opportunities and collaborations.
          </p>
          <a href="https://talentxcel.in/network/requests" style="display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            View Connection Request
          </a>
        </div>
      </div>
    `
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Automated email sending started...');
    
    const { template_name, recipient_email, recipient_name, template_data } = await req.json();
    
    if (!template_name || !recipient_email) {
      throw new Error('Missing required fields: template_name and recipient_email');
    }

    console.log(`Sending ${template_name} email to ${recipient_email}`);

    // Get template
    const template = EMAIL_TEMPLATES[template_name as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      throw new Error(`Template ${template_name} not found`);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Prepare email data
    const emailData = {
      name: recipient_name,
      first_name: template_data?.first_name || recipient_name,
      ...template_data
    };

    // Generate email content
    const htmlContent = template.html(emailData);
    
    // Send email via AWS SES function
    const emailResponse = await supabase.functions.invoke('send-email-aws-ses', {
      body: {
        to: recipient_email,
        subject: template.subject,
        html: htmlContent,
        template: template_name,
        templateData: emailData
      }
    });

    if (emailResponse.error) {
      console.error('Error from send-email-aws-ses:', emailResponse.error);
      throw new Error(`Failed to send email: ${JSON.stringify(emailResponse.error)}`);
    }

    if (emailResponse.data?.error) {
      console.error('Error in email response:', emailResponse.data.error);
      throw new Error(`Email sending failed: ${emailResponse.data.error}`);
    }

    console.log(`Email sent successfully to ${recipient_email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent successfully',
      template: template_name,
      recipient: recipient_email,
      messageId: emailResponse.data?.messageId
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-automated-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);