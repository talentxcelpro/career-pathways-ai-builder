import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_ids: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger_type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { user_ids, title, body, data, trigger_type }: PushNotificationRequest = await req.json();

    if (!user_ids || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_ids, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user push tokens and notification preferences
    const { data: userTokens, error: tokenError } = await supabaseClient
      .from('user_push_tokens')
      .select(`
        user_id,
        push_token,
        platform,
        email_notification_settings (*)
      `)
      .in('user_id', user_ids)
      .eq('is_active', true);

    if (tokenError) {
      console.error('Error fetching user tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter users based on their notification preferences
    const filteredTokens = userTokens?.filter(token => {
      const settings = token.email_notification_settings?.[0];
      if (!settings) return true; // Default to sending if no settings

      // Check if user wants push notifications for this trigger type
      switch (trigger_type) {
        case 'welcome_email':
          return settings.push_on_welcome;
        case 'application_confirmation':
          return settings.push_on_application;
        case 'connection_request':
          return settings.push_on_connection;
        case 'job_recommendation':
          return settings.push_on_job_match;
        case 'interview_scheduled':
          return settings.push_on_interview;
        case 'team_invite':
          return settings.push_on_team_invite;
        case 'password_reset':
          return settings.push_on_password_reset;
        case 'monthly_digest':
          return settings.push_on_monthly_digest;
        default:
          return true;
      }
    }) || [];

    console.log(`Sending push notifications to ${filteredTokens.length} users`);

    // For now, we'll log the notifications that would be sent
    // In a real implementation, you would use FCM for Android and APNS for iOS
    const notifications = filteredTokens.map(token => ({
      to: token.push_token,
      title,
      body,
      data: {
        ...data,
        user_id: token.user_id
      },
      platform: token.platform
    }));

    // Store notification history
    const { error: historyError } = await supabaseClient
      .from('push_notification_history')
      .insert(
        notifications.map(notification => ({
          user_id: notification.data.user_id,
          title,
          body,
          data: notification.data,
          platform: notification.platform,
          trigger_type: trigger_type || 'manual',
          status: 'sent'
        }))
      );

    if (historyError) {
      console.error('Error storing notification history:', historyError);
    }

    console.log('Push notifications prepared:', notifications);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notifications.length,
        message: `Push notifications prepared for ${notifications.length} users`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});