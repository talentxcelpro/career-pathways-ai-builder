import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();
    
    if (!emails || !Array.isArray(emails)) {
      return new Response(
        JSON.stringify({ error: 'emails array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing bulk outreach for ${emails.length} emails`);

    // Get current user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile for sender info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const senderName = profile?.full_name || 'Hiring Manager';
    const senderEmail = profile?.email || user.email;

    // For each email, create a simple log (in production, integrate with actual email service)
    const emailResults = [];
    
    for (const email of emails) {
      try {
        // In production, you would integrate with services like:
        // - SendGrid
        // - Mailgun  
        // - AWS SES
        // - Resend
        
        // For now, we'll log the outreach attempt
        const { error: logError } = await supabase
          .from('candidate_communications')
          .insert({
            sender_id: user.id,
            recipient_email: email.to,
            subject: email.subject,
            message: email.message,
            communication_type: 'outreach_email',
            status: 'sent',
            metadata: {
              candidate_name: email.candidateName,
              sender_name: senderName,
              sender_email: senderEmail
            }
          });

        if (logError) {
          console.error('Failed to log email:', logError);
        }

        emailResults.push({
          to: email.to,
          status: 'simulated', // In production this would be 'sent' or 'failed'
          candidate: email.candidateName
        });

        console.log(`Simulated email sent to ${email.candidateName} (${email.to})`);
        
      } catch (error) {
        console.error(`Failed to send email to ${email.to}:`, error);
        emailResults.push({
          to: email.to,
          status: 'failed',
          error: error.message,
          candidate: email.candidateName
        });
      }
    }

    const successCount = emailResults.filter(r => r.status === 'simulated').length;
    const failureCount = emailResults.filter(r => r.status === 'failed').length;

    console.log(`Bulk outreach completed: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Outreach emails processed: ${successCount} sent, ${failureCount} failed`,
        results: emailResults,
        summary: {
          total: emails.length,
          successful: successCount,
          failed: failureCount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Bulk outreach error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send bulk outreach',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})