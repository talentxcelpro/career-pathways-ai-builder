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
    
    // Get the full request body for placeholder replacement
    const requestBody = await req.json();
    const {
      recipient_email,
      user_name,
      job_title,
      template_name = "application_notification"
    } = requestBody;
    
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

    // Add default values to ensure all common placeholders are available
    const placeholderData = {
      ...requestBody,
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString(),
      platform_name: "TalentXcel",
      support_email: "support@talentxcel.in",
      applicant_name: requestBody.applicant_name || requestBody.user_name
    };

    // Replace placeholders automatically - any {{key}} will be replaced with placeholderData[key]
    const subject = templateData.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = placeholderData[key];
      if (!value) {
        console.warn(`Missing placeholder value for: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return value;
    });
    
    const htmlContent = templateData.html_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = placeholderData[key];
      if (!value) {
        console.warn(`Missing placeholder value for: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return value;
    });
    
    console.log('Placeholder data:', placeholderData);
    console.log('Final subject:', subject);

    // Import nodemailer dynamically
    const { createTransport } = await import("npm:nodemailer");

    // Configure SMTP transporter using environment variables
    const transporter = createTransport({
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