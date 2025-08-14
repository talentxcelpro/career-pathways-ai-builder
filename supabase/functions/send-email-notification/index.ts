import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { createTransport } from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// SMTP transporter
const createSMTPTransporter = () => {
  return createTransport({
    host: Deno.env.get("SMTP_HOST"),
    port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
    secure: true, // true for 465, false for other ports
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASS"),
    },
  });
};

// Function to replace placeholders in templates
function replacePlaceholders(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      console.warn(`Missing placeholder value for: ${key}`);
      return match; // Keep original placeholder if no value found
    }
    return String(value);
  });
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Unified email notification started...');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));

    const { event_name, recipients, ...commonData } = requestBody;

    // Validate required fields
    if (!event_name) {
      throw new Error('Missing required field: event_name');
    }

    // Support both single recipient and bulk recipients
    const recipientList = recipients ? recipients : [requestBody];

    // Validate that we have at least one recipient with email
    if (!recipientList.length || !recipientList.some(r => r.recipient_email)) {
      throw new Error('No valid recipients found. At least one recipient_email is required.');
    }

    console.log(`Processing ${recipientList.length} recipients for event: ${event_name}`);

    // Get template mapping for this event
    const { data: mapping, error: mappingError } = await supabase
      .from('event_email_mapping')
      .select('template_name')
      .eq('event_name', event_name)
      .eq('is_active', true)
      .single();

    if (mappingError || !mapping) {
      console.error('Event mapping error:', mappingError);
      throw new Error(`No active template mapping found for event: ${event_name}`);
    }

    console.log(`Using template: ${mapping.template_name}`);

    // Get the email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_template, content, is_active')
      .eq('template_name', mapping.template_name)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error(`Template ${mapping.template_name} not found or disabled`);
    }

    console.log('Template loaded successfully');

    // Create SMTP transporter
    const transporter = createSMTPTransporter();

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each recipient
    for (const recipient of recipientList) {
      if (!recipient.recipient_email) {
        console.warn('Skipping recipient without email address');
        errorCount++;
        results.push({
          email: 'unknown',
          status: 'error',
          error: 'Missing recipient_email'
        });
        continue;
      }

      try {
        // Merge common data with recipient-specific data
        const placeholderData = {
          ...commonData,
          ...recipient,
          current_year: new Date().getFullYear().toString(),
          current_date: new Date().toLocaleDateString(),
          platform_name: "TalentXcel",
          support_email: "support@talentxcel.in"
        };

        // Replace placeholders in subject and content
        const subject = replacePlaceholders(template.subject, placeholderData);
        const htmlContent = replacePlaceholders(
          template.html_template || template.content, 
          placeholderData
        );

        console.log(`Sending email to: ${recipient.recipient_email}`);

        // Send email
        await transporter.sendMail({
          from: Deno.env.get("SMTP_FROM_EMAIL") || "TalentXcel <noreply@talentxcel.in>",
          to: recipient.recipient_email,
          subject: subject,
          html: htmlContent,
        });

        successCount++;
        results.push({
          email: recipient.recipient_email,
          status: 'success'
        });

        console.log(`Email sent successfully to: ${recipient.recipient_email}`);

      } catch (emailError) {
        console.error(`Failed to send email to ${recipient.recipient_email}:`, emailError);
        errorCount++;
        results.push({
          email: recipient.recipient_email,
          status: 'error',
          error: emailError.message
        });
      }
    }

    // Close SMTP connection
    transporter.close();

    console.log(`Email processing completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Emails processed successfully`,
      stats: {
        total: recipientList.length,
        successful: successCount,
        failed: errorCount
      },
      results: results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-email-notification function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);