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
    console.log('Request body:', JSON.stringify(await req.clone().json()));
    
    const { template_name, recipient_email, recipient_name, template_data } = await req.json();
    
    if (!template_name || !recipient_email) {
      console.error('Missing required fields:', { template_name, recipient_email });
      throw new Error('Missing required fields: template_name and recipient_email');
    }

    console.log(`Sending ${template_name} email to ${recipient_email}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get email configuration settings
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['smtp_from_address', 'smtp_from_name', 'smtp_reply_to', 'company_name', 'website_url']);

    if (configError) {
      console.error('Error fetching email config:', configError);
    }

    // Convert config array to object for easy access
    const config = emailConfig?.reduce((acc, item) => {
      acc[item.setting_key] = item.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Set defaults if config not found
    const fromAddress = config.smtp_from_address || 'no-reply@talentxcel.in';
    const fromName = config.smtp_from_name || 'TalentXcel';
    const replyTo = config.smtp_reply_to || 'support@talentxcel.in';

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

    // Prepare email data for variable replacement with config values
    const emailData = {
      name: recipient_name,
      candidate_name: recipient_name,
      first_name: template_data?.first_name || recipient_name?.split(' ')[0] || recipient_name,
      company_name: config.company_name || 'TalentXcel',
      website_url: config.website_url || 'https://talentxcel.in',
      support_email: config.smtp_reply_to || 'support@talentxcel.in',
      current_year: new Date().getFullYear().toString(),
      ...template_data
    };

    // Replace template variables
    const subject = replaceTemplateVariables(templateData.subject_template, emailData);
    const htmlContent = replaceTemplateVariables(templateData.html_template, emailData);
    
    // Check SMTP configuration
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    
    console.log('SMTP Configuration Check:');
    console.log('SMTP_HOST:', smtpHost ? 'Set' : 'NOT SET');
    console.log('SMTP_PORT:', smtpPort ? 'Set' : 'NOT SET');
    console.log('SMTP_USER:', smtpUser ? 'Set' : 'NOT SET');
    console.log('SMTP_PASS:', smtpPass ? 'Set' : 'NOT SET');
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error('SMTP configuration incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');
    }
    
    // Send email via SMTP
    console.log('Initializing SMTP client...');
    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    console.log('Sending email via SMTP...');
    await client.send({
      from: `${fromName} <${fromAddress}>`,
      to: recipient_email,
      replyTo: replyTo,
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully, closing SMTP connection...');
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