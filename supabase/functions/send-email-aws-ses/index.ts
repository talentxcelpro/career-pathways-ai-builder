// AWS SES Email Sending Function for TalentXcel
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.490.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize AWS SES Client
let sesClient: SESClient;

try {
  sesClient = new SESClient({
    region: Deno.env.get('AWS_REGION') || "eu-north-1",
    credentials: {
      accessKeyId: Deno.env.get("SES_ACCESS_KEY_ID") || "",
      secretAccessKey: Deno.env.get("SES_SECRET_ACCESS_KEY") || "",
    }
  });
  console.log('✅ SES Client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize SES client:', error);
}

// Initialize Supabase client for logging
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template?: string;
  templateData?: Record<string, any>;
  priority?: 'high' | 'medium' | 'low';
  trackingPixel?: boolean;
  dryRun?: boolean;
}

Deno.serve(async (req) => {
  console.log('🚀 AWS SES Email Function Starting...');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Processing email request via AWS SES...');
    console.log('📊 Request method:', req.method);
    console.log('📊 Request headers:', Object.fromEntries(req.headers.entries()));
    
    const requestBody = await req.text();
    console.log('📏 Request body size:', requestBody.length, 'bytes')
    console.log('📄 Raw request body:', requestBody)
    
    // Validate request body is not empty
    if (!requestBody || requestBody.trim() === '') {
      console.error('❌ Empty request body received')
      return new Response(JSON.stringify({
        success: false,
        error: 'Empty request body',
        details: 'No email data provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Parse JSON with error handling
    let emailRequest: EmailRequest
    try {
      emailRequest = JSON.parse(requestBody)
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      console.error('❌ Failed body content:', requestBody)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        details: parseError.message,
        receivedBody: requestBody.substring(0, 100)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const { to, subject, html, template, templateData, priority = 'medium', trackingPixel = true, dryRun = false } = emailRequest
    
    // Handle dry run for health checks
    if (dryRun) {
      console.log('🧪 Dry run mode - skipping actual email send')
      return new Response(JSON.stringify({
        success: true,
        message: 'Dry run successful - email function is healthy',
        dryRun: true,
        provider: 'aws_ses'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Validate required fields with detailed feedback
    const missingFields = [];
    if (!to) missingFields.push('to');
    if (!subject) missingFields.push('subject');
    if (!html) missingFields.push('html');
    
    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: { to: !!to, subject: !!subject, html: !!html }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.log('❌ Invalid email format:', to);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add tracking pixel if enabled
    let finalHtml = html;
    const trackingId = crypto.randomUUID();
    
    if (trackingPixel) {
      const trackingPixelHtml = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
      finalHtml = html + trackingPixelHtml;
    }

    // Create plain text version from HTML
    const plainText = html.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, ' ').trim();

    // Prepare SES email command
    const command = new SendEmailCommand({
      Source: "no-reply@talentxcel.in",
      Destination: { 
        ToAddresses: [to] 
      },
      Message: {
        Subject: { 
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: { 
            Data: finalHtml,
            Charset: 'UTF-8'
          },
          Text: { 
            Data: plainText,
            Charset: 'UTF-8'
          }
        }
      },
      Tags: [
        {
          Name: 'source',
          Value: 'talentxcel'
        },
        {
          Name: 'priority',
          Value: priority
        },
        ...(template ? [{
          Name: 'template',
          Value: template
        }] : [])
      ]
    });

    console.log('📤 Sending email via AWS SES to:', to);
    console.log('📋 Subject:', subject);
    
    // Check if SES client is initialized
    if (!sesClient) {
      throw new Error('SES client not initialized. Check AWS credentials.');
    }
    
    // Send email via AWS SES
    const startTime = Date.now();
    const result = await sesClient.send(command);
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Email sent successfully via AWS SES');
    console.log('📊 SES Response Time:', responseTime + 'ms');
    console.log('🆔 SES Message ID:', result.MessageId);

    // Log email delivery event
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          message_id: result.MessageId,
          email_address: to,
          subject: subject,
          template_name: template,
          template_data: templateData,
          status: 'sent',
          provider: 'aws_ses',
          response_time_ms: responseTime,
          tracking_id: trackingPixel ? trackingId : null,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.log('⚠️ Failed to log email delivery event:', logError);
      // Don't fail the email send if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully via AWS SES",
        messageId: result.MessageId,
        provider: 'aws_ses',
        responseTime: responseTime,
        trackingId: trackingPixel ? trackingId : null
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('❌ AWS SES email error:', error);
    
    // Log failed delivery attempt
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          email_address: 'unknown',
          subject: 'Failed email',
          status: 'failed',
          provider: 'aws_ses',
          error_message: error.message,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.log('⚠️ Failed to log email error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        provider: 'aws_ses'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});