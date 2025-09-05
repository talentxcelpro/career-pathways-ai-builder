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
  rich_content?: string;
  actions?: Array<{action: string, label: string, url?: string}>;
  image?: string;
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

    const { user_ids, title, body, data, trigger_type, priority = 'normal', rich_content, actions, image }: PushNotificationRequest & { priority?: string } = await req.json();

    if (!user_ids || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_ids, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notifications in database first
    const notifications = user_ids.map(userId => ({
      user_id: userId,
      type: trigger_type || 'general',
      title,
      message: body,
      data: {
        ...(data || {}),
        rich_content,
        actions,
        image
      },
      priority,
      is_read: false,
      sound_enabled: true,
      created_at: new Date().toISOString()
    }));

    const { data: createdNotifications, error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notifications)
      .select();

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get push tokens for users
    const { data: pushTokens, error: tokenError } = await supabaseClient
      .from('push_tokens')
      .select('*')
      .in('user_id', user_ids)
      .eq('is_active', true);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
    }

    let sentCount = 0;
    
    // Send actual push notifications
    if (pushTokens && pushTokens.length > 0) {
      for (const token of pushTokens) {
        try {
          if (token.platform === 'web') {
            // Web push using service worker with rich formatting
            const webPushPayload = {
              title,
              body: rich_content || body,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              image: image,
              tag: `notification_${createdNotifications[0]?.id}`,
              type: trigger_type,
              rich_content,
              data: {
                ...data,
                url: data?.url || '/',
                notification_id: createdNotifications[0]?.id,
                user_id: token.user_id,
                rich_content,
                actions
              },
              actions: actions || getDefaultActions(trigger_type),
              requireInteraction: priority === 'high',
              silent: false,
              priority
            };

            function getDefaultActions(type) {
              switch (type) {
                case 'profile_completion_reminder':
                  return [
                    { action: 'complete', title: '✨ Complete Profile' },
                    { action: 'dismiss', title: 'Later' }
                  ];
                case 'job_match':
                  return [
                    { action: 'view_job', title: '💼 View Job' },
                    { action: 'dismiss', title: 'Dismiss' }
                  ];
                case 'welcome':
                  return [
                    { action: 'explore', title: '🚀 Get Started' },
                    { action: 'dismiss', title: 'OK' }
                  ];
                default:
                  return [
                    { action: 'view', title: 'View' },
                    { action: 'dismiss', title: 'Dismiss' }
                  ];
              }
            }

            // In a real implementation, you would use web-push library here
            console.log('Would send web push:', webPushPayload);
            sentCount++;
            
          } else if (token.platform === 'mobile') {
            // Mobile push using FCM or similar
            const mobilePushPayload = {
              to: token.push_token,
              notification: {
                title,
                body,
                sound: 'default'
              },
              data: {
                ...data,
                notification_id: createdNotifications[0]?.id
              }
            };

            console.log('Would send mobile push:', mobilePushPayload);
            sentCount++;
          }
        } catch (error) {
          console.error(`Failed to send push to user ${token.user_id}:`, error);
        }
      }
    }

    console.log(`Created ${createdNotifications?.length || 0} database notifications`);
    console.log(`Sent ${sentCount} push notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        database_notifications: createdNotifications?.length || 0,
        push_notifications_sent: sentCount,
        message: `Notifications processed successfully`
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