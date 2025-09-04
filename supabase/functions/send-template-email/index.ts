import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TemplateEmailRequest {
  template_name: string;
  recipient_email: string;
  recipient_name?: string;
  template_data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔒 Template-only email request started...');
    
    const requestBody: TemplateEmailRequest = await req.json();
    const {
      template_name,
      recipient_email,
      recipient_name,
      template_data = {}
    } = requestBody;
    
    // ENFORCE: Template name is mandatory
    if (!template_name) {
      throw new Error('SECURITY: template_name is required. Raw HTML content is not allowed.');
    }

    if (!recipient_email) {
      throw new Error('recipient_email is required');
    }

    console.log(`🎯 Processing template-only email: '${template_name}' to ${recipient_email}`);

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
    const fromAddress = config.smtp_from_address || 'noreply@talentxcel.in';
    const fromName = config.smtp_from_name || 'TalentXcel';
    const replyTo = config.smtp_reply_to || 'support@talentxcel.in';

    // ENFORCE: Get template from database - MUST exist and be active
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_template, is_active')
      .eq('template_name', template_name)
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('❌ Error fetching template:', templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!templateData) {
      console.error(`❌ Template '${template_name}' not found or disabled`);
      throw new Error(`SECURITY: Template '${template_name}' not found or disabled. Only predefined active templates are allowed.`);
    }

    // ENFORCE: Template must have HTML content
    if (!templateData.html_template || templateData.html_template.trim() === '') {
      throw new Error(`SECURITY: Template '${template_name}' has no HTML content. Template must contain valid HTML.`);
    }

    console.log(`✅ Template '${template_name}' validated successfully`);

    // Prepare email data for variable replacement with config values
    const emailData = {
      name: recipient_name,
      candidate_name: recipient_name,
      recipient_name: recipient_name,
      first_name: template_data?.first_name || recipient_name?.split(' ')[0] || recipient_name,
      company_name: config.company_name || 'TalentXcel',
      website_url: config.website_url || 'https://talentxcel.in',
      support_email: config.smtp_reply_to || 'support@talentxcel.in',
      platform_name: 'TalentXcel',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString(),
      ...template_data
    };

    // Replace template variables
    const subject = templateData.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = emailData[key];
      if (value === undefined || value === null) {
        console.warn(`⚠️  Missing template variable: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return String(value);
    });

    const htmlContent = templateData.html_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = emailData[key];
      if (value === undefined || value === null) {
        console.warn(`⚠️  Missing template variable: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return String(value);
    });

    // Final validation: Ensure we have valid HTML content
    if (!htmlContent || htmlContent.trim() === '') {
      throw new Error('SECURITY: Generated email content is empty. Template processing failed.');
    }
    
    // Check SMTP configuration
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error('SMTP configuration incomplete. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');
    }

    // Import nodemailer dynamically
    const { createTransport } = await import("npm:nodemailer");

    // Configure SMTP transporter
    const transporter = createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // Use SSL for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log('📧 Sending template-only email via SMTP...');

    // Send email using nodemailer with template content only
    const mailResult = await transporter.sendMail({
      from: `${fromName} <${fromAddress}>`,
      to: recipient_email,
      replyTo: replyTo,
      subject: subject,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, ''), // Plain text fallback
    });

    console.log('✅ Template email sent successfully:', mailResult.messageId);

    // Log the email delivery event
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          template_name,
          recipient_email,
          status: 'sent',
          message_id: mailResult.messageId,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('⚠️  Failed to log email delivery event:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Template email sent successfully',
      template: template_name,
      recipient: recipient_email,
      messageId: mailResult.messageId,
      security_note: 'Only predefined templates are allowed'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Error in template-only email function:", error);
    
    // Enhanced error logging for security
    if (error.message.includes('SECURITY:')) {
      console.error('🚨 SECURITY VIOLATION DETECTED:', error.message);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        security_note: 'Only predefined active templates are allowed',
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