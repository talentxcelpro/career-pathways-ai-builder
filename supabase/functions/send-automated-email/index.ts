import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email templates
const emailTemplates = {
  welcome_email: (data: any) => ({
    subject: `Welcome to TalentXCE, ${data.name || 'there'}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">Welcome to TalentXCE!</h1>
          <p style="color: #64748b; font-size: 16px; margin: 10px 0 0 0;">Your professional journey starts here</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 20px;">Hello ${data.name || 'there'}!</h2>
          <p style="margin: 0; font-size: 16px; opacity: 0.95;">Thank you for joining TalentXCE. We're excited to help you discover amazing career opportunities!</p>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://talentxcel.in/dashboard" 
             style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
            🚀 Explore Opportunities
          </a>
        </div>
        
        <div style="text-align: center;">
          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            This email was sent automatically by TalentXCE. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  connection_request: (data: any) => ({
    subject: `${data.requester_name} wants to connect with you on TalentXCE`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">New Connection Request</h1>
        <p>Hello ${data.recipient_name},</p>
        <p><strong>${data.requester_name}</strong> ${data.requester_title ? `(${data.requester_title} at ${data.requester_company})` : ''} wants to connect with you on TalentXCE.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentxcel.in/network/requests" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Connection Request
          </a>
        </div>
      </div>
    `
  }),

  job_recommendation: (data: any) => ({
    subject: `New Job Match: ${data.job_title} at ${data.company_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">New Job Recommendation</h1>
        <p>Hello ${data.name},</p>
        <p>We found a job that matches your profile:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">${data.job_title}</h3>
          <p><strong>Company:</strong> ${data.company_name}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Salary:</strong> ${data.salary_range}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentxcel.in/jobs/${data.job_id}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Job Details
          </a>
        </div>
      </div>
    `
  }),

  application_confirmation: (data: any) => ({
    subject: `Application Submitted: ${data.job_title} at ${data.company_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981;">Application Submitted Successfully!</h1>
        <p>Hello ${data.name},</p>
        <p>Your application has been successfully submitted for:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #1f2937;">${data.job_title}</h3>
          <p><strong>Company:</strong> ${data.company_name}</p>
          <p><strong>Application ID:</strong> ${data.application_id}</p>
          <p><strong>Submitted:</strong> ${new Date(data.applied_date).toLocaleDateString()}</p>
        </div>
        <p>We'll notify you of any updates regarding your application.</p>
      </div>
    `
  }),

  team_invitation: (data: any) => ({
    subject: `You're invited to join ${data.company_name} team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Team Invitation</h1>
        <p>Hello ${data.invited_name},</p>
        <p><strong>${data.inviter_name}</strong> has invited you to join the <strong>${data.company_name}</strong> team as a <strong>${data.role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentxcel.in/employer/team/accept/${data.invite_token}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Accept Invitation
          </a>
        </div>
      </div>
    `
  }),

  password_reset: (data: any) => ({
    subject: 'Reset Your TalentXCE Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ef4444;">Password Reset Request</h1>
        <p>Hello ${data.name},</p>
        <p>We received a request to reset your password. Click the link below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reset_link}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </div>
        <p><small>Request from IP: ${data.ip_address}</small></p>
        <p><small>If you didn't request this, please ignore this email.</small></p>
      </div>
    `
  }),

  interview_scheduled: (data: any) => ({
    subject: `Interview Scheduled: ${data.job_title} at ${data.company_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981;">Interview Scheduled!</h1>
        <p>Hello ${data.candidate_name},</p>
        <p>Your interview has been scheduled for the <strong>${data.job_title}</strong> position at <strong>${data.company_name}</strong>.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(data.interview_date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${data.interview_time}</p>
          <p><strong>Type:</strong> ${data.interview_type}</p>
          ${data.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${data.meeting_link}">Join Interview</a></p>` : ''}
        </div>
        <p>Good luck with your interview!</p>
      </div>
    `
  }),

  monthly_digest: (data: any) => ({
    subject: 'Your Monthly TalentXCE Digest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Your Monthly Digest</h1>
        <p>Hello ${data.name},</p>
        <p>Here's your activity summary for this month:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Stats</h3>
          <ul>
            <li><strong>Profile Views:</strong> ${data.profile_views}</li>
            <li><strong>Applications Sent:</strong> ${data.applications_sent}</li>
            <li><strong>New Connections:</strong> ${data.new_connections}</li>
            <li><strong>Interviews:</strong> ${data.interviews}</li>
          </ul>
        </div>
        <h3>Trending Jobs</h3>
        ${data.trending_jobs?.map((job: any) => `
          <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 6px;">
            <h4 style="margin: 0 0 5px 0;">${job.title}</h4>
            <p style="margin: 5px 0; color: #6b7280;">${job.company} • ${job.location} • ${job.salary}</p>
          </div>
        `).join('') || '<p>No trending jobs this month.</p>'}
      </div>
    `
  })
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template_name, recipient_email, recipient_name, template_data } = await req.json();

    if (!template_name || !recipient_email) {
      return new Response(
        JSON.stringify({ error: 'Missing template_name or recipient_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get email template
    const templateFunction = emailTemplates[template_name as keyof typeof emailTemplates];
    if (!templateFunction) {
      return new Response(
        JSON.stringify({ error: `Template '${template_name}' not found` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailContent = templateFunction(template_data || {});

    // Try Resend first, then fallback to SendGrid
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    let emailSent = false;
    let error = null;

    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        const emailResponse = await resend.emails.send({
          from: "TalentXCE <noreply@talentxcel.in>",
          to: [recipient_email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        console.log('Email sent via Resend:', emailResponse);
        emailSent = true;
      } catch (resendError: any) {
        console.error('Resend failed:', resendError);
        error = resendError.message;
      }
    }

    // Fallback to SendGrid if Resend failed
    if (!emailSent && SENDGRID_API_KEY) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: recipient_email }] }],
            from: { email: 'noreply@talentxcel.in', name: "TalentXCE" },
            subject: emailContent.subject,
            content: [{ type: 'text/html', value: emailContent.html }],
          }),
        });

        if (response.ok) {
          console.log('Email sent via SendGrid');
          emailSent = true;
        } else {
          const sendGridError = await response.text();
          console.error('SendGrid failed:', sendGridError);
          error = `SendGrid Error: ${sendGridError}`;
        }
      } catch (sendGridError: any) {
        console.error('SendGrid request failed:', sendGridError);
        error = sendGridError.message;
      }
    }

    if (!emailSent) {
      return new Response(
        JSON.stringify({ 
          error: error || 'No email service configured or all services failed',
          details: 'Please ensure RESEND_API_KEY or SENDGRID_API_KEY is configured'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-automated-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});