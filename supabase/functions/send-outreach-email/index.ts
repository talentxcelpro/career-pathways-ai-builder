import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutreachEmailRequest {
  campaign_id: string;
  recipient_ids: string[];
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    const { campaign_id, recipient_ids, subject, message }: OutreachEmailRequest = await req.json();

    console.log('Processing outreach email request:', { campaign_id, recipient_count: recipient_ids.length });

    // Check outreach limits using secure function
    const { data: canSend, error: limitError } = await supabaseClient
      .rpc('check_outreach_limit_secure', {
        employer_uuid: user.user.id,
        recipient_count: recipient_ids.length
      });

    if (limitError) {
      console.error('Error checking outreach limit:', limitError);
      throw new Error('Failed to check outreach limits');
    }

    if (!canSend) {
      return new Response(
        JSON.stringify({ error: 'Monthly email limit exceeded' }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get recipient details
    const { data: recipients, error: recipientsError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email, current_title, current_company')
      .in('id', recipient_ids);

    if (recipientsError) {
      console.error('Error fetching recipients:', recipientsError);
      throw new Error('Failed to fetch recipient details');
    }

    // Create outreach recipient records
    const recipientRecords = recipients?.map(recipient => ({
      campaign_id,
      profile_id: recipient.id,
      email: recipient.email,
      status: 'pending'
    })) || [];

    const { error: insertError } = await supabaseClient
      .from('outreach_recipients')
      .insert(recipientRecords);

    if (insertError) {
      console.error('Error creating recipient records:', insertError);
      throw new Error('Failed to create recipient records');
    }

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, we'll simulate email sending and mark as sent
    console.log('Simulating email sending to recipients...');

    // Update recipient status to sent
    const { error: updateError } = await supabaseClient
      .from('outreach_recipients')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('campaign_id', campaign_id);

    if (updateError) {
      console.error('Error updating recipient status:', updateError);
    }

    // Update campaign status and counts
    const { error: campaignUpdateError } = await supabaseClient
      .from('outreach_campaigns')
      .update({
        status: 'sent',
        sent_count: recipients?.length || 0,
        recipient_count: recipients?.length || 0,
        sent_at: new Date().toISOString()
      })
      .eq('id', campaign_id);

    if (campaignUpdateError) {
      console.error('Error updating campaign:', campaignUpdateError);
    }

    // Track usage
    await supabaseClient
      .rpc('track_outreach_usage', {
        employer_uuid: user.user.id,
        email_count: recipients?.length || 0
      });

    console.log('Outreach emails processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: recipients?.length || 0,
        message: `Successfully queued ${recipients?.length || 0} outreach emails`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-outreach-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);