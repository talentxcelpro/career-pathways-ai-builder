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
    console.log('Unified email notification started with template validation...');
    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody));

    const { event_name, recipients, ...commonData } = requestBody;

    // Template validation middleware - ensure only templates are used
    if (!event_name) {
      throw new Error('event_name is required for template-based emails');
    }

    // Support both single recipient and bulk recipients
    const recipientList = recipients ? recipients : [requestBody];

    // Validate that we have at least one recipient with email
    if (!recipientList.length || !recipientList.some(r => r.recipient_email)) {
      throw new Error('No valid recipients found. At least one recipient_email is required.');
    }

    console.log(`Processing ${recipientList.length} recipients for event: ${event_name}`);

    // Enhanced template retrieval with fallback hierarchy
    let template;
    let fallbackUsed = 'none';

    try {
      // Primary: Try event mapping first
      const { data: mapping, error: mappingError } = await supabase
        .from('event_email_mapping')
        .select('template_name')
        .eq('event_name', event_name)
        .eq('is_active', true)
        .single();

      if (mapping && !mappingError) {
        const { data: primaryTemplate, error: primaryError } = await supabase
          .from('email_templates')
          .select('subject, html_template, content, is_active, name, template_type')
          .eq('name', mapping.template_name)
          .eq('is_active', true)
          .single();

        if (primaryTemplate && !primaryError) {
          template = primaryTemplate;
          fallbackUsed = 'primary_mapping';
        }
      }
    } catch (error) {
      console.log('Primary template mapping failed, trying fallbacks...');
    }

    // Fallback 1: Direct template lookup by event name
    if (!template) {
      try {
        const { data: directTemplate } = await supabase
          .from('email_templates')
          .select('subject, html_template, content, is_active, name, template_type')
          .or(`name.eq.${event_name},template_type.eq.${event_name}`)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (directTemplate) {
          template = directTemplate;
          fallbackUsed = 'direct_lookup';
        }
      } catch (error) {
        console.log('Direct template lookup failed, trying base template...');
      }
    }

    // Fallback 2: Base template for event category
    if (!template) {
      try {
        const eventCategory = event_name.split('_')[0]; // e.g., 'application' from 'application_notification'
        const { data: baseTemplate } = await supabase
          .from('email_templates')
          .select('subject, html_template, content, is_active, name, template_type')
          .eq('name', `${eventCategory}_base_template`)
          .eq('is_active', true)
          .single();

        if (baseTemplate) {
          template = baseTemplate;
          fallbackUsed = 'base_template';
        }
      } catch (error) {
        console.log('Base template failed, using system default...');
      }
    }

    // Fallback 3: System default template
    if (!template) {
      try {
        const { data: systemTemplate } = await supabase
          .from('email_templates')
          .select('subject, html_template, content, is_active, name, template_type')
          .eq('name', 'System Default Template')
          .eq('is_active', true)
          .single();

        if (systemTemplate) {
          template = systemTemplate;
          fallbackUsed = 'system_default';
        }
      } catch (error) {
        console.error('All template fallbacks failed:', error);
      }
    }

    if (!template) {
      throw new Error(`No template found for event: ${event_name}. All fallbacks failed.`);
    }

    console.log(`Using template: ${template.name} (fallback: ${fallbackUsed})`);

    // Enhanced template validation with rich HTML requirements
    const htmlContent = template.html_template || template.content;
    if (!htmlContent || !htmlContent.includes('<') || !htmlContent.includes('>')) {
      throw new Error(`Template ${template.name} must contain valid HTML content. Plain text templates are strictly prohibited.`);
    }

    // Advanced HTML structure validation for rich templates
    const requiredElements = ['<html', '<body', '<div', '<table', '<p>', '<span'];
    const hasRequiredStructure = requiredElements.some(element => htmlContent.includes(element));
    
    if (!hasRequiredStructure) {
      throw new Error(`Template ${template.name} must contain proper HTML structure with elements like html, body, div, table, or paragraph tags.`);
    }

    // Check for email-optimized features
    const emailOptimizations = {
      hasTableLayout: htmlContent.includes('<table'),
      hasInlineStyles: htmlContent.includes('style='),
      hasResponsiveFeatures: htmlContent.includes('@media') || htmlContent.includes('max-width'),
      hasImageOptimization: htmlContent.includes('alt=')
    };

    console.log('Template validation passed - enhanced HTML template detected:', emailOptimizations);

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
        const emailContent = replacePlaceholders(htmlContent, placeholderData);

        console.log(`Sending email to: ${recipient.recipient_email}`);

        // Send email
        await transporter.sendMail({
          from: Deno.env.get("SMTP_FROM_EMAIL") || "TalentXcel <noreply@talentxcel.in>",
          to: recipient.recipient_email,
          subject: subject,
          html: emailContent,
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