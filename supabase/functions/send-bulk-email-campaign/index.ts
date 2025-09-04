import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  campaign_name: string;
  template_name: string;
  recipient_email: string;
  subject: string;
  template_data: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Bulk email campaign request started...');
    
    const requestBody: BulkEmailRequest = await req.json();
    const {
      campaign_name,
      template_name,
      recipient_email,
      subject,
      template_data
    } = requestBody;
    
    // Validate required fields
    if (!campaign_name || !template_name || !recipient_email || !subject) {
      throw new Error('Missing required fields: campaign_name, template_name, recipient_email, subject');
    }

    console.log(`Processing bulk email for campaign: ${campaign_name} to ${recipient_email}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the email template
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
      ...template_data,
      campaign_name,
      platform_name: 'TalentXcel',
      support_email: 'support@talentxcel.in',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString()
    };

    // Replace template variables
    const finalSubject = subject || templateData.subject_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return emailData[key] || match;
    });
    
    const htmlContent = templateData.html_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return emailData[key] || match;
    });

    // Import nodemailer dynamically
    const { createTransport } = await import("npm:nodemailer");

    // Configure SMTP transporter
    const transporter = createTransport({
      host: Deno.env.get('SMTP_HOST') || 'email-smtp.eu-north-1.amazonaws.com',
      port: Number(Deno.env.get('SMTP_PORT')) || 465,
      secure: true, // Use SSL
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    console.log('Sending bulk campaign email via SMTP...');

    // Send email using nodemailer
    const mailResult = await transporter.sendMail({
      from: `TalentXcel <${Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in'}>`,
      to: recipient_email,
      subject: finalSubject,
      html: htmlContent,
      text: htmlContent.replace(/<[^>]+>/g, ''), // Plain text fallback
    });

    console.log('Bulk campaign email sent successfully:', mailResult.messageId);

    // Log the email delivery event
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          campaign_name,
          template_name,
          recipient_email,
          status: 'sent',
          message_id: mailResult.messageId,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log email delivery event:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Bulk campaign email sent successfully',
      messageId: mailResult.messageId,
      campaign_name,
      recipient: recipient_email
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-bulk-email-campaign function:", error);
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