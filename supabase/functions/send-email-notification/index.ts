import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { SESClient, SendEmailCommand, GetSendQuotaCommand, GetAccountSendingEnabledCommand } from "https://esm.sh/@aws-sdk/client-ses@3.490.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// AWS SES Client with multi-region fallback
const createSESClient = (region = 'us-east-1') => {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(`Missing AWS credentials. AccessKey: ${accessKeyId ? 'SET' : 'MISSING'}, SecretKey: ${secretAccessKey ? 'SET' : 'MISSING'}`);
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Function to check SES quota and sending status
const checkSESQuota = async (sesClient: SESClient) => {
  try {
    // Check if account is enabled for sending
    const enabledCommand = new GetAccountSendingEnabledCommand({});
    const enabledResponse = await sesClient.send(enabledCommand);
    
    if (!enabledResponse.Enabled) {
      throw new Error('AWS SES account is not enabled for sending');
    }

    // Get sending quota
    const quotaCommand = new GetSendQuotaCommand({});
    const quotaResponse = await sesClient.send(quotaCommand);
    
    const quota = {
      maxSendRate: quotaResponse.MaxSendRate || 0,
      max24HourSend: quotaResponse.Max24HourSend || 0,
      sentLast24Hours: quotaResponse.SentLast24Hours || 0,
      remainingQuota: (quotaResponse.Max24HourSend || 0) - (quotaResponse.SentLast24Hours || 0)
    };

    console.log('SES Quota Status:', quota);

    if (quota.remainingQuota <= 0) {
      throw new Error(`SES daily quota exceeded. Used: ${quota.sentLast24Hours}/${quota.max24HourSend}`);
    }

    return quota;
  } catch (error) {
    console.error('SES quota check failed:', error);
    throw error;
  }
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

// Enhanced SES sending with configuration sets and tagging
const sendEmailWithSES = async (sesClient: SESClient, emailData: any) => {
  const sendEmailCommand = new SendEmailCommand({
    Source: Deno.env.get("SES_FROM_EMAIL") || "TalentXcel <noreply@talentxcel.in>",
    Destination: {
      ToAddresses: [emailData.toEmail],
    },
    Message: {
      Subject: {
        Data: emailData.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: emailData.htmlContent,
          Charset: "UTF-8",
        },
      },
    },
    // Add configuration set if available for tracking
    ...(Deno.env.get("SES_CONFIGURATION_SET") && {
      ConfigurationSetName: Deno.env.get("SES_CONFIGURATION_SET")
    }),
    // Add tags for better analytics
    Tags: [
      {
        Name: "Source",
        Value: "TalentXcel-Platform"
      },
      {
        Name: "EventType",
        Value: emailData.eventType || "notification"
      },
      {
        Name: "Environment",
        Value: Deno.env.get("ENVIRONMENT") || "production"
      }
    ],
  });

  return await sesClient.send(sendEmailCommand);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AWS SES email notification started...');
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

    // Create SES client with primary region
    let sesClient;
    let currentRegion = 'us-east-1';
    
    try {
      sesClient = createSESClient(currentRegion);
      
      // Check SES quota before proceeding
      await checkSESQuota(sesClient);
      console.log('SES quota check passed');
      
    } catch (regionError) {
      console.log(`SES failed in ${currentRegion}, trying fallback region...`);
      try {
        currentRegion = 'eu-west-1';
        sesClient = createSESClient(currentRegion);
        await checkSESQuota(sesClient);
        console.log(`SES fallback to ${currentRegion} successful`);
      } catch (fallbackError) {
        console.error('All SES regions failed:', fallbackError);
        throw new Error(`SES unavailable in all regions. Last error: ${(fallbackError as Error).message}`);
      }
    }

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
                <h1 style="color: #333;">AWS SES Test Email</h1>
                <p>This is a test email from {{platform_name}} via Amazon SES.</p>
                <p>Recipient: {{recipient_email}}</p>
                <p>Name: {{name}}</p>
                <p>Date: {{current_date}}</p>
                <p>Region: ${currentRegion}</p>
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                  This is an automated test message sent via AWS SES. No action required.
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
      throw new Error(`Template ${template.name} must contain valid HTML content. Plain text templates are not supported.`);
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

        console.log(`Sending email via SES to: ${recipient.recipient_email}`);

        // Send email with SES
        const sesResult = await sendEmailWithSES(sesClient, {
          toEmail: recipient.recipient_email,
          subject: subject,
          htmlContent: emailContent,
          eventType: finalEventName
        });

        const messageId = sesResult.MessageId;
        console.log(`SES email sent successfully to: ${recipient.recipient_email}, MessageId: ${messageId}`);

        successCount++;
        results.push({
          email: recipient.recipient_email,
          status: 'success',
          messageId: messageId,
          region: currentRegion
        });

        // Log SES success for monitoring
        try {
          await supabase
            .from('ses_delivery_logs')
            .insert({
              message_id: messageId,
              recipient_email: recipient.recipient_email,
              event_type: finalEventName,
              template_name: template.name,
              region: currentRegion,
              status: 'sent',
              sent_at: new Date().toISOString()
            });
          console.log('SES delivery log created');
        } catch (logError) {
          console.warn('Failed to create SES delivery log:', logError);
        }

      } catch (emailError: any) {
        console.error(`Failed to send SES email to ${recipient.recipient_email}:`, emailError);
        
        // Handle specific SES errors
        let errorMessage = emailError.message;
        if (emailError.name === 'MessageRejected') {
          errorMessage = `Email rejected: ${emailError.message}`;
        } else if (emailError.name === 'SendingPausedException') {
          errorMessage = 'SES sending is paused for this account';
        } else if (emailError.name === 'MailFromDomainNotVerifiedException') {
          errorMessage = 'SES domain not verified';
        }

        errorCount++;
        results.push({
          email: recipient.recipient_email,
          status: 'error',
          error: errorMessage,
          sesError: emailError.name
        });
      }
    }

    console.log(`SES email processing completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Emails processed successfully via AWS SES`,
      stats: {
        total: recipientList.length,
        successful: successCount,
        failed: errorCount,
        region: currentRegion
      },
      results: results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in SES email notification function:", error);
    
    // Log critical SES errors for monitoring
    try {
      await supabase
        .from('ses_error_logs')
        .insert({
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          error_details: JSON.stringify(error),
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log SES error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.name
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);