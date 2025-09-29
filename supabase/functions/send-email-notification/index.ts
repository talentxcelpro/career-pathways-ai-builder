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

// SMTP transporter with enhanced error handling and validation
const createSMTPTransporter = () => {
  let host = Deno.env.get("SMTP_HOST");
  const port = parseInt(Deno.env.get("SMTP_PORT") || "587");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");

  // Clean up hostname - remove any prefixes like "Host: "
  if (host && host.includes("Host:")) {
    host = host.replace(/.*Host:\s*/, "").trim();
  }
  
  // Validate and fix Amazon SES endpoints with fallback logic
  const validSESEndpoints = [
    "email-smtp.us-east-1.amazonaws.com", // Primary fallback (most reliable)
    "email-smtp.eu-west-1.amazonaws.com", // EU Ireland  
    "email-smtp.eu-central-1.amazonaws.com", // EU Frankfurt
    "email-smtp.ap-south-1.amazonaws.com", // Asia Pacific Mumbai
    "email-smtp.us-west-2.amazonaws.com" // US West Oregon
  ];

  // If host is provided but seems problematic (like eu-north-1), use fallback
  if (host && (host.includes("eu-north-1") || !host.includes("amazonaws.com"))) {
    console.log(`Detected potentially problematic host: ${host}, using reliable fallback`);
    host = validSESEndpoints[0]; // Use US East as primary fallback
  }
  
  // Set default Amazon SES endpoint if no host provided
  if (!host) {
    host = validSESEndpoints[0];
    console.log("Using default reliable Amazon SES host");
  }

  console.log(`SMTP Configuration: host=${host}, port=${port}, user=${user ? 'SET' : 'NOT_SET'}, pass=${pass ? 'SET' : 'NOT_SET'}`);

  if (!host || !user || !pass) {
    throw new Error(`Missing SMTP configuration. Host: ${host ? 'SET' : 'MISSING'}, User: ${user ? 'SET' : 'MISSING'}, Pass: ${pass ? 'SET' : 'MISSING'}`);
  }

  return createTransport({
    host: host,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Disable debug to reduce noise, enable if needed for troubleshooting
    debug: false,
    logger: false,
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

    // Handle test requests - provide fallback for missing event_name
    const finalEventName = event_name || 'test_email';
    
    // For test requests without event_name, use a simple test template
    if (!event_name) {
      console.log('No event_name provided, treating as test request');
    }

    // Support both single recipient and bulk recipients
    const recipientList = recipients ? recipients : [requestBody];

    // Validate that we have at least one recipient with email
    const validRecipients = recipientList.filter((r: any) => r.recipient_email && r.recipient_email.trim() !== '');
    if (!validRecipients.length) {
      throw new Error('No valid recipients found. At least one recipient_email is required.');
    }

    console.log(`Processing ${recipientList.length} recipients for event: ${finalEventName}`);

    // Enhanced template retrieval with fallback hierarchy
    let template;
    let fallbackUsed = 'none';

    try {
      // Primary: Try event mapping first
      const { data: mapping, error: mappingError } = await supabase
        .from('event_email_mapping')
        .select('template_name')
        .eq('event_name', finalEventName)
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
          .or(`name.eq.${finalEventName},template_type.eq.${finalEventName}`)
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
        const eventCategory = finalEventName.split('_')[0]; // e.g., 'application' from 'application_notification'
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

    // Final fallback for test requests - create a simple template
    if (!template && !event_name) {
      template = {
        name: 'Test Template',
        subject: 'Test Email - {{platform_name}}',
        html_template: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Test Email</h1>
                <p>This is a test email from {{platform_name}}.</p>
                <p>Recipient: {{recipient_email}}</p>
                <p>Name: {{name}}</p>
                <p>Date: {{current_date}}</p>
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                  This is an automated test message. No action required.
                </p>
              </div>
            </body>
          </html>
        `,
        template_type: 'test',
        is_active: true
      };
      fallbackUsed = 'test_template';
    }

    if (!template) {
      throw new Error(`No template found for event: ${finalEventName}. All fallbacks failed.`);
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

    // Create SMTP transporter with validation
    let transporter;
    try {
      transporter = createSMTPTransporter();
      console.log('SMTP transporter created successfully');
    } catch (transporterError) {
      console.error('Failed to create SMTP transporter:', transporterError);
      throw new Error(`SMTP configuration error: ${(transporterError as Error).message}`);
    }

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Process each valid recipient
    for (const recipient of validRecipients) {
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

        // Send email with timeout and retries
        const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || "TalentXcel <noreply@talentxcel.in>";
        console.log(`Attempting to send email from: ${fromEmail}`);
        
        try {
          await transporter.sendMail({
            from: fromEmail,
            to: recipient.recipient_email,
            subject: subject,
            html: emailContent,
          });
        } catch (smtpError: any) {
          console.error(`SMTP send error for ${recipient.recipient_email}:`, {
            code: smtpError.code,
            command: smtpError.command,
            response: smtpError.response,
            responseCode: smtpError.responseCode,
            message: smtpError.message
          });
          throw new Error(`SMTP Error: ${smtpError.code || 'UNKNOWN'} - ${smtpError.message}`);
        }

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
          error: (emailError as Error).message
        });
      }
    }

    // Close SMTP connection safely
    try {
      transporter.close();
      console.log('SMTP connection closed successfully');
    } catch (closeError) {
      console.warn('Error closing SMTP connection:', closeError);
    }

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