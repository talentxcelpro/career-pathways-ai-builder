import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template variable replacement helper - simplified approach
function replaceTemplateVariables(template: string, data: any): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

interface ApplicationNotificationRequest {
  recipient_email: string;
  user_name: string;
  job_title: string;
  company?: string;
  application_link?: string;
  applicant_name?: string;
  job_id?: string;
  template_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Application notification email started...');
    
    const {
      recipient_email,
      user_name,
      job_title,
      company = "TalentXcel",
      application_link = "https://talentxcel.in/jobs",
      applicant_name,
      job_id,
      template_name = "application_notification"
    }: ApplicationNotificationRequest = await req.json();
    
    // Validate required fields
    if (!recipient_email || !user_name || !job_title) {
      throw new Error('Missing required fields: recipient_email, user_name, job_title');
    }

    console.log(`Sending application notification for ${job_title} to ${recipient_email}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the application_notification template
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_template, is_active')
      .eq('name', 'Application Notification Template')
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!templateData) {
      console.error('Application notification template not found');
      throw new Error('Application notification template not found or disabled');
    }

    // Prepare template data with all variables
    const templateVariables = {
      user_name,
      job_title,
      company,
      application_link,
      applicant_name: applicant_name || user_name,
      job_id,
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString(),
      platform_name: "TalentXcel",
      support_email: "support@talentxcel.in"
    };

    // Replace template variables in subject and content
    const subject = replaceTemplateVariables(templateData.subject, templateVariables);
    const htmlContent = replaceTemplateVariables(templateData.html_template, templateVariables);
    
    console.log('Template variables:', templateVariables);
    console.log('Final subject:', subject);

    // Import nodemailer dynamically
    const nodemailer = await import("npm:nodemailer@6.9.7");

    // Configure SMTP transporter using environment variables
    const transporter = nodemailer.default.createTransporter({
      host: Deno.env.get('SMTP_HOST') || 'email-smtp.eu-north-1.amazonaws.com',
      port: Number(Deno.env.get('SMTP_PORT')) || 465,
      secure: true, // Use SSL
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    console.log('Sending email via SMTP...');

    // Send email using nodemailer
    const mailResult = await transporter.sendMail({
      from: `TalentXcel <${Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in'}>`,
      to: recipient_email,
      subject,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, ''), // Plain text fallback
    });

    console.log('Email sent successfully:', mailResult.messageId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Application notification email sent successfully',
      messageId: mailResult.messageId,
      provider: 'smtp',
      recipient: recipient_email,
      job_title
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-application-notification function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);