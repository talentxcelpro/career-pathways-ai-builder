import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template variable replacement helper - handles {{variable}} patterns
function replaceTemplateVariables(template: string, data: any): string {
  let result = template;
  
  // Replace {{variable}} patterns
  const variables = template.match(/\{\{([^}]+)\}\}/g);
  if (variables) {
    variables.forEach(variable => {
      const key = variable.replace(/\{\{|\}\}/g, '').trim();
      const value = data[key] || data[key.toLowerCase()] || `{{${key}}}`;
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
  }
  
  return result;
}

interface ApplicationNotificationRequest {
  recipient_email: string;
  user_name: string;
  job_title: string;
  company?: string;
  application_link?: string;
  applicant_name?: string;
  job_id?: string;
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
      job_id
    }: ApplicationNotificationRequest = await req.json();
    
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
      .select('subject, html_template')
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
      platform_name: "TalentXcel",
      support_email: "support@talentxcel.in"
    };

    // Replace template variables in subject and content
    const subject = replaceTemplateVariables(templateData.subject, templateVariables);
    const htmlContent = replaceTemplateVariables(templateData.html_template, templateVariables);
    
    console.log('Template variables:', templateVariables);
    console.log('Final subject:', subject);

    // Call the unified email service with the processed content
    const emailServiceUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/unified-email-service';
    
    const emailPayload = {
      to: recipient_email,
      subject,
      html: htmlContent,
      priority: 'high',
      trackingPixel: true
    };

    console.log('Calling unified email service...');
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(`Email service error: ${JSON.stringify(result)}`);
    }

    console.log('Application notification email sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Application notification email sent successfully',
      messageId: result.messageId,
      provider: result.provider,
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