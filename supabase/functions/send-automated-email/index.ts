import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template variable replacement helper
function replaceTemplateVariables(template: string, data: any): string {
  let result = template;
  
  // Replace {{variable}} patterns
  const variables = template.match(/\{\{([^}]+)\}\}/g);
  if (variables) {
    variables.forEach(variable => {
      const key = variable.replace(/\{\{|\}\}/g, '').trim();
      const value = data[key] || data[key.toLowerCase()] || '';
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
  }
  
  return result;
}

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get template from database
    const { data: templateData, error: templateError } = await supabase
      .from('email_automation_settings')
      .select('subject_template, html_template')
      .eq('trigger_type', template_name)
      .eq('is_enabled', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!templateData) {
      console.error(`Template not found for trigger: ${template_name}`);
      throw new Error(`Template ${template_name} not found or disabled`);
    }

    // Prepare email data for variable replacement
    const emailData = {
      name: recipient_name,
      candidate_name: recipient_name,
      first_name: template_data?.first_name || recipient_name?.split(' ')[0] || recipient_name,
      ...template_data
    };

    // Replace template variables
    const subject = replaceTemplateVariables(templateData.subject_template, emailData);
    const htmlContent = replaceTemplateVariables(templateData.html_template, emailData);
    
    // Send email via SMTP
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? '',
        port: parseInt(Deno.env.get('SMTP_PORT') ?? '587'),
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USER') ?? '',
          password: Deno.env.get('SMTP_PASS') ?? '',
        },
      },
    });

    await client.send({
      from: Deno.env.get('SMTP_FROM') ?? 'no-reply@talentxcel.in',
      to: recipient_email,
      subject: subject,
      html: htmlContent,
    });

    await client.close();

    console.log(`Email sent successfully to ${recipient_email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent successfully',
      template: template_name,
      recipient: recipient_email,
      messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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