console.log('Email queue processor starting...');

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  
  // Get pending emails (filter where retry_count <= max_retries)
  const { data: pendingEmails, error } = await supabase
    .from('email_queue_simple')
    .select('*')
    .eq('status', 'pending')
    .filter('retry_count', 'lte', 3) // Default max retries is 3
    .order('created_at', { ascending: true })
    .limit(10); // Process up to 10 emails at a time

  if (error) {
    console.error('Error fetching pending emails:', error);
    return { processed: 0, sent: 0, failed: 0 };
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    console.log('No pending emails to process');
    return { processed: 0, sent: 0, failed: 0 };
  }

  console.log(`Found ${pendingEmails.length} pending emails`);
  
  let sentCount = 0;
  let failedCount = 0;

  for (const email of pendingEmails) {
    const result = await sendEmailViaSendGrid(email);
    
    if (result.success) {
      // Mark as sent
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
      // Increment retry count or mark as failed
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

    // Add a small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const processed = pendingEmails.length;
  console.log(`Queue processing complete: ${processed} processed, ${sentCount} sent, ${failedCount} failed`);
  
  return { processed, sent: sentCount, failed: failedCount };
}

Deno.serve(async (req) => {
  console.log('Email queue processor request received:', req.method, req.url);
  console.log('Environment check - SENDGRID_API_KEY exists:', !!sendGridApiKey);
  console.log('Environment check - SUPABASE_URL exists:', !!supabaseUrl);
  console.log('Environment check - SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body if present
    let requestData = {};
    if (req.method === 'POST') {
      try {
        const body = await req.text();
        if (body) {
          requestData = JSON.parse(body);
        }
      } catch (parseError) {
        console.log('No valid JSON body, proceeding with default processing');
      }
    }

    console.log('Processing email queue with data:', requestData);
    const result = await processEmailQueue();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Email queue processed successfully',
      stats: result
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email queue processing error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});