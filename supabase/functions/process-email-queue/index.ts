import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface QueuedEmail {
  id: string;
  to_email: string;
  subject: string;
  html_content: string;
  template_name: string;
  template_data: any;
  retry_count: number;
  max_retries: number;
}

async function sendEmailViaSendGrid(email: QueuedEmail): Promise<{ success: boolean; error?: string }> {
  if (!sendGridApiKey) {
    return { success: false, error: 'SendGrid API key not configured' };
  }

  try {
    console.log(`Sending email to ${email.to_email} with subject: ${email.subject}`);
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email.to_email }] }],
        from: { email: 'recruit@talentxcel.co.in', name: "TalentXcel" },
        subject: email.subject,
        content: [{ type: 'text/html', value: email.html_content }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`SendGrid error for ${email.id}:`, error);
      return { success: false, error: `SendGrid Error: ${error}` };
    }

    console.log(`Email ${email.id} sent successfully`);
    return { success: true };

  } catch (error) {
    console.error(`Error sending email ${email.id}:`, error);
    return { success: false, error: error.message };
  }
}

async function processEmailQueue(): Promise<{ processed: number; sent: number; failed: number }> {
  console.log('Processing email queue...');
  
  const { data: pendingEmails, error } = await supabase
    .from('email_queue_simple')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching pending emails:', error);
    return { processed: 0, sent: 0, failed: 0 };
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    console.log('No pending emails to process');
    return { processed: 0, sent: 0, failed: 0 };
  }

  const eligibleEmails = pendingEmails.filter(email => email.retry_count <= email.max_retries);
  
  if (eligibleEmails.length === 0) {
    console.log('No eligible emails to process (all have exceeded max retries)');
    return { processed: 0, sent: 0, failed: 0 };
  }

  console.log(`Found ${eligibleEmails.length} eligible emails to process`);
  
  let sentCount = 0;
  let failedCount = 0;

  for (const email of eligibleEmails) {
    const result = await sendEmailViaSendGrid(email);
    
    if (result.success) {
      const { error: updateError } = await supabase
        .from('email_queue_simple')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', email.id);

      if (updateError) {
        console.error(`Error updating email ${email.id} status:`, updateError);
      } else {
        sentCount++;
        console.log(`Email ${email.id} marked as sent`);
      }

    } else {
      const newRetryCount = email.retry_count + 1;
      const isFinalFailure = newRetryCount > email.max_retries;
      
      const { error: updateError } = await supabase
        .from('email_queue_simple')
        .update({
          status: isFinalFailure ? 'failed' : 'pending',
          retry_count: newRetryCount,
          error_message: result.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', email.id);

      if (updateError) {
        console.error(`Error updating email ${email.id} retry:`, updateError);
      } else {
        if (isFinalFailure) {
          failedCount++;
          console.log(`Email ${email.id} marked as failed after ${newRetryCount} retries`);
        } else {
          console.log(`Email ${email.id} retry count increased to ${newRetryCount}`);
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const processed = eligibleEmails.length;
  console.log(`Queue processing complete: ${processed} processed, ${sentCount} sent, ${failedCount} failed`);
  
  return { processed, sent: sentCount, failed: failedCount };
}

Deno.serve(async (req) => {
  console.log('=== Email Queue Processing Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  console.log('Timestamp:', new Date().toISOString());
  
  // Environment validation
  console.log('Environment check - SENDGRID_API_KEY exists:', !!sendGridApiKey);
  console.log('Environment check - SUPABASE_URL exists:', !!supabaseUrl);
  console.log('Environment check - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    console.log('Invalid HTTP method:', req.method);
    return new Response(JSON.stringify({
      success: false,
      error: `Method ${req.method} not allowed. Use POST to process email queue.`
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    let requestData = {};
    try {
      const body = await req.text();
      console.log('Request body received:', body ? 'YES' : 'NO');
      if (body && body.trim()) {
        requestData = JSON.parse(body);
        console.log('Parsed request data:', requestData);
      }
    } catch (parseError) {
      console.log('Request body parsing failed (proceeding anyway):', parseError.message);
    }

    console.log('Starting email queue processing...');
    const startTime = Date.now();
    
    // Process the email queue
    const result = await processEmailQueue();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    console.log('=== Processing Complete ===');
    console.log('Result:', result);
    console.log('Processing time:', processingTime, 'ms');
    
    const response = {
      success: true,
      message: `Email queue processed successfully. Processed: ${result.processed}, Sent: ${result.sent}, Failed: ${result.failed}`,
      stats: result,
      processingTime: processingTime,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('=== Email Queue Processing Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred while processing email queue',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
});