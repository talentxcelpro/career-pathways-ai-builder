import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
  immediate?: boolean;
}

// Email templates
const emailTemplates = {
  welcome: (data: any) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TalentXcel!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name}! 🎉</h2>
            <p>Welcome to TalentXcel! We're excited to have you join our professional community.</p>
            <a href="https://talentxcel.in/network" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalentXcel. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  invite_member: (data: any) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Invitation</h1>
          </div>
          <div class="content">
            <h2>You've Been Invited! 🎊</h2>
            <p>Hi ${data.invited_name},</p>
            <p><strong>${data.inviter_name}</strong> has invited you to join <strong>${data.company_name}</strong> on TalentXcel.</p>
            <a href="https://talentxcel.in/employer/invite?token=${data.invite_token}" class="button">Accept Invitation</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalentXcel. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  job_opening: (data: any) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Opportunity</h1>
          </div>
          <div class="content">
            <h2>Perfect Match Found! 💼</h2>
            <p>Hi ${data.name},</p>
            <p>We found a job opportunity that matches your profile:</p>
            <h3>${data.job_title}</h3>
            <p><strong>${data.company_name}</strong> • ${data.location}</p>
            <a href="https://talentxcel.in/jobs/${data.job_id}" class="button">View Job Details</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TalentXcel. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data = {}, immediate = false }: EmailRequest = await req.json();
    console.log('Received email request:', { to, subject, template, immediate });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (immediate) {
      // Send email immediately using SendGrid
      const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
      console.log('SendGrid API Key configured:', !!sendGridApiKey);
      
      if (!sendGridApiKey) {
        console.error('SENDGRID_API_KEY not configured');
        throw new Error('SENDGRID_API_KEY not configured');
      }

      const templateHtml = emailTemplates[template as keyof typeof emailTemplates]?.(data);
      console.log('Template found:', !!templateHtml, 'Template type:', template);
      
      if (!templateHtml) {
        console.error(`Template '${template}' not found. Available templates:`, Object.keys(emailTemplates));
        throw new Error(`Template '${template}' not found`);
      }

      const emailData = {
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: { email: 'noreply@talentxcel.in', name: 'TalentXcel' },
        content: [{
          type: 'text/html',
          value: templateHtml
        }]
      };

      console.log('Sending email via SendGrid to:', to);
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SendGrid API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
      }
      
      console.log('Email sent successfully via SendGrid');

      return new Response(JSON.stringify({ success: true, message: 'Email sent immediately' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      // Queue email for later processing
      console.log('Queuing email for later processing');
      
      const { error } = await supabase
        .from('email_queue')
        .insert({
          to_email: to,
          subject,
          template,
          data,
          status: 'pending'
        });

      if (error) {
        console.error('Error queuing email:', error);
        throw error;
      }
      
      console.log('Email queued successfully');

      return new Response(JSON.stringify({ success: true, message: 'Email queued successfully' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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